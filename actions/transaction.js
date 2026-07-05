"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import {
  getGeminiFriendlyError,
  isGeminiModelError,
  isGeminiTemporaryError,
} from "@/lib/gemini-errors";

const DEFAULT_RECEIPT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))];
}

function getReceiptModels() {
  const configuredFallbacks =
    process.env.GEMINI_RECEIPT_FALLBACK_MODELS?.split(",") || [];

  return uniqueValues([
    process.env.GEMINI_RECEIPT_MODEL,
    process.env.GEMINI_MODEL,
    ...configuredFallbacks,
    ...DEFAULT_RECEIPT_MODELS,
  ]);
}

function parseReceiptResponse(text) {
  let data;

  try {
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    data = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedText);
  } catch {
    throw new Error("Gemini returned an unreadable receipt response");
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error("No receipt details found in the image");
  }

  const amount = parseFloat(data.amount);
  const date = new Date(data.date);

  if (!Number.isFinite(amount) || Number.isNaN(date.getTime())) {
    throw new Error("Receipt data is incomplete");
  }

  return {
    amount,
    date,
    description: data.description || data.merchantName || "Receipt purchase",
    category: data.category || "other-expense",
    merchantName: data.merchantName || "",
  };
}

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");


    const req = await request();


    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }


    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;


    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);
    revalidatePath("/insights");

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");


    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");


    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;


    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });


      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);
    revalidatePath("/insights");

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}


export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}


export async function scanReceipt(file) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is missing");
    }

    if (!file?.type?.startsWith("image/")) {
      throw new Error("Please upload an image receipt");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size should be less than 5MB");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");
    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )

      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If it is not a receipt, return an empty object.
    `;

    let lastGeminiError = null;

    for (const modelName of getReceiptModels()) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const result = await model.generateContent([
          {
            inlineData: {
              data: base64String,
              mimeType: file.type,
            },
          },
          prompt,
        ]);

        const response = await result.response;
        return {
          success: true,
          data: parseReceiptResponse(response.text()),
        };
      } catch (error) {
        lastGeminiError = error;

        if (isGeminiTemporaryError(error) || isGeminiModelError(error)) {
          continue;
        }

        throw error;
      }
    }

    if (lastGeminiError) {
      throw new Error(getGeminiFriendlyError(lastGeminiError, "Receipt scan"));
    }

    throw new Error("Receipt scan could not start");
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to scan receipt",
    };
  }
}

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

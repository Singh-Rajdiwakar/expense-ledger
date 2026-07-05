export function isGeminiQuotaError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    message.includes("429") ||
    message.includes("too many requests") ||
    message.includes("quota exceeded") ||
    message.includes("rate limit")
  );
}

export function isGeminiTemporaryError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    isGeminiQuotaError(error) ||
    message.includes("503") ||
    message.includes("service unavailable") ||
    message.includes("high demand")
  );
}

export function isGeminiModelError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return message.includes("not found") || message.includes("model");
}

export function isGeminiAuthError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    message.includes("api key") ||
    message.includes("permission") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("invalid")
  );
}

export function getGeminiFriendlyError(error, feature = "Gemini AI") {
  if (isGeminiQuotaError(error)) {
    return `${feature} could not complete because the Gemini free quota has been reached. Please try again after the quota resets, enable billing, or use another API key.`;
  }

  if (isGeminiTemporaryError(error)) {
    return `${feature} could not complete because Gemini is temporarily busy. Please try again in a few minutes.`;
  }

  if (isGeminiAuthError(error)) {
    return `${feature} could not complete because the Gemini API key is invalid or does not have access. Please check the API key in .env.local.`;
  }

  if (isGeminiModelError(error)) {
    return `${feature} could not complete because the selected Gemini model is unavailable for this API key. Please update GEMINI_RECEIPT_MODEL in .env.local or try another Gemini API key.`;
  }

  return `${feature} could not complete. Please check the receipt image and Gemini API key, then try again.`;
}

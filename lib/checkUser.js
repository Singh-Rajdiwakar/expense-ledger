import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {








    let loggedInUser = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });

    if (loggedInUser) {

      loggedInUser = await db.user.update({
        where: {
          id: loggedInUser.id,
        },
        data: {
          clerkUserId: user.id,
        },
      });
    }


    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    throw new Error(error.message || "Failed to sync user profile");
  }
};

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "./lib/env";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
  "/insights(.*)",
  "/notifications(.*)",
]);

const localMiddleware = (req) => {
  if (isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
};


const clerk = isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      const { userId } = await auth();

      if (!userId && isProtectedRoute(req)) {
        const { redirectToSignIn } = await auth();
        return redirectToSignIn();
      }

      return NextResponse.next();
    })
  : localMiddleware;


export default clerk;

export const config = {
  matcher: [

    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    "/(api|trpc)(.*)",
  ],
};

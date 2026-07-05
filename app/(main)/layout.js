import React from "react";
import { checkUser } from "@/lib/checkUser";
import { isClerkConfigured } from "@/lib/env";

const MainLayout = async ({ children }) => {
  if (isClerkConfigured) {
    await checkUser();
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {children}
    </div>
  );
};

export default MainLayout;

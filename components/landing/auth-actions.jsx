"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  Menu,
  PenBox,
  X,
} from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { navItems } from "./nav-items";

export function LandingAuthActions({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton forceRedirectUrl="/dashboard">
          <Button
            variant="outline"
            className="h-11 border-[#E2E8F0] bg-white px-4 text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton forceRedirectUrl="/dashboard">
          <Button className="h-11 bg-[#13B8B5] px-4 text-white shadow-[0_10px_22px_rgba(19,184,181,0.22)] hover:-translate-y-0.5 hover:bg-[#0EA5A4]">
            {compact ? "Create" : "Create Free Account"}
            <ArrowRight className="size-4" />
          </Button>
        </SignUpButton>
      </SignedOut>

      <SignedIn>
        <Button asChild variant="outline" className="h-11 bg-white px-4">
          <Link href="/dashboard">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </Button>
        {!compact && (
          <Button asChild className="h-11 bg-[#13B8B5] px-4 text-white hover:bg-[#0EA5A4]">
            <Link href="/transaction/create">
              <PenBox className="size-4" />
              Add Transaction
            </Link>
          </Button>
        )}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-10 rounded-full border-2 border-white shadow-sm",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}

export function CtaButtons({ align = "left" }) {
  return (
    <div
      className={
        align === "center"
          ? "flex flex-wrap justify-center gap-3"
          : "flex flex-wrap gap-3"
      }
    >
      <SignedOut>
        <SignUpButton forceRedirectUrl="/dashboard">
          <Button className="h-12 bg-[#13B8B5] px-6 text-base text-white shadow-[0_12px_28px_rgba(19,184,181,0.24)] hover:-translate-y-0.5 hover:bg-[#0EA5A4]">
            Create Free Account
            <ArrowRight className="size-4" />
          </Button>
        </SignUpButton>
        <SignInButton forceRedirectUrl="/dashboard">
          <Button
            variant="outline"
            className="h-12 border-[#E2E8F0] bg-white px-6 text-base text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Button asChild className="h-12 bg-[#13B8B5] px-6 text-base text-white hover:bg-[#0EA5A4]">
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </SignedIn>
    </div>
  );
}

export function MobileLandingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="bg-white"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <div className="absolute inset-x-4 top-[72px] z-50 rounded-2xl border border-[#E8EDF3] bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 border-t border-[#E8EDF3] pt-4">
            <LandingAuthActions compact />
          </div>
        </div>
      )}
    </div>
  );
}

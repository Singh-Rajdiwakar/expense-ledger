import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChartNoAxesCombined,
  Database,
  Fingerprint,
  Heart,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserPlus,
  WalletCards,
} from "lucide-react";
import {
  CtaButtons,
  LandingAuthActions,
  MobileLandingMenu,
} from "@/components/landing/auth-actions";
import { navItems } from "@/components/landing/nav-items";
import { HeroDashboardPreview, MiniBarChart, MiniDonut } from "@/components/landing/hero-dashboard-preview";
import { DashboardShowcase } from "@/components/landing/dashboard-showcase";
import { isClerkConfigured } from "@/lib/env";

export const metadata = {
  title: "Expense Ledger — Smarter Expense and Budget Management",
  description:
    "Track income, manage expenses, monitor budgets, and understand your financial habits through one clear and intelligent dashboard.",
  openGraph: {
    title: "Expense Ledger — Smarter Expense and Budget Management",
    description:
      "Track income, manage expenses, monitor budgets, and understand your financial habits through one clear and intelligent dashboard.",
  },
  twitter: {
    title: "Expense Ledger — Smarter Expense and Budget Management",
    description:
      "Track income, manage expenses, monitor budgets, and understand your financial habits through one clear and intelligent dashboard.",
  },
};

const trustPoints = [
  { label: "Secure authentication", icon: ShieldCheck },
  { label: "Protected financial data", icon: LockKeyhole },
  { label: "Real-time tracking", icon: Activity },
  { label: "AI-powered insights", icon: Sparkles },
];

const featureCards = [
  {
    icon: ReceiptText,
    title: "Know exactly where your money goes",
    eyebrow: "Smart Expense Tracking",
    description:
      "Record income and expenses, organise transactions by category, and find any payment instantly using powerful search and filters.",
    visual: "transactions",
  },
  {
    icon: BadgeIndianRupee,
    title: "Stay ahead of your monthly budget",
    eyebrow: "Intelligent Budget Planning",
    description:
      "Set spending limits, monitor progress in real time, and receive clear warnings before your budget gets out of control.",
    visual: "budget",
  },
  {
    icon: BarChart3,
    title: "Turn numbers into clear insights",
    eyebrow: "Visual Financial Reports",
    description:
      "Understand cash flow, category spending, and monthly trends through clean interactive charts.",
    visual: "reports",
  },
  {
    icon: Brain,
    title: "Get insights that actually help",
    eyebrow: "AI-Powered Insights",
    description:
      "Use intelligent analysis to identify spending patterns, discover costly categories, and make more informed financial decisions.",
    visual: "ai",
  },
  {
    icon: WalletCards,
    title: "All your accounts in one dashboard",
    eyebrow: "Multiple Account Management",
    description:
      "Track current, salary, savings, and other accounts without losing visibility across your finances.",
    visual: "accounts",
  },
  {
    icon: CalendarClock,
    title: "Never lose track of repeated payments",
    eyebrow: "Recurring Transaction Tracking",
    description:
      "Monitor recurring bills and payments so regular expenses never surprise you at the end of the month.",
    visual: "recurring",
  },
];

const securityCards = [
  {
    title: "Secure Authentication",
    description: "Clerk handles sign in, sign up, and user session controls.",
    icon: Fingerprint,
  },
  {
    title: "Protected Routes",
    description: "Dashboard, account, and transaction pages stay private.",
    icon: LockKeyhole,
  },
  {
    title: "Private Account Data",
    description: "Server queries are scoped to the authenticated user.",
    icon: Database,
  },
  {
    title: "Reliable Validation",
    description: "Forms and server operations validate data before saving.",
    icon: ShieldCheck,
  },
];

const benefits = [
  "See your complete monthly position",
  "Catch overspending before it grows",
  "Keep multiple accounts organised",
  "Build better financial habits over time",
];

const testimonials = [
  {
    quote:
      "Expense Ledger made it much easier to understand where my monthly budget was going. The dashboard is simple and clear.",
    name: "Aarav",
    role: "Student",
  },
  {
    quote:
      "I no longer need to maintain separate spreadsheets for my salary account and daily expenses.",
    name: "Meera",
    role: "Freelancer",
  },
  {
    quote:
      "The category breakdown helped me notice spending patterns that I was previously ignoring.",
    name: "Kabir",
    role: "Developer",
  },
];

const faqs = [
  {
    question: "Is Expense Ledger free to use?",
    answer:
      "You can create an account and start tracking your finances from the dashboard. Any future pricing should be checked in the app owner’s current setup.",
  },
  {
    question: "Can I manage multiple accounts?",
    answer:
      "Yes. The app supports multiple accounts and lets you choose a default account for transactions.",
  },
  {
    question: "Can I track both income and expenses?",
    answer:
      "Yes. You can record income and expense transactions, category details, dates, and descriptions.",
  },
  {
    question: "Does the application support recurring transactions?",
    answer:
      "Yes. Transactions can be marked as recurring with daily, weekly, monthly, or yearly intervals.",
  },
  {
    question: "How are AI insights generated?",
    answer:
      "The project uses Gemini-powered flows for receipt scanning and insight-style analysis where configured with a valid API key.",
  },
  {
    question: "Is my account information private?",
    answer:
      "Authenticated pages are protected with Clerk, and server queries are scoped to the signed-in user.",
  },
  {
    question: "Can I use the application on mobile?",
    answer:
      "Yes. The landing page and authenticated dashboard layouts are responsive for mobile and desktop screens.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create an account, add your first financial account, and begin recording transactions from your dashboard.",
  },
];

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0]/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/expense-ledger-logo.png"
            alt="Expense Ledger logo"
            width={180}
            height={71}
            className="h-12 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-[#64748B] transition hover:text-[#0F172A]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <LandingAuthActions />
        </div>
        <MobileLandingMenu />
      </div>
    </header>
  );
}

function SectionIntro({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#13B8B5]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg leading-8 text-[#64748B]">{description}</p>
      )}
    </div>
  );
}

function FeatureVisual({ type }) {
  if (type === "transactions") {
    return (
      <div className="space-y-3 rounded-2xl bg-[#F8FAFC] p-4">
        {[
          ["Food", "Lunch payment", "-₹180", "#FF4D67"],
          ["Travel", "Metro card", "-₹120", "#FF4D67"],
          ["Salary", "Monthly income", "+₹22,200", "#22C55E"],
        ].map(([category, label, amount, color]) => (
          <div key={label} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
            <div>
              <p className="text-xs font-extrabold text-[#0F172A]">{label}</p>
              <p className="text-[11px] font-bold text-[#94A3B8]">{category}</p>
            </div>
            <p className="money-nums text-xs font-extrabold" style={{ color }}>{amount}</p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "budget") {
    return (
      <div className="rounded-2xl bg-[#F8FAFC] p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-[#64748B]">Monthly budget</p>
            <p className="money-nums mt-1 text-2xl font-extrabold text-[#0F172A]">₹5,200</p>
          </div>
          <p className="money-nums text-sm font-extrabold text-[#13B8B5]">26%</p>
        </div>
        <div className="mt-4 h-3 rounded-full bg-[#E2E8F0]">
          <div className="landing-progress h-full rounded-full bg-[#13B8B5]" />
        </div>
        <p className="mt-3 text-xs font-semibold text-[#64748B]">₹14,800 remaining</p>
      </div>
    );
  }

  if (type === "reports") {
    return (
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl bg-[#F8FAFC] p-4">
        <MiniBarChart />
        <MiniDonut />
      </div>
    );
  }

  if (type === "ai") {
    return (
      <div className="rounded-2xl bg-[#ECFDFB] p-4">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 size-5 text-[#13B8B5]" />
          <div>
            <p className="text-sm font-extrabold text-[#0F172A]">Top Insight</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">
              Food spending is trending higher than your usual monthly average.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "accounts") {
    return (
      <div className="grid gap-3 rounded-2xl bg-[#F8FAFC] p-4 sm:grid-cols-2">
        {["Salary", "Savings"].map((account, index) => (
          <div key={account} className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs font-bold text-[#64748B]">{account} Account</p>
            <p className="money-nums mt-1 text-lg font-extrabold text-[#0F172A]">
              {index ? "₹20,000" : "₹27,000"}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#F8FAFC] p-4">
      {["House rent", "Internet bill", "Subscription"].map((item) => (
        <div key={item} className="mb-3 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-bold shadow-sm last:mb-0">
          <span className="text-[#0F172A]">{item}</span>
          <span className="rounded-full bg-[#EFEDFF] px-2 py-1 text-[#695CF6]">Recurring</span>
        </div>
      ))}
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Everything in one place"
          title="Your complete financial command center"
          description="From daily spending to monthly budgets, Expense Ledger gives you a clear picture of your money without complicated spreadsheets."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {featureCards.map((feature, index) => (
            <article
              key={feature.eyebrow}
              className={`landing-card rounded-3xl border border-[#E8EDF3] bg-white p-6 shadow-[0_8px_32px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)] ${
                index === 0 || index === 2 ? "lg:col-span-2" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#ECFDFB] text-[#13B8B5]">
                  <feature.icon className="size-6" />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#94A3B8]">
                  {feature.eyebrow}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-extrabold text-[#0F172A]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[#64748B]">
                {feature.description}
              </p>
              <div className="mt-6">
                <FeatureVisual type={feature.visual} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Create your secure account",
      description: "Sign up safely and access your personal finance dashboard.",
      icon: UserPlus,
    },
    {
      title: "Add accounts and transactions",
      description: "Record your income, expenses, categories, budgets, and recurring payments.",
      icon: WalletCards,
    },
    {
      title: "Understand and improve",
      description: "Use reports and intelligent insights to make smarter spending decisions.",
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Simple from the first transaction"
          title="Start managing your money in minutes"
        />
        <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-[#D7DEE8] lg:block" />
          {steps.map((step, index) => (
            <article key={step.title} className="relative rounded-3xl border border-[#E8EDF3] bg-white p-7 text-center shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
              <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-[#ECFDFB] text-[#13B8B5]">
                <step.icon className="size-8" />
              </span>
              <span className="mt-5 inline-flex rounded-full bg-[#EFEDFF] px-3 py-1 text-xs font-extrabold text-[#695CF6]">
                Step {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0F172A]">{step.title}</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[#64748B]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiInsightsSection() {
  return (
    <section id="ai-insights" className="py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="rounded-[28px] border border-[#E8EDF3] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="rounded-3xl bg-[#F8FAFC] p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#0F172A]">AI spending review</h3>
              <span className="rounded-full bg-[#ECFDFB] px-3 py-1 text-xs font-extrabold text-[#13B8B5]">Live insight</span>
            </div>
            {[
              ["Spending trend", "Food expenses are rising faster than other categories.", TrendingUp],
              ["Category alert", "Bills and transport now make up 38% of expenses.", TrendingDown],
              ["Monthly recommendation", "Review repeated payments before adding new subscriptions.", Sparkles],
            ].map(([title, text, Icon]) => (
              <div key={title} className="mb-3 rounded-2xl bg-white p-4 shadow-sm last:mb-0">
                <div className="flex gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#EFEDFF] text-[#695CF6]">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[#0F172A]">{title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#13B8B5]">
            Smarter financial decisions
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
            Understand the story behind your spending
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#64748B]">
            Expense Ledger analyses your financial activity and turns raw
            transaction data into useful, easy-to-understand observations.
          </p>
          <div className="mt-7 space-y-4">
            {[
              "Identify unusual spending patterns",
              "Discover your highest expense categories",
              "Receive clear monthly financial summaries",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-bold text-[#334155]">
                <CheckCircle2 className="size-5 text-[#22C55E]" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <CtaButtons />
          </div>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Built with privacy in mind"
          title="Your financial information deserves serious protection"
          description="Expense Ledger uses secure authentication and protected application architecture to keep account access and financial activity private."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {securityCards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-[#E8EDF3] bg-white p-6 shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#ECFDFB] text-[#13B8B5]">
                <card.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold text-[#0F172A]">{card.title}</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[#64748B]">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
              Less guessing. More financial confidence.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#64748B]">
              Simple tracking. Clear reports. Smarter decisions for everyday
              money management.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-[#E8EDF3] bg-white p-5 text-sm font-extrabold text-[#334155] shadow-sm">
                <CheckCircle2 className="size-5 shrink-0 text-[#22C55E]" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="Landing page feedback" title="Built for everyday clarity" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-3xl border border-[#E8EDF3] bg-white p-6 shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-[#13B8B5] to-[#695CF6] text-sm font-extrabold text-white">
                  {item.name[0]}
                </span>
                <div>
                  <p className="font-extrabold text-[#0F172A]">{item.name}</p>
                  <p className="text-xs font-bold text-[#94A3B8]">{item.role}</p>
                </div>
              </div>
              <p className="text-sm font-medium leading-7 text-[#64748B]">“{item.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="FAQ" title="Questions before you start" />
        <div className="mt-12 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-[#E8EDF3] bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none text-base font-extrabold text-[#0F172A]">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <ArrowRight className="size-4 shrink-0 text-[#94A3B8] transition group-open:rotate-90" />
                </span>
              </summary>
              <p className="mt-4 text-sm font-medium leading-7 text-[#64748B]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-[#DDE8F0] bg-[radial-gradient(circle_at_top_left,rgba(19,184,181,0.18),transparent_36%),radial-gradient(circle_at_top_right,rgba(105,92,246,0.18),transparent_34%),#F8FAFC] p-8 text-center sm:p-12">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#13B8B5]">
            Start today
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
            Make every rupee easier to understand.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#64748B]">
            Create your account and bring your income, expenses, budgets, and
            financial insights into one clear dashboard.
          </p>
          <div className="mt-8">
            <CtaButtons align="center" />
          </div>
          <p className="mt-5 text-sm font-bold text-[#64748B]">
            Simple setup • Secure access • No complicated spreadsheets
          </p>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  const footerLinks = {
    Product: [
      ["Features", "#features"],
      ["AI Insights", "#ai-insights"],
      ["Security", "#security"],
      ["FAQ", "#faq"],
    ],
    Account: [
      ["Sign In", "/sign-in"],
      ["Create Account", "/sign-up"],
      ["Dashboard", "/dashboard"],
    ],
    Connect: [
      ["LinkedIn", "https://www.linkedin.com/in/rajdiwakar-singh-b46a762b4/"],
    ],
  };

  return (
    <footer className="border-t border-[#E8EDF3] bg-white py-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/expense-ledger-logo.png" alt="Expense Ledger logo" width={180} height={71} className="h-12 w-auto object-contain" />
          </div>
          <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-[#64748B]">
            A clear and intelligent way to track expenses, manage budgets, and
            understand your finances.
          </p>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h3 className="font-extrabold text-[#0F172A]">{title}</h3>
            <div className="mt-4 grid gap-3">
              {links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm font-semibold text-[#64748B] hover:text-[#13B8B5]"
                  target={href.startsWith("http") ? "_blank" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-[#E8EDF3] px-4 pt-6 text-sm font-medium text-[#64748B] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© 2025 Expense Ledger. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          Made with <Heart className="size-4 fill-[#13B8B5] text-[#13B8B5]" /> by Singh Rajdiwakar
        </p>
      </div>
    </footer>
  );
}

export default async function LandingPage() {
  if (isClerkConfigured) {
    const { userId } = await auth();

    if (userId) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#0F172A]">
      <LandingHeader />
      <main>
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_15%_8%,rgba(19,184,181,0.14),transparent_28rem),radial-gradient(circle_at_85%_15%,rgba(105,92,246,0.14),transparent_30rem)] py-20 sm:py-24 lg:py-28">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
            <div>
              <div className="landing-fade-up inline-flex items-center gap-2 rounded-full border border-[#DDE8F0] bg-white px-4 py-2 text-sm font-extrabold text-[#334155] shadow-sm">
                <Sparkles className="size-4 text-[#13B8B5]" />
                AI-powered personal finance
              </div>
              <h1 className="landing-fade-up mt-6 text-[42px] font-extrabold leading-[1.02] tracking-tight text-[#0F172A] sm:text-6xl lg:text-7xl">
                Take control of{" "}
                <span className="bg-gradient-to-r from-[#13B8B5] to-[#695CF6] bg-clip-text text-transparent">
                  every rupee.
                </span>
              </h1>
              <p className="landing-fade-up mt-6 max-w-xl text-lg leading-8 text-[#334155]">
                Track your income, understand your spending, manage monthly
                budgets, and make smarter financial decisions from one clear
                dashboard.
              </p>
              <p className="landing-fade-up mt-3 max-w-xl text-base font-medium leading-7 text-[#64748B]">
                Built to turn complicated financial data into simple, useful
                insights.
              </p>
              <div className="landing-fade-up mt-8 flex flex-wrap items-center gap-3">
                <CtaButtons />
                <a
                  href="https://www.rajdiwakar.tech/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with me in a new tab"
                  className="portfolio-cta group inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#13B8B5]/50 focus-visible:ring-offset-2"
                >
                  <span className="relative z-10">Connect with me</span>
                  <ArrowUpRight
                    className="relative z-10 size-4 text-[#13B8B5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
              <p className="mt-4 text-sm font-bold text-[#64748B]">
                No credit card required • Set up in minutes
              </p>
            </div>
            <HeroDashboardPreview />
          </div>
        </section>

        <section className="border-y border-[#E8EDF3] bg-white py-5">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {trustPoints.map((point) => (
              <div key={point.label} className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] px-4 py-3">
                <point.icon className="size-5 text-[#13B8B5]" />
                <span className="text-sm font-extrabold text-[#334155]">{point.label}</span>
              </div>
            ))}
          </div>
        </section>

        <FeaturesSection />
        <HowItWorksSection />
        <AiInsightsSection />
        <DashboardShowcase />
        <SecuritySection />
        <BenefitsSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}

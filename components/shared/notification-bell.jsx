"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CircleAlert,
  FileText,
  Loader2,
  ReceiptText,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import {
  getNotificationSummary,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notification";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const typeIcons = {
  BUDGET_WARNING: Wallet,
  BUDGET_EXCEEDED: CircleAlert,
  RECURRING_PAYMENT_DUE: CalendarClock,
  LARGE_EXPENSE: ReceiptText,
  NEGATIVE_BALANCE: CircleAlert,
  MONTHLY_REPORT_READY: FileText,
  INSIGHT_READY: Sparkles,
  GENERAL: Bell,
};

function relativeTime(value) {
  const date = new Date(value);
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, amount] of units) {
    const count = Math.floor(seconds / amount);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

export function NotificationBell({ period }) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const unreadCount = summary.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  const input = useMemo(
    () => ({ month: period.month, year: period.year }),
    [period.month, period.year]
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const result = await getNotificationSummary(input);
    if (result.success) {
      setSummary(result.data);
    } else {
      toast.error(result.error || "Failed to load notifications");
    }
    setLoading(false);
  }, [input]);

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(loadNotifications, 45000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [loadNotifications, open]);

  const markOne = (id) => {
    startTransition(async () => {
      await markNotificationAsRead(id);
      await loadNotifications();
    });
  };

  const markAll = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      await loadNotifications();
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={
            hasUnread
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
          className="relative size-10 rounded-xl border-[#E5E7EB] bg-white text-[#64748B] shadow-[0_3px_12px_rgba(15,23,42,0.05)] hover:bg-[#F8FAFC]"
        >
          {hasUnread ? <BellRing className="size-4" /> : <Bell className="size-4" />}
          {hasUnread && (
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#FF4D67] px-1.5 text-[10px] font-extrabold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] rounded-2xl p-0">
        <div className="flex items-center justify-between border-b border-[#EEF2F7] px-4 py-3">
          <div>
            <p className="text-sm font-extrabold text-[#0F172A]">Notifications</p>
            <p className="text-xs font-medium text-[#64748B]">
              {hasUnread ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasUnread || isPending}
            onClick={markAll}
            className="h-8 text-xs"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            Mark all
          </Button>
        </div>

        {loading ? (
          <div className="grid h-40 place-items-center text-sm text-[#64748B]">
            <Loader2 className="mb-2 size-5 animate-spin text-[#13B8B5]" />
            Loading notifications
          </div>
        ) : summary.notifications.length === 0 ? (
          <div className="grid h-40 place-items-center px-6 text-center text-sm font-medium text-[#64748B]">
            No notifications yet. Important budget and report updates will appear here.
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto p-2">
            {summary.notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell;
              const content = (
                <div
                  className={cn(
                    "flex gap-3 rounded-xl p-3 transition hover:bg-[#F8FAFC]",
                    !notification.isRead && "bg-[#F5FAFF]"
                  )}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E8FAF9] text-[#13B8B5]">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-extrabold text-[#0F172A]">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1 size-2 rounded-full bg-[#13B8B5]" />
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-[11px] font-bold text-[#94A3B8]">
                      {relativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              );

              if (notification.actionUrl) {
                return (
                  <Link
                    key={notification.id}
                    href={notification.actionUrl}
                    onClick={() => markOne(notification.id)}
                    className="block"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markOne(notification.id)}
                  className="block w-full text-left"
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

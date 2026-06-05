"use client";

import { signOut } from "next-auth/react";
import { BarChart3, LogOut, Bell, X, Trash2, RefreshCw } from "lucide-react";
import type { AppUser } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import toast from "react-hot-toast";

type Notification = {
  id: string;
  text: string;
  createdAt: number;
};

function timeAgo(ms: number): string {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Navbar({ user }: { user: AppUser }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset unread count when panel is opened
  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

  // Load stored notifications on mount
  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Pusher — real-time GHL events
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("dashboard");

    channel.bind("new-event", (data: Notification) => {
      setNotifications((prev) => [data, ...prev].slice(0, 20));
      setUnreadCount((n) => n + 1);

      // Toast with a "Refresh" action
      toast(
        (t) => (
          <div className="flex items-start gap-3">
            <span className="text-sm flex-1">{data.text}</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setRefreshing(true);
                router.refresh();
                setTimeout(() => setRefreshing(false), 1200);
              }}
              className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        ),
        { duration: 6000, icon: "🔔" }
      );
    });

    return () => {
      pusher.unsubscribe("dashboard");
    };
  }, [router]);

  async function handleClearAll() {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
    setUnreadCount(0);
  }

  function dismissOne(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">SalesPipeline</span>
          <span className="hidden sm:flex items-center gap-1.5 ml-3 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot inline-block" />
            Live
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Notification bell */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">

                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">Notifications</span>
                    {notifications.length > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear all
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No notifications yet</p>
                      <p className="text-xs text-slate-300 mt-1">GHL updates will appear here</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => dismissOne(n.id)}
                          className="shrink-0 p-0.5 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer — refresh link */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => {
                        setOpen(false);
                        setRefreshing(true);
                        router.refresh();
                        setTimeout(() => setRefreshing(false), 1200);
                      }}
                      className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                      Refresh dashboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <span className="hidden sm:block text-sm text-slate-700 font-medium">
              {user?.name}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { BarChart3, LogOut, RefreshCw, Bell } from "lucide-react";
import type { AppUser } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";

type Notification = {
  id: string;
  text: string;
  createdAt: number;
};

export default function Navbar({ user }: { user: AppUser }) {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  // 🔄 REFRESH
  async function handleRefresh() {
    try {
      setRefreshing(true);
      router.refresh();
      setTimeout(() => setRefreshing(false), 800);
    } catch (err) {
      console.error("Refresh error:", err);
      setRefreshing(false);
    }
  }

  // 🔔 FETCH NOTIFICATIONS
  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Notification error:", err);
    }
  }

  // AUTO LOAD
  useEffect(() => {
    loadNotifications();

    // optional polling every 10s
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);
useEffect(() => {
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });

  const channel = pusher.subscribe("dashboard");

  channel.bind("new-event", (data: any) => {
    setNotifications((prev) => [data, ...prev]);
  });

  return () => {
    pusher.unsubscribe("dashboard");
  };
}, []);
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

          {/* 🔄 REFRESH */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* 🔔 NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <Bell className="w-4 h-4" />

              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg z-50">
                <div className="p-3 border-b text-sm font-semibold">
                  Notifications
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-3 text-sm text-slate-400">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-3 py-2 text-sm hover:bg-slate-50 border-b"
                      >
                        {n.text}
                        <div className="text-xs text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* USER */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <span className="hidden sm:block text-sm text-slate-700 font-medium">
              {user?.name}
            </span>
          </div>

          {/* LOGOUT */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
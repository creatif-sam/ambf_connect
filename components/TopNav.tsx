"use client"

import Image from "next/image"
import { HelpCircle, Bell } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { getRecentNotifications, getUnreadCount, markAsRead, markAllAsRead, type Notification } from "@/lib/queries/notifications"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import HelpModal from "./HelpModal"

export default function TopNav() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuthAndLoadNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications"
        },
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function checkAuthAndLoadNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
        await loadNotifications()
      }
    } catch (err) {
      console.error("Auth check failed:", err)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  async function loadNotifications() {
    try {
      const [notifs, count] = await Promise.all([
        getRecentNotifications(5),
        getUnreadCount()
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      // Silently fail if table doesn't exist or user not authenticated
      console.log("Notifications not available yet")
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      await markAsRead(notification.id)
      await loadNotifications()
    }
    
    if (notification.link) {
      router.push(notification.link)
    }
    
    setIsOpen(false)
  }

  async function handleMarkAllRead() {
    await markAllAsRead()
    await loadNotifications()
  }

  function getTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/icons/logo-ambf.png"
            alt="AMBF Connect"
            width={140}
            height={36}
            priority
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications - only show for authenticated users */}
          {isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
                className="relative hover:text-[#d4af37] transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full px-4 py-3 border-b hover:bg-gray-50 text-left transition ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {getTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            </div>
          )}

          <button
            onClick={() => setIsHelpOpen(true)}
            aria-label="Help"
            className="hover:text-[#d4af37] transition"
          >
            <HelpCircle size={20} />
          </button>
        </div>

      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </header>
  )
}

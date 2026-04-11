"use client";

import { BellIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

type NotificationItem = {
  _id: string;
  title: string;
  body: string;
  type: string;
  readAt: string | null;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};

type NotificationDisplayItem = {
  item: NotificationItem;
  groupedIds: string[];
  groupedCount: number;
};

const GENERIC_NOTIFICATION_SENDER_LABELS = new Set([
  "someone",
  "user",
  "client",
  "freelancer",
  "venue",
]);

const toUsableSenderName = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (GENERIC_NOTIFICATION_SENDER_LABELS.has(trimmed.toLowerCase())) {
    return null;
  }

  return trimmed;
};

const senderNameFromTitle = (title?: string): string | null => {
  if (typeof title !== "string") {
    return null;
  }

  const singleMatch = title.match(/^new message from\s+(.+)$/i);
  if (singleMatch?.[1]) {
    return toUsableSenderName(singleMatch[1]);
  }

  const groupedMatch = title.match(/^\d+\s+new messages from\s+(.+)$/i);
  if (groupedMatch?.[1]) {
    return toUsableSenderName(groupedMatch[1]);
  }

  return null;
};

const NOTIFICATION_POLL_INTERVAL_MS = 8000;
const NOTIFICATION_RETRY_BACKOFF_MS = 30000;

const NotificationBell = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { session, status } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const baseTitleRef = useRef("");
  const internalTitleUpdateRef = useRef(false);
  const originalFaviconHrefRef = useRef<string | null>(null);
  const isFetchingUnreadRef = useRef(false);
  const isFetchingListRef = useRef(false);
  const notificationFailuresRef = useRef(0);
  const pausePollingUntilRef = useRef(0);
  const outageLoggedRef = useRef(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const resetPollingState = useCallback(() => {
    notificationFailuresRef.current = 0;
    pausePollingUntilRef.current = 0;
    outageLoggedRef.current = false;
  }, []);

  const handlePollingFailure = useCallback((error: unknown, context: string) => {
    notificationFailuresRef.current += 1;
    pausePollingUntilRef.current = Date.now() + NOTIFICATION_RETRY_BACKOFF_MS;

    if (!outageLoggedRef.current) {
      console.warn(`Notification polling temporarily unavailable during ${context}.`, error);
      outageLoggedRef.current = true;
    }
  }, []);

  const getIconLink = () => {
    if (typeof document === "undefined") {
      return null;
    }

    const existing = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (existing) {
      return existing;
    }

    const created = document.createElement("link");
    created.rel = "icon";
    document.head.appendChild(created);
    return created;
  };

  const createBadgeFaviconDataUrl = (count: number) => {
    const label = count > 99 ? "99+" : String(count);
    const fontSize = label.length > 2 ? "8" : "9";
    const textX = label.length > 2 ? "48" : "49";

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <rect width='64' height='64' rx='14' fill='#0f172a'/>
  <path d='M32 13c-7.2 0-13 5.8-13 13v8.7l-4.4 7.2c-.5.8-.5 1.8 0 2.7.5.8 1.4 1.4 2.4 1.4h30c1 0 1.9-.5 2.4-1.4.5-.8.5-1.9 0-2.7L45 34.7V26c0-7.2-5.8-13-13-13zm0 37c3.4 0 6.2-2.3 7-5.4H25c.8 3.1 3.6 5.4 7 5.4z' fill='#ffffff'/>
  <circle cx='48' cy='16' r='14' fill='#dc2626'/>
  <text x='${textX}' y='20' text-anchor='middle' font-family='Arial, sans-serif' font-size='${fontSize}' font-weight='700' fill='#fff'>${label}</text>
</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const hasUnread = unreadCount > 0;

  const displayNotifications = useMemo<NotificationDisplayItem[]>(() => {
    const sorted = [...notifications].sort((a, b) => {
      if (!a.readAt && b.readAt) {
        return -1;
      }
      if (a.readAt && !b.readAt) {
        return 1;
      }
      return 0;
    });

    const grouped: NotificationDisplayItem[] = [];
    const groupIndexBySender = new Map<string, number>();
    const RAPID_GROUP_WINDOW_MS = 5 * 60 * 1000;

    for (const item of sorted) {
      const senderId = typeof item.metadata?.senderId === "string" ? item.metadata.senderId : null;
      const isUnreadNewMessage = item.type === "NEW_MESSAGE" && !item.readAt && Boolean(senderId);

      if (!isUnreadNewMessage || !senderId) {
        grouped.push({ item, groupedIds: [item._id], groupedCount: 1 });
        continue;
      }

      const existingIndex = groupIndexBySender.get(senderId);
      if (existingIndex === undefined) {
        grouped.push({ item, groupedIds: [item._id], groupedCount: 1 });
        groupIndexBySender.set(senderId, grouped.length - 1);
        continue;
      }

      const existingGroup = grouped[existingIndex];
      const existingTime = existingGroup.item.createdAt ? Date.parse(existingGroup.item.createdAt) : NaN;
      const currentTime = item.createdAt ? Date.parse(item.createdAt) : NaN;
      const inRapidWindow =
        Number.isFinite(existingTime) && Number.isFinite(currentTime)
          ? Math.abs(existingTime - currentTime) <= RAPID_GROUP_WINDOW_MS
          : true;

      if (!inRapidWindow) {
        grouped.push({ item, groupedIds: [item._id], groupedCount: 1 });
        groupIndexBySender.set(senderId, grouped.length - 1);
        continue;
      }

      const senderName =
        toUsableSenderName(existingGroup.item.metadata?.senderName) ||
        toUsableSenderName(item.metadata?.senderName) ||
        senderNameFromTitle(existingGroup.item.title) ||
        senderNameFromTitle(item.title) ||
        "User";

      existingGroup.groupedIds.push(item._id);
      existingGroup.groupedCount += 1;
      existingGroup.item = {
        ...existingGroup.item,
        title: `${existingGroup.groupedCount} new messages from ${senderName}`,
      };
    }

    return grouped;
  }, [notifications]);

  const fetchUnreadCount = useCallback(async () => {
    if (status !== "authenticated") {
      setUnreadCount(0);
      return;
    }

    if (isFetchingUnreadRef.current) {
      return;
    }

    isFetchingUnreadRef.current = true;
    try {
      const response = await fetchWithAuth("/api/notifications/unread-count", {
        method: "GET",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setUnreadCount(Number(data.unreadCount ?? 0));
      resetPollingState();
    } catch (error) {
      setUnreadCount(0);
      handlePollingFailure(error, "unread-count fetch");
    } finally {
      isFetchingUnreadRef.current = false;
    }
  }, [handlePollingFailure, resetPollingState, status]);

  const fetchNotifications = useCallback(async () => {
    if (status !== "authenticated") {
      setNotifications([]);
      return;
    }

    if (isFetchingListRef.current) {
      return;
    }

    isFetchingListRef.current = true;
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("/api/notifications?limit=12", {
        method: "GET",
      });

      if (!response.ok) {
        setNotifications([]);
        return;
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      resetPollingState();
    } catch (error) {
      handlePollingFailure(error, "notifications fetch");
      setNotifications([]);
    } finally {
      setIsLoading(false);
      isFetchingListRef.current = false;
    }
  }, [handlePollingFailure, resetPollingState, status]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });

      if (!response.ok) {
        return;
      }

      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, readAt: new Date().toISOString() } : item)),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markManyAsRead = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    await Promise.all(ids.map(async (id) => markAsRead(id)));
  };

  const getNotificationHref = (item: NotificationItem): string | null => {
    const metadata = item.metadata;
    const isClientArea = pathname?.startsWith("/client") ?? false;
    const contractsBasePath = isClientArea ? "/client/your-contracts" : "/user/your-contracts";

    if (metadata) {
      const candidateKeys = ["href", "url", "path", "route"] as const;
      for (const key of candidateKeys) {
        const value = metadata[key];
        if (typeof value === "string" && value.trim().length > 0) {
          return value;
        }
      }

      const contractId = metadata.contractId;
      const jobId = metadata.jobId;
      if (typeof contractId === "string" && typeof jobId === "string") {
        return `${contractsBasePath}/${contractId}/${jobId}`;
      }

      if (typeof contractId === "string") {
        return contractsBasePath;
      }

      if (item.type === "PROPOSAL_SUBMITTED" && typeof jobId === "string") {
        return isClientArea ? `/client/job-proposal/${jobId}` : "/user/your-proposals";
      }
    }

    if (item.type === "CONTRACT_ACCEPTED") {
      return contractsBasePath;
    }

    if (item.type === "PAYMENT_SUCCESS") {
      return isClientArea ? "/client/your-contracts" : "/user/business/paymenthistory";
    }

    if (item.type === "PROPOSAL_SUBMITTED") {
      return isClientArea ? "/client/your-contracts" : "/user/your-proposals";
    }

    if (item.type === "NEW_MESSAGE") {
      const senderId = item.metadata?.senderId;
      const recipientId = item.metadata?.recipientId;
      const messageId = item.metadata?.messageId;
      const chatPeerId =
        typeof senderId === "string" && senderId.length > 0
          ? senderId
          : typeof recipientId === "string" && recipientId.length > 0
          ? recipientId
          : null;
      const ownerId = session?.user?.id;

      if (chatPeerId && ownerId) {
        const basePath = isClientArea
          ? `/client/chatroom/${ownerId}`
          : `/user/chatroom/${ownerId}`;
        const params = new URLSearchParams();
        params.set("recipientId", chatPeerId);
        if (typeof messageId === "string" && messageId.length > 0) {
          params.set("messageId", messageId);
        }
        return `${basePath}?${params.toString()}`;
      }
    }

    if (item.type === "USER_REGISTERED") {
      return "/user/profile";
    }

    return null;
  };

  const handleNotificationClick = async (item: NotificationItem, groupedIds: string[] = [item._id]) => {
    if (!item.readAt) {
      await markManyAsRead(groupedIds);
    }

    const href = getNotificationHref(item);
    setIsOpen(false);

    if (href) {
      router.push(href);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") {
      setNotifications([]);
      setUnreadCount(0);
      resetPollingState();
      return;
    }

    const runRefresh = () => {
      if (document.hidden) {
        return;
      }

      if (pausePollingUntilRef.current > Date.now()) {
        return;
      }

      void fetchUnreadCount();
      if (isOpen) {
        void fetchNotifications();
      }
    };

    runRefresh();

    const intervalId = setInterval(() => {
      runRefresh();
    }, NOTIFICATION_POLL_INTERVAL_MS);

    const onFocus = () => {
      runRefresh();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) {
        runRefresh();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchNotifications, fetchUnreadCount, isOpen, resetPollingState, status]);

  useEffect(() => {
    if (!isOpen || status !== "authenticated") {
      return;
    }

    void fetchNotifications();
  }, [fetchNotifications, isOpen, status]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    baseTitleRef.current = document.title.replace(/^\(\d+\)\s*/, "");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const baseTitle = baseTitleRef.current || document.title.replace(/^\(\d+\)\s*/, "");
    const nextTitle = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;

    if (document.title === nextTitle) {
      return;
    }

    internalTitleUpdateRef.current = true;
    document.title = nextTitle;
    internalTitleUpdateRef.current = false;
  }, [unreadCount]);

  useEffect(() => {
    const iconLink = getIconLink();
    if (!iconLink) {
      return;
    }

    if (originalFaviconHrefRef.current === null) {
      originalFaviconHrefRef.current = iconLink.href;
    }

    if (unreadCount > 0) {
      iconLink.href = createBadgeFaviconDataUrl(unreadCount);
      return;
    }

    if (originalFaviconHrefRef.current) {
      iconLink.href = originalFaviconHrefRef.current;
    }
  }, [unreadCount]);

  useEffect(() => {
    return () => {
      const iconLink = getIconLink();
      if (!iconLink) {
        return;
      }

      if (originalFaviconHrefRef.current) {
        iconLink.href = originalFaviconHrefRef.current;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const titleElement = document.querySelector("title");
    if (!titleElement) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (internalTitleUpdateRef.current) {
        return;
      }

      const cleanTitle = document.title.replace(/^\(\d+\)\s*/, "");
      baseTitleRef.current = cleanTitle;

      const expectedTitle = unreadCount > 0 ? `(${unreadCount}) ${cleanTitle}` : cleanTitle;
      if (document.title === expectedTitle) {
        return;
      }

      internalTitleUpdateRef.current = true;
      document.title = expectedTitle;
      internalTitleUpdateRef.current = false;
    });

    observer.observe(titleElement, { childList: true });

    return () => {
      observer.disconnect();
    };
  }, [unreadCount]);

  return (
    <div className="relative inline-flex h-10 w-10 items-center justify-center" ref={panelRef}>
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open notifications"
      >
        <BellIcon className="h-8 w-8" />
        {hasUnread && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-20 w-96 rounded-xl bg-white dark:bg-dark-surface p-3 shadow-[0_0px_20px_rgba(228,228,228,1)] dark:shadow-[0_0px_20px_rgba(0,0,0,0.4)] before:absolute before:-top-1 before:right-2 before:z-10 before:rotate-[135deg] before:border-8 before:border-white before:bg-white dark:before:border-dark-surface dark:before:bg-dark-surface after:absolute after:-top-5 after:right-0 after:h-6 after:w-full">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-on-surface">Notifications</h3>
            <button
              type="button"
              className="text-xs text-gray-500 dark:text-dark-on-surface-variant hover:text-gray-700 dark:hover:text-dark-on-surface"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>

          {isLoading ? (
            <p className="py-3 text-sm text-gray-500 dark:text-dark-on-surface-variant">Loading...</p>
          ) : displayNotifications.length === 0 ? (
            <p className="py-3 text-sm text-gray-500 dark:text-dark-on-surface-variant">No notifications yet.</p>
          ) : (
            <ul className="max-h-96 space-y-2 overflow-auto pr-1">
              {displayNotifications.map(({ item, groupedIds, groupedCount }) => {
                const isRead = Boolean(item.readAt);
                const itemHref = getNotificationHref(item);
                return (
                  <li
                    key={item._id}
                    className={`rounded-lg border dark:border-dark-outline-variant p-3 ${isRead ? "bg-gray-50 dark:bg-dark-surface-container" : "bg-blue-50 dark:bg-dark-surface-container"} ${itemHref ? "cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-dark-surface-container-high" : ""}`}
                    onClick={() => void handleNotificationClick(item, groupedIds)}
                  >
                    <p className="text-sm font-semibold text-gray-800 dark:text-dark-on-surface">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-dark-on-surface-variant">
                      {groupedCount > 1 ? `${item.body} (${groupedCount} unread)` : item.body}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-dark-on-surface-variant">{item.type}</span>
                      {!isRead ? (
                        <button
                          type="button"
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                          onClick={(event) => {
                            event.stopPropagation();
                            void markManyAsRead(groupedIds);
                          }}
                        >
                          {groupedCount > 1 ? `Mark all ${groupedCount} as read` : "Mark as read"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-dark-on-surface-variant">Read</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

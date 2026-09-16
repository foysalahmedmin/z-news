import useNotification from "@/hooks/states/useNotification";
import { fetchNotificationRecipientsBySelf } from "@/services/notification-recipient.service";
import type { TNotificationRecipient } from "@/types/notification-recipient";
import type { TUserState } from "@/types/state.type";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

const NotificationApplier = () => {
  const {
    setTotal,
    setUnread,
    setIsConnected,
    setNotification,
    updateNotification,
    bulkUpdateNotifications,
    removeNotification,
  } = useNotification();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const { data } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => fetchNotificationRecipientsBySelf({ is_count_only: true }),
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });

  // Update counts from API response
  useEffect(() => {
    if (data?.data) {
      setUnread(Number(data?.meta?.statistics?.unread || 0));
      setTotal(Number(data?.meta?.total || 0));
    }
  }, [data, setUnread, setTotal]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch((error) => {
        console.warn("Failed to request notification permission:", error);
      });
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback(
    (recipient: TNotificationRecipient) => {
      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        recipient.notification
      ) {
        try {
          const notification = new Notification(recipient.notification.title, {
            body: recipient.notification.message,
            icon: "/notification.svg",
            badge: "/notification.svg",
            tag: recipient._id, // Prevent duplicate notifications
            requireInteraction: false,
          });

          // Auto-close after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);

          // Handle click
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (error) {
          console.warn("Failed to show browser notification:", error);
        }
      }
    },
    [],
  );

  // Connect socket
  const connectSocket = useCallback(() => {
    const userString = localStorage.getItem("user");
    const user: TUserState | null = userString
      ? (JSON.parse(userString) as TUserState)
      : null;

    if (!user?.token) {
      console.warn("No user token found, skipping socket connection");
      return;
    }

    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const url = new URL(apiUrl);
      const path =
        url.pathname === "/" || !url.pathname ? "/socket.io" : url.pathname;

      const socket: Socket = io(import.meta.env.VITE_API_URL, {
        auth: { token: user.token },
        reconnection: true,
        reconnectionDelay: baseReconnectDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000,
        transports: ["websocket", "polling"],
        path,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Socket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Refetch notification count on connect
        queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
        setIsConnected(false);

        // Only attempt manual reconnection if it wasn't intentional
        if (reason === "io server disconnect") {
          // Server disconnected, reconnect manually
          socket.connect();
        } else if (reason === "io client disconnect") {
          // Client disconnected intentionally, don't reconnect
          return;
        }
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setIsConnected(false);
        reconnectAttemptsRef.current += 1;

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay =
            baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`,
            );
            connectSocket();
          }, delay);
        } else {
          console.error("❌ Max reconnection attempts reached");
        }
      });

      socket.on(
        "notification-recipient-created",
        (recipient: TNotificationRecipient) => {
          console.log("📬 New notification received:", recipient);
          setNotification(recipient);
          showBrowserNotification(recipient);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
        },
      );

      socket.on(
        "notification-recipient-updated",
        (data: { _id: string; read_at: string; is_read?: boolean }) => {
          console.log("📝 Notification updated:", data);
          updateNotification({
            _id: data._id,
            read_at: data.read_at,
          });

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
        },
      );

      socket.on(
        "notification-recipients-bulk-updated",
        (data: { count: number; action: string }) => {
          console.log("📝 Bulk notification update:", data);
          bulkUpdateNotifications(data);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
        },
      );

      socket.on("notification-recipient-deleted", (data: { _id: string }) => {
        console.log("🗑️ Notification deleted:", data);
        removeNotification(data._id);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      });
    } catch (error) {
      console.error("❌ Failed to initialize socket:", error);
      setIsConnected(false);
    }
  }, [
    setIsConnected,
    setNotification,
    updateNotification,
    bulkUpdateNotifications,
    removeNotification,
    showBrowserNotification,
    queryClient,
  ]);

  // Initialize socket connection
  useEffect(() => {
    connectSocket();

    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connectSocket]);

  return null;
};

export default NotificationApplier;

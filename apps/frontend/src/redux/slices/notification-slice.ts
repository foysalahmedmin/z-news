import type { TNotificationRecipient } from "@/types/notification-recipient";
import type { NotificationsState } from "@/types/state.type";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState: NotificationsState = {
  notifications: [],
  unread: 0,
  total: 0,
  isConnected: false,
};

const notificationsSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotification: (state, action: PayloadAction<TNotificationRecipient>) => {
      // Check if notification already exists to prevent duplicates
      const exists = state.notifications.some(
        (n) => n._id === action.payload._id,
      );
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.is_read) {
          state.unread += 1;
        }
        state.total += 1;
      }
    },
    updateNotification: (
      state,
      action: PayloadAction<{ _id: string; read_at?: string; is_read?: boolean }>,
    ) => {
      const wasRead = state.notifications.find(
        (n) => n._id === action.payload._id,
      )?.is_read;

      state.notifications = state.notifications.map((recipient) =>
        recipient._id === action.payload._id
          ? {
              ...recipient,
              is_read: action.payload.is_read ?? true,
              read_at: action.payload.read_at
                ? new Date(action.payload.read_at)
                : recipient.read_at || new Date(),
            }
          : recipient,
      );

      // Update unread count only if status changed
      if (wasRead === false && action.payload.is_read !== false) {
        state.unread = Math.max(0, state.unread - 1);
      } else if (wasRead === true && action.payload.is_read === false) {
        state.unread += 1;
      }
    },
    bulkUpdateNotifications: (
      state,
      action: PayloadAction<{ count: number; action: string }>,
    ) => {
      if (action.payload.action === "read-all") {
        // Mark all as read
        state.notifications = state.notifications.map((recipient) => ({
          ...recipient,
          is_read: true,
          read_at: recipient.read_at || new Date(),
        }));
        state.unread = 0;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload,
      );
      if (notification) {
        if (!notification.is_read) {
          state.unread = Math.max(0, state.unread - 1);
        }
        state.total = Math.max(0, state.total - 1);
        state.notifications = state.notifications.filter(
          (n) => n._id !== action.payload,
        );
      }
    },
    setUnread: (state, action: PayloadAction<number>) => {
      state.unread = Math.max(0, action.payload);
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = Math.max(0, action.payload);
    },
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unread = 0;
      state.total = 0;
    },
  },
});

export const {
  setNotification,
  updateNotification,
  bulkUpdateNotifications,
  removeNotification,
  setUnread,
  setTotal,
  setIsConnected,
  resetNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

import {
  bulkUpdateNotifications as bulkUpdateNotificationsSlice,
  removeNotification as removeNotificationSlice,
  resetNotifications as resetNotificationsSlice,
  setIsConnected as setIsConnectedSlice,
  setNotification as setNotificationSlice,
  setTotal as setTotalSlice,
  setUnread as setUnreadSlice,
  updateNotification as updateNotificationSlice,
} from "@/redux/slices/notification-slice";
import type { AppDispatch, RootState } from "@/redux/store";
import type { TNotificationRecipient } from "@/types/notification-recipient";
import { useDispatch, useSelector } from "react-redux";

const useNotification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notificationState = useSelector(
    (state: RootState) => state.notification,
  );

  // Action dispatchers
  const setNotification = (notification: TNotificationRecipient) =>
    dispatch(setNotificationSlice(notification));

  const updateNotification = (payload: {
    _id: string;
    read_at?: string;
    is_read?: boolean;
  }) => dispatch(updateNotificationSlice(payload));

  const bulkUpdateNotifications = (payload: {
    count: number;
    action: string;
  }) => dispatch(bulkUpdateNotificationsSlice(payload));

  const removeNotification = (id: string) =>
    dispatch(removeNotificationSlice(id));

  const setUnread = (count: number) => dispatch(setUnreadSlice(count));

  const setTotal = (count: number) => dispatch(setTotalSlice(count));

  const setIsConnected = (status: boolean) =>
    dispatch(setIsConnectedSlice(status));

  const resetNotifications = () => dispatch(resetNotificationsSlice());

  return {
    // State
    notifications: notificationState.notifications,
    unread: notificationState.unread,
    total: notificationState.total,
    isConnected: notificationState.isConnected,

    // Actions
    setNotification,
    updateNotification,
    bulkUpdateNotifications,
    removeNotification,
    setUnread,
    setTotal,
    setIsConnected,
    resetNotifications,
  };
};

export default useNotification;

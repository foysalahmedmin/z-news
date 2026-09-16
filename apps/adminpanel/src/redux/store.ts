import { configureStore } from "@reduxjs/toolkit";
import routeMenuReducer from "./slices/menu-slice";
import notificationReducer from "./slices/notification-slice";
import settingReducer from "./slices/setting-slice";
import userReducer from "./slices/user-slice";

export const store = configureStore({
  reducer: {
    menu: routeMenuReducer,
    setting: settingReducer,
    user: userReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

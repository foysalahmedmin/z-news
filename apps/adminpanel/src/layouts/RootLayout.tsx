import MenuApplier from "@/components/appliers/MenuApplier";
import SettingApplier from "@/components/appliers/SettingApplier";
import ToastApplier from "@/components/appliers/ToastApplier";
import { Outlet } from "react-router";
import NotificationApplier from "../components/appliers/NotificationApplier";

const RootLayout = () => {
  return (
    <>
      <MenuApplier />
      <SettingApplier />
      <NotificationApplier />
      <ToastApplier />
      <Outlet />
    </>
  );
};

export default RootLayout;

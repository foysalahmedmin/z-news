import { items } from "@/assets/data/route-menu-items";
import { RouteMenu } from "@/builder/RouteMenu";
import AuthWrapper from "@/components/wrappers/AuthWrapper";
import AuthLayout from "@/layouts/AuthLayout";
import CommonLayout from "@/layouts/CommonLayout";
import RootLayout from "@/layouts/RootLayout";
import SignInPage from "@/pages/(auth)/SignInPage";
import SignUpPage from "@/pages/(auth)/SignUpPage";
import ErrorPage from "@/pages/(partial)/ErrorPage";
import MaintenancePage from "@/pages/(partial)/MaintenancePage";
import NotFoundPage from "@/pages/(partial)/NotFoundPage";
import { useMemo } from "react";
import { createBrowserRouter } from "react-router";
import useUser from "./useUser";

const useAppRouter = () => {
  const { user } = useUser();
  const { info } = user || {};

  const routesData = useMemo(() => {
    const routeMenu = new RouteMenu(items);
    return routeMenu.getRoutes({ role: info?.role });
  }, [info?.role]);

  const { routes } = routesData || {};

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "",
          element: (
            <AuthWrapper>
              <CommonLayout />
            </AuthWrapper>
          ),
          children: routes || [],
        },
        {
          path: "auth",
          element: <AuthLayout />,
          children: [
            {
              path: "signin",
              element: <SignInPage />,
            },
            {
              path: "signup",
              element: <SignUpPage />,
            },
          ],
        },
      ],
    },
    {
      path: "maintenance",
      element: <MaintenancePage />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);

  return router;
};

export default useAppRouter;

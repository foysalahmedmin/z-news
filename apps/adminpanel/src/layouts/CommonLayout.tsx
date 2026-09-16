import Header from "@/components/partials/Header";
import Loader from "@/components/partials/Loader";
import Settings from "@/components/partials/Setting";
import Sidebar from "@/components/partials/Sidebar";
import useSetting from "@/hooks/states/useSetting";
import { useSidebar } from "@/hooks/ui/useSidebar";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Outlet } from "react-router";

const CommonLayout = () => {
  const { setting } = useSetting();
  const { isMobileOpen, toggleMobile, closeMobile } = useSidebar();

  const isCompact = setting.sidebar === "compact";

  return (
    <div className="bg-background flex h-screen w-screen overflow-hidden">
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <div className="relative z-50 lg:z-0">
        <aside
          className={cn(
            "group/sidebar bg-card text-card-foreground fixed start-0 top-0 bottom-0 h-full border-r shadow-lg",
            "transform transition-transform duration-300 ease-in-out",
            "w-full max-w-80 lg:relative lg:translate-x-0 lg:shadow-none",
            // Desktop compact behavior
            "lg:w-80 lg:transition-[width] lg:duration-300",
            {
              "lg:w-20 lg:hover:w-80": isCompact,
              "lg:hover:shadow-xl": isCompact,
            },
            // Mobile behavior
            {
              "-translate-x-full": !isMobileOpen,
              "translate-x-0": isMobileOpen,
            },
            {
              dark: setting.theme === "semi-dark",
            },
          )}
        >
          <Sidebar onClose={closeMobile} />
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="bg-background flex min-w-0 flex-1 flex-col">
        <Header
          isMobileOpen={isMobileOpen}
          onToggleMobile={toggleMobile}
          className="flex-shrink-0"
        />

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full w-full px-4 py-6 lg:px-6">
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <Settings />
    </div>
  );
};

export default CommonLayout;

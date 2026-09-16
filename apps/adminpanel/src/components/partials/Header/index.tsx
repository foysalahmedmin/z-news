import { Button } from "@/components/ui/Button";
import useSetting from "@/hooks/states/useSetting";
import { cn } from "@/lib/utils";
import { AlignLeft, AlignRight, Menu, MoveLeft, MoveRight } from "lucide-react";
import React, { memo } from "react";
import Notification from "./Notification";
import Profile from "./Profile";
import Search from "./Search";

interface HeaderProps {
  className?: string;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
}

const Header: React.FC<HeaderProps> = memo(
  ({ className, isMobileOpen, onToggleMobile }) => {
    const { setting, toggleSidebar } = useSetting();
    const isRtl = setting.direction === "rtl";
    const isCompact = setting.sidebar === "compact";

    const getDesktopIcon = () => {
      if (isCompact) {
        return isRtl ? <MoveLeft /> : <MoveRight />;
      }
      return isRtl ? (
        <AlignRight className="size-6" />
      ) : (
        <AlignLeft className="size-6" />
      );
    };

    const getMobileIcon = () => {
      if (isMobileOpen) {
        return <Menu className="size-6" />;
      }
      return <Menu className="size-6" />;
    };

    return (
      <header
        className={cn(
          "sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6",
          "bg-card h-16 lg:h-20",
          "border-border border-b",
          className,
        )}
      >
        <div className="flex items-center gap-4">
          {/* Desktop Sidebar Toggle */}
          <Button
            onClick={toggleSidebar}
            aria-label={isCompact ? "Expand sidebar" : "Collapse sidebar"}
            shape="icon"
            size="none"
            variant="none"
            className="hidden lg:inline-flex"
          >
            {getDesktopIcon()}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            onClick={onToggleMobile}
            shape="icon"
            size="none"
            variant="none"
            className="lg:hidden"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {getMobileIcon()}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <Search />
          </div>
          <div>
            <Notification />
          </div>
          <div>
            <Profile />
          </div>
        </div>
      </header>
    );
  },
);

Header.displayName = "Header";

export default Header;

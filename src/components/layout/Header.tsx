import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import GlobalSearch from "./GlobalSearch";
import MobileSidebar from "./MobileSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className={`h-14 md:h-16 bg-card border-b border-border flex items-center justify-between ${isMobile ? "px-3" : "px-6"} sticky top-0 z-40`}>
      {/* Mobile Menu + Title */}
      <div className="flex items-center gap-2">
        {isMobile && <MobileSidebar />}
        <div>
          <h1 className={`${isMobile ? "text-base" : "text-xl"} font-bold text-foreground`}>{title}</h1>
          {subtitle && !isMobile && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Global Search - Hidden on very small screens */}
        <div className={isMobile ? "hidden sm:block" : ""}>
          <GlobalSearch />
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User - Hidden on mobile (available in drawer) */}
        {!isMobile && (
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

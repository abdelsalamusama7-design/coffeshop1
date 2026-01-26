import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const MainLayout = ({ children, title, subtitle }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      <div className={isMobile ? "" : "mr-64"}>
        <Header title={title} subtitle={subtitle} />
        <main className={`${isMobile ? "p-3 pb-20" : "p-6"}`}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;

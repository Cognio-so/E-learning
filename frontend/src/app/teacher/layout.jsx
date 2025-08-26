import { Suspense, lazy } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

// Lazy load the sidebar component
const TeacherSidebar = lazy(() => import("@/components/teacher-sidebar").then(mod => ({ default: mod.TeacherSidebar })));

// Loading fallback for sidebar
const SidebarFallback = () => (
  <div className="w-64 h-screen bg-background border-r border-border animate-pulse">
    <div className="p-4 border-b border-border">
      <div className="h-8 bg-muted rounded w-32"></div>
    </div>
    <div className="p-4 space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-10 bg-muted rounded"></div>
      ))}
    </div>
  </div>
);

const TeacherLayout = ({ children }) => {
    return (
        <SidebarProvider>
            <Suspense fallback={<SidebarFallback />}>
                <TeacherSidebar />
            </Suspense>
            <main className="flex-1">{children}</main>
        </SidebarProvider>
    )
}

export default TeacherLayout;
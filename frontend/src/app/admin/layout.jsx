
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";




export default function AdminLayout({ children }) {

    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex-1">{children}</main>
        </SidebarProvider>
    );
}
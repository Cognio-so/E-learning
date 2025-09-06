"use client"
import {  Home, Settings2Icon, User, Users, BookOpen, Clock, GraduationCap, Shield, LogOut, Sun, Moon } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import useAuthStore from "@/store/useAuthStore"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "User Management",
    url: "/admin/management",
    icon: Users,
  },
  {
    title: "Curriculum Management",
    url: "/admin/curriculum",
    icon: BookOpen,
  },
  {
    title: "Classes & Subjects",
    url: "/admin/classes-subjects",
    icon: GraduationCap,
  },
  {
    title: "History",
    url: "/admin/history",
    icon: Clock,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings2Icon,
  },
]

export function AdminSidebar() {
  const { user, logout } = useAuthStore();
  const { state } = useSidebar();
  const { theme, setTheme } = useTheme();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();
  const router = useRouter();
  const isActivePath = useCallback((url) => {
    return pathname === url;
  }, [pathname]);

  const handleLogout = async () => {
     await logout();
     router.push("/auth/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header with logo */}
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold group-data-[collapsible=icon]:hidden">Admin Panel</span>
            <span className="text-xl font-bold hidden group-data-[collapsible=icon]:block">A</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup className="px-2 mt-6">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url} className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent ${
                      isActivePath(item.url)
                        ? "bg-accent border-l-4 border-l-violet-500 shadow-sm" 
                        : ""
                    }`}>
                      <item.icon className="h-5 w-5 min-w-5" />
                      <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Footer with user profile, theme toggle, and logout */}
      <SidebarFooter className="border-t border-border mt-auto">
        {/* Sidebar Trigger - only visible when collapsed, above user profile */}
        <div className="hidden group-data-[collapsible=icon]:block border-b border-border">
          <div className="flex justify-center p-2">
            <SidebarTrigger className="h-6 w-6" />
          </div>
        </div>
        
        {/* Theme Toggle and Logout buttons */}
        <div className="flex items-center gap-2 p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="flex-1 h-8 px-2 group-data-[collapsible=icon]:px-2"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="ml-2 text-xs group-data-[collapsible=icon]:hidden">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex-1 h-8 px-2 group-data-[collapsible=icon]:px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2 text-xs group-data-[collapsible=icon]:hidden">
              Logout
            </span>
          </Button>
        </div>
        
        {/* User profile */}
        <div className="flex items-center justify-between gap-3 p-4">
          <Avatar className="flex-shrink-0 h-8 w-8">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback className="text-xs">
              {user?.profilePicture?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "admin@admin.com"}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
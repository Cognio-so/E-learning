"use client"
import { memo, useMemo, useCallback } from "react";
import { 
  AudioLines, 
  BarChart3, 
  BookOpen, 
  ClipboardCheck, 
  Home, 
  LogOut, 
  TableOfContents, 
  ToolCase, 
  UsersRound 
} from "lucide-react"

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
import useAuthStore from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

// Menu items - moved outside component to prevent recreation
const MENU_ITEMS = [
  {
    title: "Dashboard",
    url: "/teacher/dashboard",
    icon: Home,
  },
  {
    title: "Content-Generator",
    url: "/teacher/content-generator",
    icon: TableOfContents,
  },
  {
    title: "Assessment-Generator",
    url: "/teacher/assessment-generator",
    icon: ClipboardCheck,
  },
  {
    title: "Media-Toolkit",
    url: "/teacher/media-toolkit",
    icon: ToolCase,
  },
  {
    title: "Library",
    url: "/teacher/library",
    icon: BookOpen,
  },
  {
    title: "Class-Grouping",
    url: "/teacher/class-grouping",
    icon: UsersRound,
  },
  {
    title: "Reports",
    url: "/teacher/reports",
    icon: BarChart3,
  },
  {
    title: "Voice-Coach",
    url: "/teacher/voice-coach",
    icon: AudioLines,
  },
];

// Memoized menu item component for better performance
const MenuItem = memo(({ item, isActive, isCollapsed }) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild tooltip={item.title}>
      <Link 
        href={item.url} 
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-accent/90"
        }`}
        prefetch={true} // Enable prefetching for faster navigation
      >
        <item.icon className="h-5 w-5 min-w-5" />
        <span className="text-[16px] font-medium group-data-[collapsible=icon]:hidden">
          {item.title}
        </span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
));

MenuItem.displayName = "MenuItem";

// Memoized user profile component
const UserProfile = memo(({ user, isCollapsed }) => (
  <div className="flex items-center gap-3 p-2">
    <Avatar>
      <AvatarImage src={user?.imageUrl} />
      <AvatarFallback>
        {user?.name?.charAt(0) || "U"}
      </AvatarFallback>
    </Avatar>
    <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1">
      <p className="text-sm font-medium truncate">
        {user?.name}
      </p>
      <p className="text-xs text-muted-foreground truncate">
        {user?.email || ""}
      </p>
    </div>
  </div>
));

UserProfile.displayName = "UserProfile";

// Memoized logo component
const Logo = memo(({ isCollapsed }) => (
  <div className="flex items-center">
    <span className="text-2xl font-bold group-data-[collapsible=icon]:hidden">
      ED-Teach
    </span>
    <span className="text-xl font-bold hidden group-data-[collapsible=icon]:block">
      ED
    </span>
  </div>
));

Logo.displayName = "Logo";

export function TeacherSidebar() {
  const { user, logout } = useAuthStore();
  const { state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";
  const router = useRouter();
  // Memoize active path check
  const isActivePath = useCallback((url) => {
    return pathname === url;
  }, [pathname]);

  // Memoize menu items with active state
  const menuItemsWithActiveState = useMemo(() => {
    return MENU_ITEMS.map(item => ({
      ...item,
      isActive: isActivePath(item.url)
    }));
  }, [isActivePath]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    router.push("/auth/login");
  }

  return (
    <Sidebar collapsible="icon">
      {/* Header with logo */}
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Logo isCollapsed={isCollapsed} />
          
          {/* Sidebar Trigger - only visible when expanded */}
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarTrigger className="h-6 w-6" />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup className="px-2 mt-6">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItemsWithActiveState.map((item) => (
                <MenuItem
                  key={item.title}
                  item={item}
                  isActive={item.isActive}
                  isCollapsed={isCollapsed}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Footer with user profile */}
      <SidebarFooter className="border-t border-border mt-auto">
        <div className="hidden group-data-[collapsible=icon]:block border-b border-border">
          <div className="flex justify-center p-2">
            <SidebarTrigger className="h-6 w-6" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 p-2">
          <ThemeToggle />
        <Button onClick={handleLogout} variant="ghost">
          {isCollapsed ? <LogOut className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
          <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
        </div>
        
        <UserProfile user={user} isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  )
}
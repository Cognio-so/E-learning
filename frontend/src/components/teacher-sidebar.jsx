"use client"
import { memo, useMemo, useCallback, useState } from "react";
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
  // {
  //   title: "Reports",
  //   url: "/teacher/reports",
  //   icon: BarChart3,
  // },
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

// Memoized user profile component - fixed overflow in footer
const UserProfile = memo(({ user, isCollapsed, isExpanded, onToggle, onLogout }) => (
  <div className="p-2 min-w-0 w-full">
    <div 
      className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors min-w-0 w-full"
      onClick={onToggle}
    >
      <Avatar className="flex-shrink-0 h-8 w-8">
        <AvatarImage src={user?.imageUrl} />
        <AvatarFallback className="text-xs">
          {user?.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1 overflow-hidden">
        <p className="text-sm font-medium truncate">
          {user?.name || "User"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {user?.email || "user@example.com"}
        </p>
      </div>
      {/* Dropdown arrow */}
      <div className="group-data-[collapsible=icon]:hidden flex-shrink-0 ml-auto">
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    
    {/* Collapsible actions container */}
    {isExpanded && (
      <div className="mt-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between px-2">
          <ThemeToggle />
          <Button 
            onClick={onLogout} 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent rounded-md"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    )}
  </div>
));

UserProfile.displayName = "UserProfile";

// Memoized logo component - fixed overflow
const Logo = memo(({ isCollapsed }) => (
  <div className="flex items-center min-w-0">
    <span className="text-xl font-bold group-data-[collapsible=icon]:hidden truncate">
      ED-Teach
    </span>
    <span className="text-lg font-bold hidden group-data-[collapsible=icon]:block">
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
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
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

  const toggleProfile = () => {
    setIsProfileExpanded(!isProfileExpanded);
  }

  return (
    <Sidebar collapsible="icon">
      {/* Header with logo */}
      <SidebarHeader className="border-b border-border min-w-0">
        <div className="flex items-center justify-between p-3 min-w-0">
          <Logo isCollapsed={isCollapsed} />
          
          {/* Sidebar Trigger - only visible when expanded */}
          <div className="group-data-[collapsible=icon]:hidden flex-shrink-0">
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
      <SidebarFooter className="border-t border-border mt-auto min-w-0 w-full">
        <div className="hidden group-data-[collapsible=icon]:block border-b border-border">
          <div className="flex justify-center p-2">
            <SidebarTrigger className="h-6 w-6" />
          </div>
        </div>

        <div className="w-full min-w-0">
          <UserProfile 
            user={user} 
            isCollapsed={isCollapsed} 
            isExpanded={isProfileExpanded}
            onToggle={toggleProfile}
            onLogout={handleLogout}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
"use client";

import { useEffect, useState } from "react";
import {
  ChevronsUpDown,
  CircleUser,
  SunMoon,
  LogOut,
  Bell,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoSignedImage } from "@/components/ui/auto-signed-image";
import { isR2Url } from "@/lib/r2-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Génère les initiales à partir du nom de l'utilisateur
 */
const generateInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [userData, setUserData] = useState<UserData>({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  /**
   * Récupère les données utilisateur depuis l'API
   */
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // Les données sont dans data.user
          const userDataFromApi = data.user || data;
          const imageUrl =
            userDataFromApi.avatar || userDataFromApi.profileImage;

          setUserData({
            name: userDataFromApi.name || user.name,
            email: userDataFromApi.email || user.email,
            avatar: imageUrl,
          });
        } else {
          console.warn("Impossible de récupérer les données utilisateur");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user.name, user.email, user.avatar]);

  /**
   * Récupère le nombre de notifications non lues
   */
  useEffect(() => {
    const fetchUnreadNotificationsCount = async () => {
      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadNotificationsCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du nombre de notifications:",
          error
        );
      }
    };

    fetchUnreadNotificationsCount();
  }, []);

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleLogOut = async () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "hasOrganization=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("organizations-storage");
      localStorage.removeItem("sidebar-storage");
    } catch {}

    sessionStorage.setItem("showLogoutMessage", "true");

    window.location.href = "/auth/login";
  };

  const userInitials = generateInitials(userData.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {userData.avatar ? (
                  isR2Url(userData.avatar) ? (
                    <AutoSignedImage
                      src={userData.avatar}
                      alt={userData.name}
                      className="w-full h-full object-cover rounded-lg"
                      errorComponent={
                        <AvatarFallback className="rounded-lg">
                          {isLoading ? "..." : userInitials}
                        </AvatarFallback>
                      }
                    />
                  ) : (
                    <AvatarImage
                      src={userData.avatar}
                      alt={userData.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )
                ) : (
                  <AvatarFallback className="rounded-lg">
                    {isLoading ? "..." : userInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userData.name}</span>
                <span className="truncate text-xs">{userData.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {userData.avatar ? (
                    isR2Url(userData.avatar) ? (
                      <AutoSignedImage
                        src={userData.avatar}
                        alt={userData.name}
                        className="w-full h-full object-cover rounded-lg"
                        errorComponent={
                          <AvatarFallback className="rounded-lg">
                            {isLoading ? "..." : userInitials}
                          </AvatarFallback>
                        }
                      />
                    ) : (
                      <AvatarImage
                        src={userData.avatar}
                        alt={userData.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )
                  ) : (
                    <AvatarFallback className="rounded-lg">
                      {isLoading ? "..." : userInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userData.name}</span>
                  <span className="truncate text-xs">{userData.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CircleUser />
                <a href="/dashboard/profile" className="">
                  Mon compte
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="relative">
                  <Bell />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotificationsCount > 99
                        ? "99+"
                        : unreadNotificationsCount}
                    </span>
                  )}
                </div>
                <a href="/dashboard/notifications" className="">
                  Notifications
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SunMoon />
                <a href="#" onClick={handleThemeChange} className="">
                  Changer de thème
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              <a href="#" onClick={handleLogOut} className="">
                Me deconnecter
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

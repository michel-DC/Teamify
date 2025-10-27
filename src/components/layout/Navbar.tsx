"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Menu, X, CircleChevronRight, LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { gsap } from "gsap";
import Link from "next/link";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { checkAuth, logout } = useAuth();
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const authResult = await checkAuth();
        setIsAuthenticated(authResult.isAuthenticated);
        setUser(authResult.user);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (navbarRef.current) {
      // Animation d'entrée de la navbar depuis le haut
      gsap.fromTo(
        navbarRef.current,
        {
          y: -100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.2,
        }
      );
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav ref={navbarRef} className="fixed top-0 left-0 w-full z-50 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-1.5 sm:py-2 md:py-3 lg:py-3 xl:py-4 bg-white-500 ">
      <div className="border border-gray-300 rounded-full max-w-6xl xl:max-w-7xl w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-1.5 sm:py-2 md:py-3 lg:py-3 xl:py-4 flex items-center justify-between gap-x-1 sm:gap-x-3 md:gap-x-6 lg:gap-x-8 xl:gap-x-10 relative z-50 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Image
              src="/images/logo/favicon.svg"
              alt="Teamify"
              width={32}
              height={32}
              className="md:hidden"
            />
            <Image
              src="/images/logo/favicon-text-for-pages.svg"
              alt="Teamify"
              width={120}
              height={32}
              className="hidden md:block"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-x-3 lg:gap-x-6 xl:gap-x-10">
          <Link
            href="#features"
            className="text-[#262626] hover:text-[#7C3AED] transition-colors font-medium text-xs lg:text-sm xl:text-base"
          >
            Fonctionnalités
          </Link>
          <Link
            href="#for-you"
            className="text-[#262626] hover:text-[#7C3AED] transition-colors font-medium text-xs lg:text-sm xl:text-base"
          >
            Pour vous
          </Link>
          <Link
            href="#pricing"
            className="text-[#262626] hover:text-[#7C3AED] transition-colors font-medium text-xs lg:text-sm xl:text-base"
          >
            Tarifs
          </Link>
          <Link
            href="#faq"
            className="text-[#262626] hover:text-[#7C3AED] transition-colors font-medium text-xs lg:text-sm xl:text-base"
          >
            FAQ
          </Link>
          <Link 
            href="#testimonials"
              className="text-[#262626] hover:text-[#7C3AED] transition-colors font-medium text-xs lg:text-sm xl:text-base"
          >
            Témoignages
          </Link>
        </div>

        <div className="hidden md:block">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto px-2 py-1 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar || user?.image} alt={user?.name || user?.firstname} />
                        <AvatarFallback>
                          {user?.name ? user.name.charAt(0).toUpperCase() : user?.firstname ? user.firstname.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                        <span className="text-sm text-[#262626]">Mon profil</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user?.name && (
                          <p className="font-medium">{user.name}</p>
                        )}
                        {user?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Se déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm"
                  asChild
                >
                  <Link href="/auth/register">
                    Essayer Gratuitement
                    <CircleChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>

        <Button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          type="button"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </Button>

        {isMenuOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg translate-y-2 py-3 sm:py-4 px-3 sm:px-4 md:hidden w-full z-99"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <Link   
                href="#features"
                className="text-[#262626] hover:text-[#7C3AED] transition-colors py-1.5 sm:py-2 font-medium text-sm sm:text-base"
                onClick={toggleMenu}
              >
                Fonctionnalités
              </Link>
                  <Link
                href="#for-you"
                className="text-[#262626] hover:text-[#7C3AED] transition-colors py-1.5 sm:py-2 font-medium text-sm sm:text-base"
                onClick={toggleMenu}
              >
                Pour vous
              </Link>
                <Link
                href="#pricing"
                className="text-[#262626] hover:text-[#7C3AED] transition-colors py-1.5 sm:py-2 font-medium text-sm sm:text-base"
                onClick={toggleMenu}
              >
                Tarifs
              </Link>
              <Link
                href="#faq"
                className="text-[#262626] hover:text-[#7C3AED] transition-colors py-1.5 sm:py-2 font-medium text-sm sm:text-base"
                onClick={toggleMenu}
              >
                FAQ
              </Link>
              <Link
                href="#testimonials"
                className="text-[#262626] hover:text-[#7C3AED] transition-colors py-1.5 sm:py-2 font-medium text-sm sm:text-base"
                onClick={toggleMenu}
              >
                Témoignages
              </Link>
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="w-full justify-start h-auto p-3 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar || user?.image} alt={user?.name || user?.firstname} />
                                <AvatarFallback>
                                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.firstname ? user.firstname.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col items-start">
                                <span className="text-sm font-medium">
                                  {user?.name || user?.firstname || "Utilisateur"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {user?.email}
                                </span>
                              </div>
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                          <DropdownMenuItem asChild>
                            <a href="/dashboard" className="flex items-center cursor-pointer" onClick={toggleMenu}>
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              <span>Dashboard</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Se déconnecter</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <Button
                      asChild
                      className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm mt-2"
                    >
                      <Link href="/auth/register" onClick={toggleMenu}>
                        Essayer Gratuitement
                        <CircleChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
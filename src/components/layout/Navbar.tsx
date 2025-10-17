"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faCogs,
  faNewspaper,
  faQuestionCircle,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { href: "/about", text: "À Propos", icon: faInfoCircle },
    { href: "/services", text: "Services", icon: faCogs },
    { href: "/blog", text: "Blog", icon: faNewspaper },
    { href: "/faq", text: "FAQ", icon: faQuestionCircle },
    {
      href: "/auth/login",
      text: "Connexion",
      prefetch: false,
      icon: faSignInAlt,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/50">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center h-16">
          <div className="w-auto h-12">
            <Link href="/">
              <Image
                width={500}
                height={100}
                src="/images/logo/noir-rb.png"
                alt="Teamify Logo"
                className="object-contain w-full h-full"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden space-x-4 md:flex">
            {navLinks.map((link, index) => (
              <React.Fragment key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center text-gray-300 cursor-pointer hover:text-indigo-500"
                  prefetch={link.prefetch}
                >
                  <FontAwesomeIcon icon={link.icon} className="mr-2" />
                  {link.text}
                </Link>
                {index < navLinks.length - 1 && (
                  <span className="text-gray-300">|</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-300 cursor-pointer md:hidden hover:text-indigo-500 focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="pb-4 md:hidden">
            <div className="flex flex-col mt-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-4 py-2 text-gray-300 hover:text-indigo-500"
                  onClick={toggleMenu}
                  prefetch={link.prefetch}
                >
                  <FontAwesomeIcon icon={link.icon} className="mr-2" />
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

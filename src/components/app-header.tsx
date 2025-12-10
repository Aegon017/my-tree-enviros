"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, User, Heart, ShoppingCart, Bell, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import AppLogo from "./ui/app-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { LocationButton } from "./location/location-button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/sponsor-a-tree", label: "Sponsor A Tree" },
  { href: "/adopt-a-tree", label: "Adopt A Tree" },
  { href: "/the-green-alliance", label: "The Green Alliance" },
  { href: "/store", label: "Store" },
];

function AccountMenu({ isAuthenticated, signOut }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {!isAuthenticated && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/sign-in" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <LogIn />
                  Sign In
                </div>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {isAuthenticated && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/my-profile" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <User />
                  My Profile
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-orders" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <ShoppingCart />
                  My Orders
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={signOut}>
              <div className="flex items-center gap-2 cursor-pointer">
                <LogOut />
                Sign Out
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAuthenticated, signOut } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <motion.header
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full z-50"
      >
        <div className="mx-auto max-w-6xl px-3 py-3">
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative bg-background border shadow-sm rounded-2xl px-6 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <LocationButton />
            </div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45 }}
            >
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <AppLogo className="h-14 hidden md:block" />
              </motion.div>
            </motion.div>

            {!isMobile && (
              <motion.div
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <NavIcon href="/wishlist" icon={Heart} />
                <NavIcon href="/cart" icon={ShoppingCart} />
                <NavIcon href="/notifications" icon={Bell} />
                <AccountMenu
                  isAuthenticated={isAuthenticated}
                  signOut={signOut}
                />
              </motion.div>
            )}

            {isMobile && (
              <MobileNav authenticated={isAuthenticated} signOut={signOut} />
            )}
          </motion.div>
        </div>
      </motion.header>

      {!isMobile && mounted && (
        <motion.div
          className="w-full flex justify-center pb-3 sticky top-2 z-50"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <nav className="flex gap-12 bg-background border shadow-sm rounded-full px-10 py-2.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-lg font-medium transition-colors",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </>
  );
}

function NavIcon({ href, icon: Icon }: any) {
  return (
    <motion.div whileHover={{ scale: 1.12 }}>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-primary"
      >
        <Link href={href}>
          <Icon className="w-5 h-5" />
        </Link>
      </Button>
    </motion.div>
  );
}

function MobileNav({ authenticated, signOut }: any) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[270px] p-0 bg-background">
        <div className="p-5 border-b flex justify-between items-center">
          <p className="font-semibold text-lg">My Tree Enviros</p>
        </div>

        <div className="py-3 flex flex-col gap-4">
          {NAV.map((item) => (
            <SheetClose asChild key={item.href}>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  href={item.href}
                  className="px-4 py-3 text-sm hover:bg-accent"
                >
                  {item.label}
                </Link>
              </motion.div>
            </SheetClose>
          ))}
        </div>

        <div className="p-4">
          {!authenticated ? (
            <div className="flex flex-col gap-2">
              <SheetClose asChild>
                <Link
                  href="/sign-in"
                  className="text-center bg-primary text-primary-foreground py-2 rounded"
                >
                  Sign In
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/sign-up"
                  className="text-center border py-2 rounded"
                >
                  Sign Up
                </Link>
              </SheetClose>
            </div>
          ) : (
            <Button
              onClick={signOut}
              variant="ghost"
              className="w-full justify-start text-sm mt-2 text-primary"
            >
              Sign Out
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

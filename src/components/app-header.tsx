"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  User,
  Heart,
  ShoppingCart,
  Bell,
  LogIn,
  LogOut,
  Home,
  HandHeart,
  TreePine,
  Sprout,
  Store as StoreIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  SheetTitle,
} from "@/components/ui/sheet";
import { LocationButton } from "./location/location-button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCart } from "@/modules/cart/hooks/use-cart";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/sponsor-a-tree", label: "Sponsor A Tree", icon: HandHeart },
  { href: "/adopt-a-tree", label: "Adopt A Tree", icon: TreePine },
  { href: "/feed-the-tree", label: "Feed the Tree", icon: Sprout },
  { href: "/store", label: "Store", icon: StoreIcon },
];

type AccountMenuProps = {
  isAuthenticated: boolean;
  signOut: () => void;
};

function AccountMenu({ isAuthenticated, signOut }: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {!isAuthenticated && (
          <DropdownMenuItem asChild>
            <Link href="/sign-in" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </DropdownMenuItem>
        )}

        {isAuthenticated && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/my-profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/my-orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                My Orders
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={signOut} className="flex gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
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
  const { items } = useCart();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = items.length;

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full z-50"
      >
        <div className="mx-auto max-w-6xl px-3 py-3">
          <div className="relative bg-background border border-border shadow-sm rounded-2xl px-4 md:px-6 py-2 md:py-3 flex flex-col md:flex-row justify-between gap-2">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2 z-10">
                {isMobile && (
                  <MobileNav
                    authenticated={isAuthenticated}
                    signOut={signOut}
                  />
                )}
                {!isMobile && <LocationButton />}
              </div>

              {isMobile && (
                <div className="absolute left-1/2 -translate-x-1/2">
                  <AppLogo className="h-14" />
                </div>
              )}

              {isMobile && (
                <div className="flex items-center gap-1 z-10">
                  <NavIcon href="/wishlist" icon={Heart} />
                  <NavIcon
                    href="/cart"
                    icon={ShoppingCart}
                    count={cartCount}
                  />
                </div>
              )}
            </div>

            {isMobile && (
              <div className="w-full flex justify-center border-t border-border pt-1.5">
                <LocationButton className="w-full justify-center" />
              </div>
            )}

            {!isMobile && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <AppLogo className="h-18" />
                </motion.div>
              </div>
            )}

            {!isMobile && (
              <div className="flex items-center gap-1.5 z-10">
                <NavIcon href="/wishlist" icon={Heart} />
                <NavIcon
                  href="/cart"
                  icon={ShoppingCart}
                  count={cartCount}
                />
                <NavIcon href="/notifications" icon={Bell} />
                <AccountMenu
                  isAuthenticated={isAuthenticated}
                  signOut={signOut}
                />
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {!isMobile && mounted && (
        <motion.div
          className="w-full flex justify-center pb-3 sticky top-2 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <nav className="flex gap-12 bg-background border border-border shadow-sm rounded-full px-10 py-2.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-lg font-medium transition-colors",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
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

type NavIconProps = {
  href: string;
  icon: React.ElementType;
  count?: number;
};

function NavIcon({ href, icon: Icon, count }: NavIconProps) {
  return (
    <motion.div whileHover={{ scale: 1.12 }} className="relative">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <Link href={href}>
          <Icon className="h-5 w-5" />
        </Link>
      </Button>
      <AnimatePresence>
        {count !== undefined && count > 0 && (
          <motion.span
            key="count-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground rounded-full border-2 border-background pointer-events-none"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type MobileNavProps = {
  authenticated: boolean;
  signOut: () => void;
};

function MobileNav({ authenticated, signOut }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] p-0 bg-background border-r">
        <VisuallyHidden>
          <SheetTitle>Mobile Navigation</SheetTitle>
        </VisuallyHidden>

        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span>My Tree Enviros</span>
          </div>
        </div>

        <div className="py-4 px-3 flex flex-col gap-1">
          {NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-md flex items-center gap-3 transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </div>

        <div className="px-3 mt-auto pb-8">
          <div className="h-px bg-border/50 my-4 mx-2" />
          {!authenticated ? (
            <div className="flex flex-col gap-3 px-2">
              <SheetClose asChild>
                <Link
                  href="/sign-in"
                  className="w-full flex items-center justify-center bg-primary text-primary-foreground font-medium py-2.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/sign-up"
                  className="w-full flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium py-2.5 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <SheetClose asChild>
                <Link
                  href="/my-profile"
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-md flex items-center gap-3 transition-colors",
                    pathname === "/my-profile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/my-orders"
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-md flex items-center gap-3 transition-colors",
                    pathname === "/my-orders" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  My Orders
                </Link>
              </SheetClose>

              <div className="h-px bg-border/50 my-2 mx-2" />

              <Button
                onClick={signOut}
                variant="ghost"
                className="w-full justify-start px-4 h-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
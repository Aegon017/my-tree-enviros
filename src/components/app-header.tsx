"use client";

import {
  Bell,
  Heart,
  MapPin,
  Menu,
  Phone,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import AppLogo from "./ui/app-logo";
import { useAuth } from "@/hooks/use-auth";
import { LocationButton } from "./location/location-button";

const NOTICE_TEXT = "Get up to 20% OFF on first-time purchase";
const PHONE_NUMBER = "+91 89777 30566";
const TOP_BAR_LINKS = [
  { name: "My Account", href: "/my-account" },
  { name: "Blogs", href: "/blogs" },
  { name: "Sign In", href: "/sign-in", isAuth: true, highlight: true },
];
const MAIN_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/sponsor-a-tree", label: "Sponsor A Tree" },
  { href: "/adopt-a-tree", label: "Adopt A Tree" },
  { href: "/feed-a-tree", label: "Feed A Tree" },
  { href: "/store", label: "Store" },
];
const ICON_LINKS = [
  { href: "/my-account", icon: User, label: "Account" },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
];

export default function Header() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAuthenticated, signOut } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <TopNotice />
      <div
        className={cn(
          "z-50 border-b border-white/5 bg-black/90 text-white backdrop-blur-sm",
          isMobile && "sticky top-0",
        )}
      >
        {isClient && <TopBar user={isAuthenticated} signOut={signOut} />}
        {isClient && <HeaderMiddle user={isAuthenticated} />}
      </div>
      {!isMobile && isClient && <HeaderBottom pathname={pathname} />}
    </>
  );
}

function TopNotice() {
  const [show, setShow] = useState(true);
  if (!show) return null;

  return (
    <div className="bg-emerald-500 text-black">
      <div className="container mx-auto flex max-w-6xl items-center justify-center gap-2 px-2 py-1.5 text-xs sm:gap-3 sm:px-4 sm:py-2 sm:text-sm">
        <span className="font-medium text-center">{NOTICE_TEXT}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShow(false)}
          className="h-6 w-6 p-0 text-black hover:bg-black/10 sm:h-7 sm:w-7"
          aria-label="Close notice"
        >
          <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function TopBar({ user, signOut }: { user: boolean; signOut: () => void }) {
  return (
    <div className="border-b border-white/5 text-xs text-white/70">
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2">
        <LocationButton />

        <div className="hidden items-center md:flex">
          {TOP_BAR_LINKS.map((item, index) => {
            if (user && item.isAuth) return null;
            return (
              <div key={item.name} className="flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    "px-2 text-xs transition-colors",
                    item.highlight
                      ? "rounded-full bg-white text-black px-3 py-1 hover:bg-slate-100"
                      : "hover:text-white",
                  )}
                >
                  {item.name}
                </Link>

                {index < TOP_BAR_LINKS.length - 1 && (
                  <Separator
                    orientation="vertical"
                    className="mx-1 h-3 bg-white/15"
                  />
                )}
              </div>
            );
          })}

          {user && (
            <Button
              variant="ghost"
              onClick={signOut}
              className="h-6 px-2 text-xs text-white/70 transition-colors hover:text-emerald-300"
            >
              Sign Out
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <Button
              variant="ghost"
              onClick={signOut}
              className="text-xs text-white/70 transition-colors hover:text-emerald-300"
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-xs text-white/70 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-slate-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HeaderMiddle({ user }: { user: boolean }) {
  const isMobile = useIsMobile();
  return (
    <div className="border-b border-white/5">
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center">
          {isMobile ? (
            <MobileNavigation user={user} />
          ) : (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-white/50" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                  Call us
                </p>
                <Link
                  href={`tel:${PHONE_NUMBER}`}
                  className="text-sm font-semibold text-white hover:text-emerald-300"
                >
                  {PHONE_NUMBER}
                </Link>
              </div>
            </div>
          )}
        </div>

        <AppLogo />

        <div className="flex items-center space-x-1 sm:space-x-2">
          {ICON_LINKS.map(({ href, icon: Icon, label }) => {
            if (label === "Cart") {
              return (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="relative h-8 w-8 text-white/70 hover:text-emerald-300 sm:h-9 sm:w-9"
                  aria-label={label}
                >
                  <Link href="/cart">
                    <ShoppingCart className="h-4 w-4" />
                  </Link>
                </Button>
              );
            }
            return (
              <Button
                key={label}
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 text-white/70 hover:text-emerald-300 sm:h-9 sm:w-9"
                aria-label={label}
              >
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeaderBottom({ pathname }: { pathname: string }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/85 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl overflow-x-auto">
        <div className="flex min-w-max justify-center">
          {MAIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] transition-all",
                pathname === item.href
                  ? "text-emerald-300"
                  : "text-white/55 hover:text-white",
              )}
            >
              {item.label}
              {pathname === item.href && (
                <div className="absolute bottom-1 left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-emerald-300" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function MobileNavigation({ user }: { user: boolean }) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 sm:w-[340px]">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle className="text-lg">Navigation Menu</SheetTitle>
        </SheetHeader>

        <nav className="mt-2 flex flex-col">
          {MAIN_NAV_ITEMS.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "border-b px-4 py-3 text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mx-4 mt-6 border-t pt-4">
          <div className="flex items-center gap-3 py-2">
            <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
            <Link
              href={`tel:${PHONE_NUMBER}`}
              className="text-sm font-medium hover:text-emerald-500"
            >
              {PHONE_NUMBER}
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-1">
            {TOP_BAR_LINKS.map((item) => {
              if (user && item.isAuth) return null;
              return (
                <SheetClose asChild key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "px-2 py-2 text-sm transition-colors",
                      item.highlight
                        ? "rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
                        : "text-muted-foreground hover:text-emerald-500",
                    )}
                  >
                    {item.name}
                  </Link>
                </SheetClose>
              );
            })}
            {user && (
              <Button
                variant="ghost"
                onClick={signOut}
                className="h-auto justify-start px-2 py-2 text-sm text-muted-foreground hover:text-emerald-500"
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

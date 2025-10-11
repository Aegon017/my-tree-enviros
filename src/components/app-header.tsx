"use client";

import {
  Bell,
  ChevronDown,
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
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store";
import AppLogo from "./ui/app-logo";

const NOTICE_TEXT = "Get Up to 20% OFF On First Time Purchase";
const PHONE_NUMBER = "+91 89777 30566";
const LOCATIONS = [
  "Hyderabad",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Kolkata",
];
const TOP_BAR_LINKS = [
  { name: "My Account", href: "/my-account" },
  { name: "Blogs", href: "/blogs" },
  { name: "Sign In", href: "/sign-in", isAuth: true },
  { name: "Sign Up", href: "/sign-up", isAuth: true, highlight: true },
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
  const { isAuthenticated, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <TopNotice />
      <div className={cn("bg-background z-50", isMobile && "sticky top-0")}>
        {isClient && <TopBar user={isAuthenticated} logout={logout} />}
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
    <div className="bg-primary text-primary-foreground px-2 sm:px-4">
      <div className="container mx-auto max-w-6xl py-1.5 sm:py-2 flex justify-center items-center gap-2 sm:gap-4">
        <span className="font-semibold text-xs sm:text-sm text-center">
          {NOTICE_TEXT}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShow(false)}
          className="text-primary-foreground hover:bg-background/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
          aria-label="Close notice"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}

function TopBar({ user, logout }: { user: boolean; logout: () => void }) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  return (
    <div className="bg-muted text-muted-foreground text-xs">
      <div className="container mx-auto max-w-6xl py-1.5 sm:py-2 flex justify-between items-center px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-0 h-auto font-normal text-muted-foreground hover:bg-muted/80 text-xs flex items-center"
            >
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
                {selectedLocation}
              </span>
              <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-40 max-h-60 overflow-y-auto"
          >
            {LOCATIONS.map((location) => (
              <DropdownMenuItem
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={cn(
                  "cursor-pointer text-xs",
                  selectedLocation === location && "bg-accent",
                )}
              >
                {location}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden md:flex items-center">
          {TOP_BAR_LINKS.map((item, index) => {
            if (user && item.isAuth) return null;
            return (
              <div key={item.name} className="flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    "px-2 text-xs transition-colors",
                    item.highlight
                      ? "bg-primary text-white rounded-sm py-1 px-3 hover:bg-primary/90"
                      : "hover:text-foreground",
                  )}
                >
                  {item.name}
                </Link>
                {index < TOP_BAR_LINKS.length - 1 && (
                  <Separator
                    orientation="vertical"
                    className="h-3 bg-border mx-1"
                  />
                )}
              </div>
            );
          })}
          {user && (
            <Button
              variant="ghost"
              onClick={logout}
              className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 h-6"
            >
              Sign Out
            </Button>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <Button
              variant="ghost"
              onClick={logout}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary/90 transition-colors"
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
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Safe cart items calculation
  const totalItems = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  return (
    <div className="border-b">
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 flex items-center justify-between">
        <div className="flex items-center">
          {isMobile ? (
            <MobileNavigation user={user} />
          ) : (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">CALL US NOW</p>
                <Link
                  href={`tel:${PHONE_NUMBER}`}
                  className="font-semibold text-sm hover:text-primary transition-colors"
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
                  className="relative text-muted-foreground hover:text-primary h-8 w-8 sm:h-9 sm:w-9"
                  aria-label={label}
                >
                  <Link href="/cart">
                    <ShoppingCart className="w-4 h-4" />
                    {totalItems > 0 && (
                      <div className="absolute top-0 right-0">
                        <span className="relative flex h-4 w-4 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                          <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                            {totalItems > 9 ? "9+" : totalItems}
                          </span>
                        </span>
                      </div>
                    )}
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
                className="text-muted-foreground hover:text-primary h-8 w-8 sm:h-9 sm:w-9"
                aria-label={label}
              >
                <Link href={href}>
                  <Icon className="w-4 h-4" />
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
    <nav className="border-t sticky top-0 z-50 bg-background shadow-sm">
      <div className="container mx-auto max-w-6xl overflow-x-auto">
        <div className="flex justify-center min-w-max">
          {MAIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-medium transition-all hover:text-primary whitespace-nowrap",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
              {pathname === item.href && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
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
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[340px] p-0">
        <SheetHeader className="text-left p-4 border-b">
          <SheetTitle className="text-lg">Navigation Menu</SheetTitle>
        </SheetHeader>

        <nav className="mt-2 flex flex-col">
          {MAIN_NAV_ITEMS.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "px-4 py-3 text-base font-medium border-b transition-colors",
                  pathname === item.href
                    ? "text-primary bg-primary/5"
                    : "text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-6 pt-4 border-t mx-4">
          <div className="flex items-center gap-3 py-2">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <Link
              href={`tel:${PHONE_NUMBER}`}
              className="font-medium text-sm hover:text-primary transition-colors"
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
                      "text-sm py-2 px-2 transition-colors",
                      item.highlight
                        ? "text-white bg-primary rounded-md hover:bg-primary/90"
                        : "text-muted-foreground hover:text-primary",
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
                onClick={logout}
                className="justify-start text-sm text-muted-foreground hover:text-primary px-2 py-2 h-auto"
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

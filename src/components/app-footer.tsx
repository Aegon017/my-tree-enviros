"use client";

import Link from "next/link";
import { GooglePlayIcon, AppleAppStoreIcon } from "./store-icons";
import { ArrowUpRight } from "lucide-react";

const footerData = {
  quickLinks: [
    { name: "About Us", href: "/about" },
    { name: "Order Tracking", href: "/track-order" },
    { name: "Shipping & Delivery", href: "/shipping" },
    { name: "Orders History", href: "/orders" },
    { name: "My Account", href: "/account" },
  ],
  policyLinks: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
  ],
  appStores: [
    {
      name: "Google Play",
      href: "https://play.google.com/store/apps/details?id=mytree.app",
      description: "Get it on",
      icon: GooglePlayIcon,
    },
    {
      name: "App Store",
      href: "https://apps.apple.com/app/mytree/id123456789",
      description: "Get it on",
      icon: AppleAppStoreIcon,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background text-foreground relative overflow-hidden border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12 pt-24 pb-40 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-32">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-[0.9] text-secondary/40 mb-8">
              Grow your <span className="text-primary">green future.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-lg leading-relaxed">
              Join the movement towards a sustainable planet. Download the app
              and start your journey today.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">
              Navigation
            </h3>
            <ul className="space-y-4">
              {footerData.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">
              Legal
            </h3>
            <ul className="space-y-4">
              {footerData.policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none select-none leading-none">
        <h1
          className="
          text-[clamp(4rem,18vw,24rem)] 
          text-primary/40
          tracking-tighter 
          flex justify-center w-full 
          translate-y-[16%]
        "
        >
          <span>MY TREE</span>
        </h1>
      </div>
    </footer>
  );
}

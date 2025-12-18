"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const footerData = {
  quickLinks: [
    { name: "About Us", href: "/about-us" },
    { name: "Store", href: "/store" },
    { name: "The Green Alliance", href: "/the-green-alliance" },
    { name: "Orders History", href: "/my-orders" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact Us", href: "/contact-us" },
  ],
  policyLinks: [
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Cancellations & Returns", href: "/cancellations-and-refunds" },
  ],
  social: [
    { icon: FaFacebook, href: "https://www.facebook.com" },
    { icon: FaInstagram, href: "https://www.instagram.com" },
    { icon: FaXTwitter, href: "https://x.com" },
    { icon: FaLinkedin, href: "https://www.linkedin.com" },
    { icon: FaYoutube, href: "https://www.youtube.com" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12 pt-24 pb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] text-primary-foreground/50 mb-6">
              Grow your{" "}
              <span className="text-primary-foreground">green future.</span>
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-lg leading-relaxed">
              Join the movement towards a sustainable planet. Download the app
              and start your journey today.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 mb-6">
              Navigation
            </h3>
            <ul className="space-y-3">
              {footerData.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 mb-6">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerData.policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} My Tree Enviros. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {footerData.social.map((s, i) => (
              <Link
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                <s.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
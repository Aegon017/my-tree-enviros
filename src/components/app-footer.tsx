"use client";

import Link from "next/link";
import Image from "next/image";
import QRCode from "react-qr-code";
import { BACKEND_URL } from "@/services/http-client";
import { useEffect, useState } from "react";
import { appService } from "@/services/app.service";
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { ArrowUpRight } from "lucide-react";

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
    { icon: FaFacebook, href: "www.facebook.com" },
    { icon: FaInstagram, href: "www.instagram.com" },
    { icon: FaXTwitter, href: "x.com" },
    { icon: FaLinkedin, href: "www.linkedin.com" },
    { icon: FaYoutube, href: "https://youtube.com" },
  ],
};

export default function Footer() {
  const [links, setLinks] = useState<{
    android_url: string;
    ios_url: string;
  } | null>(null);

  useEffect(() => {
    appService.getSettings().then((response) => {
      if (response.success && response.data) {
        setLinks(response.data);
      }
    });
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 pt-24 pb-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-[0.9] text-white/40 mb-8">
              Grow your <span className="text-white">green future.</span>
            </h2>
            <p className="text-xl text-white/80 font-light max-w-lg leading-relaxed mb-6">
              Join the movement towards a sustainable planet. Download the app
              and start your journey today.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex flex-col gap-3">
                <Link
                  href={links?.android_url || "https://play.google.com"}
                  target="_blank"
                >
                  <div className="relative w-[140px] h-auto">
                    <Image
                      src="/google-play-badge.avif"
                      alt="Google Play"
                      width={140}
                      height={42}
                      className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </Link>
                <Link
                  href={links?.ios_url || "https://apple.com/app-store"}
                  target="_blank"
                >
                  <div className="relative w-[140px] h-auto">
                    <Image
                      src="/app-store-badge.avif"
                      alt="App Store"
                      width={140}
                      height={42}
                      className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </Link>
              </div>

              <div className="hidden sm:block h-24 w-px bg-white/10" />

              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl">
                  <QRCode
                    value={BACKEND_URL ? `${BACKEND_URL}/get-app` : ""}
                    size={80}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                </div>
                <p className="text-sm text-white/60 max-w-[80px] leading-tight">
                  Scan to download
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-8">
              Navigation
            </h3>
            <ul className="space-y-4">
              {footerData.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-8">
              Legal
            </h3>
            <ul className="space-y-4">
              {footerData.policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} My Tree Enviros. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {footerData.social.map((s, i) => (
              <Link
                key={i}
                href={s.href}
                className="text-white/60 hover:text-white transition-colors"
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

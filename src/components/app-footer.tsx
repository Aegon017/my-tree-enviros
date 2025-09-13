"use client";

import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const GooglePlayIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className={className}
  >
    <title>Playstore Icon</title>
    <path d="M389.6 298.3L168.9 77L449.7 238.2L389.6 298.3zM111.3 64C98.3 70.8 89.6 83.2 89.6 99.3L89.6 540.6C89.6 556.7 98.3 569.1 111.3 575.9L367.9 319.9L111.3 64zM536.5 289.6L477.6 255.5L411.9 320L477.6 384.5L537.7 350.4C555.7 336.1 555.7 303.9 536.5 289.6zM168.9 563L449.7 401.8L389.6 341.7L168.9 563z" />
  </svg>
);

const AppleAppStoreIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className={className}
  >
    <title>Apple Store Icon</title>
    <path d="M496 96L144 96C117.5 96 96 117.5 96 144L96 496C96 522.5 117.5 544 144 544L496 544C522.5 544 544 522.5 544 496L544 144C544 117.5 522.5 96 496 96zM223 448.5C217.5 458.1 205.2 461.3 195.7 455.8C186.1 450.3 182.9 438 188.4 428.5L202.7 403.8C218.8 398.9 232 402.7 242.3 415.2L223 448.5zM361.9 394.6L180 394.6C169 394.6 160 385.6 160 374.6C160 363.6 169 354.6 180 354.6L231 354.6L296.4 241.4L275.9 206C270.4 196.4 273.7 184.2 283.2 178.7C292.8 173.2 305 176.5 310.5 186L319.4 201.4L328.3 186C333.8 176.4 346.1 173.2 355.6 178.7C365.2 184.2 368.4 196.5 362.9 206L277.1 354.6L339.2 354.6C359.4 354.6 370.7 378.3 361.9 394.6zM460 394.6L431 394.6L450.6 428.5C456.1 438.1 452.8 450.3 443.3 455.8C433.7 461.3 421.5 458 416 448.5C383.1 391.6 358.5 348.8 342 320.4C325.3 291.4 337.2 262.4 349.1 252.6C362.2 275.3 381.8 309.3 408 354.6L460 354.6C471 354.6 480 363.6 480 374.6C480 385.7 471 394.6 460 394.6z" />
  </svg>
);

// Footer data configuration
const footerData = {
  contactInfo: {
    address:
      "4th Floor, Trendz Trinity, Plot No. 18, Madhagar, Safoornagar, Hyderabad, Telangana 500081",
    phone: "+91 8977730565",
    email: "communication@myrescare",
    workingHours: "Mon - Sun / 9:00 AM - 8:00 PM",
    socialLinks: [
      {
        name: "Facebook",
        href: "https://facebook.com",
        icon: Facebook,
      },
      {
        name: "Twitter",
        href: "https://twitter.com",
        icon: Twitter,
      },
      {
        name: "Instagram",
        href: "https://instagram.com",
        icon: Instagram,
      },
      {
        name: "LinkedIn",
        href: "https://linkedin.com",
        icon: Linkedin,
      },
      {
        name: "Youtube",
        href: "https://youtube.com",
        icon: Youtube,
      },
    ],
  },
  quickLinks: [
    { name: "About Us", href: "/about" },
    { name: "Order Tracking", href: "/track-order" },
    { name: "Shipping & Delivery", href: "/shipping" },
    { name: "Orders History", href: "/orders" },
    { name: "My Account", href: "/account" },
  ],
  policyLinks: [
    { name: "Shipping & Delivery", href: "/shipping" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Return & Refund Policy", href: "/refund" },
  ],
  appStores: [
    {
      name: "Google Play",
      href: "https://play.google.com/store",
      description: "GET IT ON",
      icon: GooglePlayIcon,
    },
    {
      name: "App Store",
      href: "https://www.apple.com/app-store",
      description: "Download on the",
      icon: AppleAppStoreIcon,
    },
  ],
  copyright: "© 2025 Mytree. All Rights Reserved.",
};

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {footerData.contactInfo.address}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {footerData.contactInfo.phone}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {footerData.contactInfo.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {footerData.contactInfo.workingHours}
                </span>
              </div>

              {/* Social Media Links */}
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  {footerData.contactInfo.socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-secondary-foreground hover:bg-secondary transition-colors border p-2 rounded-4xl"
                      aria-label={social.name}
                    >
                      <social.icon className="h-5 w-5" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {footerData.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Policy Links</h3>
            <ul className="space-y-2">
              {footerData.policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App - Redesigned */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Download Our App</h3>
            <p className="text-sm text-muted-foreground">
              Get access to exclusive offers and features
            </p>

            <div className="space-y-3 mt-4">
              {footerData.appStores.map((store) => {
                const IconComponent = store.icon;
                return (
                  <Button
                    key={store.name}
                    variant="outline"
                    className="w-full justify-start py-4 h-auto gap-2 transition-all hover:shadow-md"
                    asChild
                  >
                    <Link
                      href={store.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent className="size-12 text-primary" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-muted-foreground">
                          {store.description}
                        </span>
                        <span className="font-medium text-foreground">
                          {store.name}
                        </span>
                      </div>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-primary text-primary-foreground flex flex-col md:flex-row justify-center items-center gap-4 p-4">
        <p className="text-sm text-center md:text-left">
          {footerData.copyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;

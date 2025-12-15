"use client";

import Link from "next/link";
// Import necessary icons from react-icons/fa or fa6
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6'; // Correct import for the "X" logo
import { ArrowUpRight } from 'lucide-react'; // Assuming you are using Lucide Icons for the arrow as in the original code

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
    // Use the imported React Icon components directly
    { icon: FaFacebook, href: "www.facebook.com" },
    { icon: FaInstagram, href: "www.instagram.com" },
    { icon: FaXTwitter, href: "x.com" },
    { icon: FaLinkedin, href: "www.linkedin.com" },
    { icon: FaYoutube, href: "https://youtube.com" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 pt-24 pb-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-[0.9] text-white/40 mb-8">
              Grow your <span className="text-white">green future.</span>
            </h2>
            <p className="text-xl text-white/80 font-light max-w-lg leading-relaxed">
              Join the movement towards a sustainable planet. Download the app
              and start your journey today.
            </p>
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
                    {/* The ArrowUpRight icon from Lucide React is used here */}
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
                {/* Render the imported icon component */}
                <s.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
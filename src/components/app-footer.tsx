"use client";

import Link from "next/link";

const footerData = {
  tagline: "Grow your green future",
  productLinks: [
    { name: "Download", href: "/download" },
    { name: "Product", href: "/product" },
    { name: "Docs", href: "/docs" },
    { name: "Changelog", href: "/changelog" },
  ],
  resourceLinks: [
    { name: "Blog", href: "/blog" },
    { name: "Pricing", href: "/pricing" },
    { name: "Use Cases", href: "/use-cases" },
  ],
  bottomLinks: [
    { name: "About", href: "/about" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-white text-black">
      {/* Top Section - Tagline and Links */}
      <div className="border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-16 py-20">
          <div className="flex justify-between items-start gap-16">
            {/* Left - Tagline */}
            <div className="flex-1">
              <p className="text-3xl font-bold tracking-tight leading-tight max-w-sm">
                {footerData.tagline}
              </p>
            </div>

            {/* Right - Two column links */}
            <div className="flex gap-32">
              {/* Product Links */}
              <div>
                <h3 className="text-lg font-bold mb-8 uppercase tracking-wider text-gray-900">
                  Product
                </h3>
                <ul className="space-y-5">
                  {footerData.productLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-base font-medium text-gray-700 hover:text-black transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h3 className="text-lg font-bold mb-8 uppercase tracking-wider text-gray-900">
                  Resources
                </h3>
                <ul className="space-y-5">
                  {footerData.resourceLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-base font-medium text-gray-700 hover:text-black transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Section - Large Brand Display */}
      <div className="border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-16 py-32">
          <div className="text-center">
            <h2 className="text-9xl md:text-10xl font-black tracking-tighter mb-2 leading-none text-black">
              My Tree
            </h2>
            <p className="text-5xl font-bold tracking-tight text-gray-900">Enviros</p>
          </div>
        </div>
      </div>

      {/* Bottom Section - Minimal footer */}
      <div className="container max-w-7xl mx-auto px-16 py-10">
        <div className="flex justify-between items-center">
          {/* Left - Brand */}
          <div className="text-base font-bold text-gray-900">My Tree Enviros</div>

          {/* Center - Links */}
          <div className="flex gap-12">
            {footerData.bottomLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
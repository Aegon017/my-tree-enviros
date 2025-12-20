"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/web-logo.png";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const AppLogo = ({ className }: Props) => {
  return (
    <Link href="/" className="shrink-0 mx-2 sm:mx-4">
      <Image
        src={logo}
        alt="My Tree Enviros Logo"
        className={cn("object-contain mt-4 md:mt-0", className)}
        priority
      />
    </Link>
  );
};

export default AppLogo;

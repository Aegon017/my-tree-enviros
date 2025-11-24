"use client";

import Image from "next/image";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "../../../public/logo.png";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const AppLogo = ({ className }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Link href="/" className="shrink-0 mx-2 sm:mx-4">
      <Image
        src={logo}
        width={isMobile ? 90 : 120}
        height={isMobile ? 90 : 120}
        alt="My Tree Enviros Logo"
        className={cn("object-contain", className)}
        priority
      />
    </Link>
  );
};

export default AppLogo;

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ href = "/", className, width = 101, height = 20 }: LogoProps) {
  const img = (
    <Image
      src="/logo.svg"
      alt="Med.co"
      width={width}
      height={height}
      priority
    />
  );

  if (!href) return <div className={cn("flex items-center", className)}>{img}</div>;

  return (
    <Link href={href} className={cn("flex items-center", className)}>
      {img}
    </Link>
  );
}

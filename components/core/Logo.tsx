import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  width?: number;
  height?: number;
};

export default function Logo({ width = 140, height = 36 }: LogoProps) {
  return (
    <Link href="/" className="flex flex-shrink-0 items-center">
      <Image
        src="/logo.png"
        alt="CodePeeler"
        width={width}
        height={height}
        style={{ height: "auto", width: "auto" }}
        priority
      />
    </Link>
  );
}

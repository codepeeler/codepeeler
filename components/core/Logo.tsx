import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex flex-shrink-0 items-center">
      <Image
        src="/logo.png"
        alt="CodePeeler"
        width={140}
        height={36}
        style={{ height: "auto", width: "auto" }}
        priority
      />
    </Link>
  );
}

import Link from "next/link";

interface AuthButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function AuthButton({ href, children }: AuthButtonProps) {
  return (
    <Link
      href={href}
      className="text-sm text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </Link>
  );
}

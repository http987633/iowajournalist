import Link from "next/link";
import { siteConfig } from "@/lib/site";

const nav = [
  { href: "/articles", label: "Articles" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="group">
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            {siteConfig.name}
          </span>
          <span className="mt-0.5 block text-xs text-zinc-500 group-hover:text-zinc-700">
            {siteConfig.tagline}
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

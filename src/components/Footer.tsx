import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-zinc-600">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-zinc-900">{siteConfig.name}</p>
            <p className="mt-1 max-w-md">{siteConfig.description}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/articles" className="hover:text-zinc-900">
              Articles
            </Link>
            <Link href="/resources" className="hover:text-zinc-900">
              Resources
            </Link>
            <Link href="/about" className="hover:text-zinc-900">
              About
            </Link>
          </div>
        </div>
        <p className="mt-6 text-xs text-zinc-400">
          © {new Date().getFullYear()} {siteConfig.domain}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

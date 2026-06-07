import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/articles/new", label: "New Article" },
  { href: "/admin/topics", label: "Topic Queue" },
  { href: "/admin/generate", label: "AI Generate" },
];

export function AdminNav() {
  return (
    <nav className="mb-8 flex flex-wrap gap-3 border-b border-zinc-200 pb-4 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          {link.label}
        </Link>
      ))}
      <form action="/api/auth/logout" method="POST" className="ml-auto">
        <button
          type="submit"
          className="rounded-lg px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50"
        >
          Logout
        </button>
      </form>
    </nav>
  );
}

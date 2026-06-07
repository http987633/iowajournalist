export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}

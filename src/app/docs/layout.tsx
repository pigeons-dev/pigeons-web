import { Sidebar } from "@/components/docs/sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Mobile sidebar (horizontal pills) */}
      <div className="mb-8 lg:hidden">
        <Sidebar />
      </div>

      <div className="flex gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <Sidebar />
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

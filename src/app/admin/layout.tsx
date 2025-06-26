export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground min-h-[calc(100vh-theme(spacing.20))]">
      {children}
    </div>
  );
}

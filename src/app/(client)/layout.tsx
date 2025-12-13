export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Client dashboard handles its own layout and styling
  return <>{children}</>
}

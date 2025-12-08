export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-xl font-bold text-gray-900">OURCHOTHER</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}

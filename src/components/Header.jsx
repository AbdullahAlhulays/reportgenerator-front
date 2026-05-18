export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-bold text-slate-950">FieldReport Voice</p>
          <p className="text-sm text-slate-500">Turn field voice notes into professional reports.</p>
        </div>
        <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 sm:inline-flex">
          Field reporting
        </span>
      </div>
    </header>
  )
}

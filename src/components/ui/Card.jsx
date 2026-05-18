export function Card({ as: Component = 'div', children, className = '' }) {
  return (
    <Component className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </Component>
  )
}

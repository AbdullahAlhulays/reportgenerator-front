const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'

const variantClasses = {
  primary:
    'bg-blue-700 text-white shadow-sm shadow-blue-900/10 hover:bg-blue-800 focus-visible:outline-blue-700',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-blue-700',
  quiet:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:outline-blue-700',
  success:
    'bg-emerald-700 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-800 focus-visible:outline-emerald-700',
  danger:
    'bg-red-700 text-white shadow-sm shadow-red-900/10 hover:bg-red-800 focus-visible:outline-red-700',
}

const sizeClasses = {
  sm: 'min-h-9 px-3 py-2 text-sm',
  md: 'min-h-11 px-4 py-2.5 text-sm',
  lg: 'min-h-12 px-5 py-3 text-base',
}

export function Button({
  children,
  className = '',
  icon: Icon,
  isLoading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isLoading || props.disabled}
      type={type}
      {...props}
    >
      {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
      {isLoading ? 'Please wait...' : children}
    </button>
  )
}

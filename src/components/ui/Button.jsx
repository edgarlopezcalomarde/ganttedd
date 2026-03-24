import { cn } from '../../utils/cn'

export default function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    default:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
    secondary:
      'bg-pink-100 text-pink-700 hover:bg-pink-200 active:bg-pink-300',
    outline:
      'border border-pink-300 text-pink-700 hover:bg-pink-50 active:bg-pink-100',
    ghost:
      'text-pink-700 hover:bg-pink-50 active:bg-pink-100',
    destructive:
      'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

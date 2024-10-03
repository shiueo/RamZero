import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
}

export function Button({ className, children, ...props }: ButtonProps) {
  const buttonClasses = clsx(
    'inline-flex gap-0.5 justify-center overflow-hidden text-sm transition rounded-full py-1 px-3 font-bold bg-white text-black',
    'ring-1 ring-inset ring-white hover:bg-zinc-200 hover:text-zinc-700 hover:ring-zinc-200',
    className, 
  )

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}

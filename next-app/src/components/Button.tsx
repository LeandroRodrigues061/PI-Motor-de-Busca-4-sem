import { ComponentProps, ReactNode } from "react";
import { tv, VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: 'flex items-center justify-center gap-2 cursor-pointer rounded-xl',
  
  variants: {
    variant: {
      primary: 'text-white bg-primary rounded-xl p-4 transition duration-300 hover:bg-primary-hover hover:border-zinc-200 hover:shadow-[0_0_10px_1px_#98C6FF] mt-3',
      secondary: 'text-primary bg-white border border-primary rounded-xl p-4 transition duration-300  hover:border-zinc-200 hover:shadow-[0_0_10px_1px_#98C6FF]',
      
    },
    size:{
      full: "w-full h-14",
      default: "py-2"
    }
  },

})

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  children: ReactNode
}

export function Button({ children, variant, size,  ...rest }: ButtonProps) {
  return (
    <button {...rest} className={buttonVariants({ variant, size })}>
      {children}
    </button>
  )
}
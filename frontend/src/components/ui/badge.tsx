import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-brand-50 text-brand-500 [a]:hover:bg-brand-100",
        primary:
          "bg-brand-500 text-white [a]:hover:bg-brand-600",
        secondary:
          "bg-gray-100 text-gray-600 [a]:hover:bg-gray-200",
        success:
          "bg-success-50 text-success-600 [a]:hover:bg-success-100",
        error:
          "bg-error-50 text-error-600 [a]:hover:bg-error-100",
        warning:
          "bg-warning-50 text-warning-600 [a]:hover:bg-warning-100",
        info:
          "bg-info-50 text-info-600 [a]:hover:bg-info-100",
        destructive:
          "bg-error-50 text-error-600 focus-visible:ring-error-500/20 [a]:hover:bg-error-100",
        outline:
          "border-gray-200 text-gray-600 [a]:hover:bg-gray-50",
        ghost:
          "hover:bg-gray-100 text-gray-600",
        link: "text-brand-500 underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }

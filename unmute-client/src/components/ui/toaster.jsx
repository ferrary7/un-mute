"use client"

import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      richColors
      expand={true}
      visibleToasts={4}
      toastOptions={{
        style: {
          background: "hsl(var(--primary))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
        className: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        descriptionClassName: "group-[.toast]:text-muted-foreground",
        actionButtonClassName: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButtonClassName: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      }}
      {...props}
    />
  )
}

export { Toaster }

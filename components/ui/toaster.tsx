"use client";

import { useToast, Toast as ToastType } from "@/components/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map((toast: ToastType) => (
        <Toast key={toast.id} {...toast}>
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export function MyComponent() {
  const { addToast } = useToast()

  const handleClick = () => {
    addToast({
      title: "Toast Title",
      description: "This is a toast message",
      duration: 3000, // Optional: duration in milliseconds
    })
  }

  return <button onClick={handleClick}>Show Toast</button>
}
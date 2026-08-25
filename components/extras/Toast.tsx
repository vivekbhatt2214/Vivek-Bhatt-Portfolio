"use client";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

type ToastItem = { id: number; message: string };

export function fireToast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("vb-toast", { detail: message }));
}

export default function Toast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let counter = 0;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      const id = ++counter;
      setItems((prev) => [...prev, { id, message: detail }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 2600);
    };
    window.addEventListener("vb-toast", handler as EventListener);
    return () => window.removeEventListener("vb-toast", handler as EventListener);
  }, []);

  return (
    <div className="vb-toast-stack" aria-live="polite">
      {items.map((t) => (
        <div className="vb-toast" key={t.id}>
          <CheckCircle2 size={16} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

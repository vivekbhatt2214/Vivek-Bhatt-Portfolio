"use client";
import { useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { Copy, Check } from "lucide-react";
import { fireToast } from "./Toast";

const burstColors = ["var(--c-amber)", "var(--c-indigo)", "var(--c-pink)", "var(--c-teal)", "var(--c-lime)"];

export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  async function handleCopy(e: ReactMouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setBurstKey((k) => k + 1);
    fireToast("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      className="vb-copy-btn"
      onClick={handleCopy}
      aria-label="Copy email address"
      title="Copy email"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      <span className="vb-copy-burst" key={burstKey}>
        {burstColors.map((c, i) => (
          <i key={i} style={{ "--c": c, "--i": i } as CSSProperties} />
        ))}
      </span>
    </button>
  );
}

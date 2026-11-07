'use client';

import { Check, Copy, Printer } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/** Pages are static, so the year is filled in by the browser and can never go stale. */
export function CurrentYear() {
  const year = useSyncExternalStore(
    noSubscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <>{year}</>;
}

export function CopyEmail({ email, label, className = '' }: { email: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`btn ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          window.location.href = `mailto:${email}`;
        }
      }}
    >
      {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn btn-quiet btn-small" onClick={() => window.print()}>
      <Printer size={15} aria-hidden />
      {label}
    </button>
  );
}

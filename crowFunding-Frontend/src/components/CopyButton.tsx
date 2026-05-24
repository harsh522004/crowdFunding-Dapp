import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-all
        ${copied
          ? "text-green-400 bg-green-500/10"
          : "text-slate-400 hover:text-white hover:bg-slate-700"
        } ${className}`}
    >
      {copied ? "✓ Copied" : "⎘ Copy"}
    </button>
  );
}

import { PropsWithChildren } from "react";

export function Card({ title, right, className, children }: PropsWithChildren<{ title?: string; right?: React.ReactNode; className?: string }>) {
  return (
    <div className={`rounded-xl2 bg-white shadow-card border border-[rgba(0,0,0,0.05)] ${className ?? ""}`}>
      {(title || right) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.05)]">
          <div className="text-base font-bold tracking-wide text-rush-black uppercase">{title}</div>
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

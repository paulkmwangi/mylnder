import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

export default function Button({ variant = "primary", children, className = "", ...props }: Props) {
  const variants = {
    primary: "bg-myinder-orange text-white hover:bg-orange-600",
    secondary: "border border-blue-200 bg-white text-myinder-blue hover:bg-blue-50",
    ghost: "text-myinder-blue hover:bg-blue-50"
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
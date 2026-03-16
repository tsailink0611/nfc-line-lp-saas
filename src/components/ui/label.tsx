import { cn } from "@/lib/utils";
import { type LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean };

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label className={cn("block text-sm font-medium text-gray-700", className)} {...props}>
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

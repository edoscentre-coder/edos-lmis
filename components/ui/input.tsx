import { cn } from "@/lib/utils";
import { Children, InputHTMLAttributes, forwardRef, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        // text-base below `sm` keeps the font at 16px on phones — anything
        // smaller makes iOS Safari zoom the page in when the field is focused
        // and leaves the user stranded at that zoom level.
        "h-10 w-full rounded-lg border border-border bg-surface px-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    // Pickers fed by a settings list (Method, Inventory Category, Equipment
    // Type, Stain) render nothing at all when the tenant's list is empty,
    // which reads as a broken control rather than as missing master data.
    // Say what's wrong and where to fix it instead of showing a blank box.
    const hasOptions = Children.toArray(children).length > 0;
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-surface px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm",
          className
        )}
        {...props}
      >
        {hasOptions ? children : <option value="">No options set up — add them under Settings</option>}
      </select>
    );
  }
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

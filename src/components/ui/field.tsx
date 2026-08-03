import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
};

export function Field({ label, id, error, className, ...props }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "min-h-12 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 shadow-sm focus:border-teal-700 focus:ring-4 focus:ring-teal-100",
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={`${id}-error`} className="text-sm font-normal text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type SelectProps = ComponentProps<"select"> & {
  label: string;
  error?: string;
  options: string[];
};

export function SelectField({ label, id, error, options, className, ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "min-h-12 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 shadow-sm focus:border-teal-700 focus:ring-4 focus:ring-teal-100",
          className,
        )}
        {...props}
      >
        <option value="">Seçin</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? (
        <span id={`${id}-error`} className="text-sm font-normal text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type TextareaProps = ComponentProps<"textarea"> & {
  label: string;
  error?: string;
};

export function TextareaField({ label, id, error, className, ...props }: TextareaProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800 md:col-span-2 dark:text-slate-300" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "min-h-36 rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-950 shadow-sm focus:border-teal-700 focus:ring-4 focus:ring-teal-100",
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={`${id}-error`} className="text-sm font-normal text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

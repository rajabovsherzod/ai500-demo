import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


const parseStatValue = (value: string | undefined | null): number | undefined => {
  if (!value) return undefined;
  if (value === "string") return undefined; // Swagger default qiymati
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};
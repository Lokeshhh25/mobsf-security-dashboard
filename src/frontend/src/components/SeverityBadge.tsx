import { cn } from "@/lib/utils";

type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

const SEVERITY_STYLES: Record<Severity, string> = {
  Critical: "bg-red-50 text-red-700 border border-red-200",
  High: "bg-orange-50 text-orange-700 border border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  Low: "bg-green-50 text-green-700 border border-green-200",
  Info: "bg-blue-50 text-blue-700 border border-blue-200",
};

export function SeverityBadge({
  severity,
  className,
}: { severity: string; className?: string }) {
  const style =
    SEVERITY_STYLES[severity as Severity] ??
    "bg-gray-50 text-gray-700 border border-gray-200";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
        style,
        className,
      )}
    >
      {severity}
    </span>
  );
}

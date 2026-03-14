import { useEffect, useRef } from "react";

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export function ScoreGauge({
  score,
  label = "Threat Score",
  size = 160,
}: ScoreGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const clamped = Math.min(100, Math.max(0, score));
  const radius = (size / 2) * 0.72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circle.style.transition =
          "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)";
        circle.style.strokeDashoffset = String(offset);
      });
    });
  }, [circumference, offset]);

  const getColor = () => {
    if (clamped >= 75) return "#dc2626";
    if (clamped >= 50) return "#ea580c";
    if (clamped >= 25) return "#d97706";
    return "#16a34a";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-label={`Score gauge: ${clamped} out of 100`}
      >
        <title>Score gauge showing {clamped} out of 100</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={size * 0.1}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={size * 0.1}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="-mt-[calc(50%+1rem)] flex flex-col items-center justify-center"
        style={{ height: size }}
      >
        <span
          className="text-4xl font-display font-bold"
          style={{ color: getColor() }}
        >
          {clamped}
        </span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}

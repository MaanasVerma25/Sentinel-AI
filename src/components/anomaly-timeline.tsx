import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
} from "recharts";
import { timelineData } from "@/lib/mock-data";

const series = [
  { key: "Outage", color: "#FF4757" },
  { key: "Payment", color: "#0ea5e9" }, // Sky blue (excellent contrast in both themes)
  { key: "PR", color: "#ec4899" },
  { key: "Bug", color: "#f97316" },
  { key: "Fraud", color: "#8b5cf6" },
];

export function AnomalyTimeline() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timelineData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11 }}
            interval={2}
          />
          <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} width={32} />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <ReferenceArea
            x1="18:00"
            x2="20:00"
            fill="#FF4757"
            fillOpacity={0.08}
            stroke="#FF4757"
            strokeOpacity={0.4}
            strokeDasharray="4 4"
          />
          <ReferenceDot
            x="19:00"
            y={260}
            r={5}
            fill="#FF4757"
            stroke="#fff"
            strokeWidth={1.5}
            label={{
              value: "⚑ Anomaly Detected",
              position: "top",
              fill: "#FF4757",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={1.8}
              fill={`url(#grad-${s.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.key}
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AxisSnapshot } from "@/lib/axis-history";

const AXIS_COLORS = [
  "hsl(0, 0%, 20%)",
  "hsl(0, 0%, 45%)",
  "hsl(0, 0%, 65%)",
  "hsl(0, 0%, 80%)",
];

interface AxisChartProps {
  snapshots: AxisSnapshot[];
}

export function AxisChart({ snapshots }: AxisChartProps) {
  // 全スナップショットからユニークな軸ラベルを収集
  const allLabels = Array.from(
    new Set(snapshots.flatMap((s) => s.axes.map((a) => a.label)))
  );

  // Rechartsのデータ形式に変換
  const data = snapshots.map((snapshot) => {
    const point: Record<string, string | number> = {
      date: new Date(snapshot.date).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
    };
    for (const axis of snapshot.axes) {
      point[axis.label] = axis.value;
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "hsl(0, 0%, 50%)" }}
          axisLine={{ stroke: "hsl(0, 0%, 85%)" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "hsl(0, 0%, 50%)" }}
          axisLine={{ stroke: "hsl(0, 0%, 85%)" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid hsl(0, 0%, 90%)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            fontSize: "13px",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
        />
        {allLabels.map((label, i) => (
          <Line
            key={label}
            type="monotone"
            dataKey={label}
            stroke={AXIS_COLORS[i % AXIS_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4, fill: AXIS_COLORS[i % AXIS_COLORS.length] }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

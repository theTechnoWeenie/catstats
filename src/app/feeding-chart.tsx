"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MEAL_SLOT_LABELS, MEAL_SLOTS } from "@/lib/meal-slots";

export type ChartDatum = {
  slot: string;
  label: string;
  selectedDay: number;
  prevDay?: number;
  trend?: number;
};

export function buildChartData({
  selectedDayAmounts,
  prevDayAmounts,
  trendAmounts,
}: {
  selectedDayAmounts: Map<string, number>;
  prevDayAmounts?: Map<string, number>;
  trendAmounts?: Map<string, number>;
}): ChartDatum[] {
  return MEAL_SLOTS.map((slot) => ({
    slot,
    label: MEAL_SLOT_LABELS[slot],
    selectedDay: selectedDayAmounts.get(slot) ?? 0,
    prevDay: prevDayAmounts ? prevDayAmounts.get(slot) ?? 0 : undefined,
    trend: trendAmounts ? trendAmounts.get(slot) ?? 0 : undefined,
  }));
}

export function FeedingChart({
  data,
  showPrevDay,
  showTrend,
  prevDayLabel,
}: {
  data: ChartDatum[];
  showPrevDay: boolean;
  showTrend: boolean;
  prevDayLabel: string;
}) {
  return (
    <div className="h-72 w-full rounded-xl border border-black/[.08] bg-[var(--chart-surface)] p-4 dark:border-white/[.145]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--chart-text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--chart-text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={false}
            label={{
              value: "mL",
              angle: -90,
              position: "insideLeft",
              fill: "var(--chart-muted)",
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--chart-surface)",
              border: "1px solid var(--chart-grid)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--chart-text-primary)",
            }}
          />
          {(showPrevDay || showTrend) && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Bar
            dataKey="selectedDay"
            name="Selected day"
            fill="var(--chart-series-1)"
            radius={[4, 4, 0, 0]}
          />
          {showPrevDay && (
            <Bar
              dataKey="prevDay"
              name={prevDayLabel}
              fill="var(--chart-series-2)"
              radius={[4, 4, 0, 0]}
            />
          )}
          {showTrend && (
            <Line
              dataKey="trend"
              name="Historical average"
              type="monotone"
              stroke="var(--chart-series-3)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 4 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

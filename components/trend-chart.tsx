"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TrendChartProps {
  data: Array<{ month: string; income: number; expenses: number }>
}

export function TrendChart({ data }: TrendChartProps) {
  const chartConfig = {
    income: {
      label: "Income",
      color: "green",
    },
    expenses: {
      label: "Expenses",
      color: "red",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="var(--color-income)"
            strokeWidth={2}
            dot={{ fill: "var(--color-income)" }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="var(--color-expenses)"
            strokeWidth={2}
            dot={{ fill: "var(--color-expenses)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

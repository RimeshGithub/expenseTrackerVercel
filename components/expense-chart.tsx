"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ExpenseChartProps {
  data: Array<{ category: string; amount: number; color: string }>
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const colors = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6"]

  const chartConfig = data.reduce(
    (config, item, index) => ({
      ...config,
      [item.category.toLowerCase()]: {
        label: item.category,
        color: colors[index % colors.length],
      },
    }),
    {},
  )

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="category" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent hideLabel={true} hideIndicator={true} />} />
          <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

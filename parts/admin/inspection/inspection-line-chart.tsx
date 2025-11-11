"use client";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const chartData = [
  { month: "Jan", debtsEstablished: 45, debtsRecovered: 42 },
  { month: "Feb", debtsEstablished: 48, debtsRecovered: 44 },
  { month: "Mar", debtsEstablished: 43, debtsRecovered: 46 },
  { month: "Apr", debtsEstablished: 60, debtsRecovered: 50 },
  { month: "May", debtsEstablished: 55, debtsRecovered: 48 },
  { month: "Jun", debtsEstablished: 57, debtsRecovered: 46 },
  { month: "Jul", debtsEstablished: 62, debtsRecovered: 59 },
  { month: "Aug", debtsEstablished: 55, debtsRecovered: 52 },
  { month: "Sep", debtsEstablished: 60, debtsRecovered: 53 },
];

export function InspectionBarChart() {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Monthly Debts Comparison
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          Debts Established vs Debts Recovered
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: "0.5rem",
                  borderColor: "#e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#374151" }}
                verticalAlign="top"
                height={36}
              />
              <Bar
                dataKey="debtsEstablished"
                name="Debts Established"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="debtsRecovered"
                name="Debts Recovered"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
          
        </div>

        
      </CardContent>
    </Card>
  );
}

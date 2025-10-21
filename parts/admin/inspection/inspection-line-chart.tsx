// import { BarChart2, TrendingUp } from "lucide-react";
// import {
//   Line,
//   BarChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
//   Bar,
// } from "recharts";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartLegend,
//   ChartLegendContent,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// const chartData = [
//   {
//     month: "January",
//     debtsEstablished: 120,
//     debtsRecovered: 80,
//     inspected: 150,
//     lettersServed: 200,
//   },
//   {
//     month: "February",
//     debtsEstablished: 150,
//     debtsRecovered: 100,
//     inspected: 180,
//     lettersServed: 220,
//   },
//   {
//     month: "March",
//     debtsEstablished: 130,
//     debtsRecovered: 90,
//     inspected: 160,
//     lettersServed: 190,
//   },
//   {
//     month: "April",
//     debtsEstablished: 100,
//     debtsRecovered: 70,
//     inspected: 140,
//     lettersServed: 170,
//   },
//   {
//     month: "May",
//     debtsEstablished: 140,
//     debtsRecovered: 110,
//     inspected: 170,
//     lettersServed: 200,
//   },
//   {
//     month: "June",
//     debtsEstablished: 160,
//     debtsRecovered: 120,
//     inspected: 190,
//     lettersServed: 230,
//   },
//   {
//     month: "July",
//     debtsEstablished: 180,
//     debtsRecovered: 130,
//     inspected: 200,
//     lettersServed: 240,
//   },
//   {
//     month: "August",
//     debtsEstablished: 170,
//     debtsRecovered: 125,
//     inspected: 195,
//     lettersServed: 235,
//   },
//   {
//     month: "September",
//     debtsEstablished: 190,
//     debtsRecovered: 140,
//     inspected: 210,
//     lettersServed: 250,
//   },
// ];

// const chartConfig = {
//   debtsEstablished: {
//     label: "Debts Established",
//     color: "#F59E0B",
//   },
//   debtsRecovered: {
//     label: "Debts Recovered",
//     color: "#8B5CF6",
//   },
//   inspected: {
//     label: "Inspected",
//     color: "#10B981",
//   },
//   lettersServed: {
//     label: "Letters Served",
//     color: "#3B82F6",
//   },
// } satisfies ChartConfig;

// export function InspectionLineChart() {
//   return (
//     <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
//       <CardHeader className="pb-6">
//         <div className="flex items-start justify-between">
//           <div>
//             <CardTitle className="text-2xl font-bold text-gray-900">
//               Inspection Trends
//             </CardTitle>
//             <CardDescription className="text-sm text-gray-600 mt-2">
//               Month-to-Date & Year-to-Date Performance
//             </CardDescription>
//           </div>
//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg">
//             <TrendingUp className="w-5 h-5 text-blue-600" />
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="pt-0">
//         <div className="w-full h-[450px] bg-white rounded-lg p-4 border border-gray-100">
//           <ChartContainer config={chartConfig} className="h-full w-full">
//             <BarChart
//               accessibilityLayer
//               data={chartData}
//               margin={{
//                 left: 12,
//                 right: 12,
//                 top: 20,
//                 bottom: 20,
//               }}
//             >
//               <defs>
//                 <linearGradient
//                   id="colorDebtsEstablished"
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1} />
//                   <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient
//                   id="colorDebtsRecovered"
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
//                   <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient id="colorInspected" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
//                   <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient
//                   id="colorLettersServed"
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
//                   <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid
//                 vertical={false}
//                 strokeDasharray="3 3"
//                 stroke="#e5e7eb"
//                 strokeWidth={1}
//               />
//               <XAxis
//                 dataKey="month"
//                 tickLine={false}
//                 axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
//                 tickMargin={12}
//                 tickFormatter={(value) => value.slice(0, 3)}
//                 stroke="#9ca3af"
//                 fontSize={12}
//                 style={{ fontWeight: 500 }}
//               />
//               <YAxis
//                 tickLine={false}
//                 axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
//                 tickMargin={8}
//                 tickFormatter={(value) => `${value}`}
//                 stroke="#9ca3af"
//                 fontSize={12}
//                 style={{ fontWeight: 500 }}
//               />
//               <ChartTooltip
//                 cursor={{ stroke: "#e5e7eb", strokeWidth: 2 }}
//                 content={
//                   <ChartTooltipContent
//                     indicator="line"
//                     className="bg-white border border-gray-200 rounded-lg shadow-lg"
//                   />
//                 }
//               />
//               <Bar
//                 dataKey="debtsEstablished"
//                 type="monotone"
//                 stroke="var(--color-debtsEstablished)"
//                 strokeWidth={3}
//                 // dot={false}
//                 isAnimationActive={true}
//                 animationDuration={1000}
//               />
//               <Bar
//                 dataKey="debtsRecovered"
//                 type="monotone"
//                 stroke="var(--color-debtsRecovered)"
//                 strokeWidth={3}
//                 // dot={false}
//                 isAnimationActive={true}
//                 animationDuration={1000}
//               />
//               <Bar
//                 dataKey="inspected"
//                 type="monotone"
//                 stroke="var(--color-inspected)"
//                 strokeWidth={3}
//                 // dot={false}
//                 isAnimationActive={true}
//                 animationDuration={1000}
//               />
//               <Bar
//                 dataKey="lettersServed"
//                 type="monotone"
//                 stroke="var(--color-lettersServed)"
//                 strokeWidth={3}
//                 // dot={false}
//                 isAnimationActive={true}
//                 animationDuration={1000}
//               />
//               <ChartLegend
//                 content={<ChartLegendContent />}
//                 wrapperStyle={{ paddingTop: "20px" }}
//               />
//             </BarChart>
//           </ChartContainer>
//         </div>

//         <div className="grid grid-cols-4 gap-4 mt-8">
//           <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
//               <p className="text-xs font-semibold text-amber-900">
//                 Debts Established
//               </p>
//             </div>
//             <p className="text-2xl font-bold text-amber-700">190</p>
//           </div>
//           <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
//               <p className="text-xs font-semibold text-purple-900">
//                 Debts Recovered
//               </p>
//             </div>
//             <p className="text-2xl font-bold text-purple-700">140</p>
//           </div>
//           <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
//               <p className="text-xs font-semibold text-emerald-900">
//                 Inspected
//               </p>
//             </div>
//             <p className="text-2xl font-bold text-emerald-700">210</p>
//           </div>
//           <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//               <p className="text-xs font-semibold text-blue-900">
//                 Letters Served
//               </p>
//             </div>
//             <p className="text-2xl font-bold text-blue-700">250</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

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

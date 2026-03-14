import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { SeverityBadge } from "../components/SeverityBadge";
import { useScanContext } from "../context/ScanContext";
import { useAnalysisResult } from "../hooks/useQueries";
import {
  generateNetworkLogs,
  generateNetworkTimeline,
  generateRuntimeBehaviors,
} from "../lib/mockData";

export function DynamicAnalysis() {
  const { selectedJobId } = useScanContext();
  const { data: result, isLoading } = useAnalysisResult(selectedJobId);

  const networkLogs = useMemo(
    () => (result ? generateNetworkLogs(result.overallScore) : []),
    [result],
  );

  const behaviors = useMemo(
    () => (result ? generateRuntimeBehaviors(result.threatScore) : []),
    [result],
  );

  const timelineData = useMemo(
    () => (result ? generateNetworkTimeline(result.overallScore) : []),
    [result],
  );

  const testsPassed = result
    ? Math.floor(Number(result.overallScore) * 0.8)
    : 0;
  const testsFailed = result
    ? Math.floor((100 - Number(result.overallScore)) * 0.4)
    : 0;
  const totalTests = testsPassed + testsFailed;

  if (!selectedJobId) {
    return (
      <div className="p-6">
        <EmptyState
          title="No scan selected"
          desc="Select a scan from the sidebar to view dynamic analysis results."
          icon={<Activity className="h-10 w-10" />}
        />
      </div>
    );
  }

  if (isLoading || !result) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dynamic Analysis</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Runtime behavior, network traffic, and instrumented test results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Tests</span>
              <span className="font-bold">{totalTests}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 font-medium">
                  Passed
                </span>
                <span className="text-xs font-bold text-green-600">
                  {testsPassed}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${totalTests > 0 ? (testsPassed / totalTests) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-600 font-medium">Failed</span>
                <span className="text-xs font-bold text-red-600">
                  {testsFailed}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${totalTests > 0 ? (testsFailed / totalTests) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Network Traffic Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={timelineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Legend
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 10 }}>{v}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Requests"
                />
                <Line
                  type="monotone"
                  dataKey="suspicious"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                  name="Suspicious"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Network Traffic Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="dynamic.network.table">
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Suspicious</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {networkLogs.map((log, i) => (
                <TableRow
                  key={`${log.timestamp}-${log.url}-${i}`}
                  data-ocid={`dynamic.network.item.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-mono ${log.method === "POST" ? "text-orange-600 border-orange-200" : "text-blue-600 border-blue-200"}`}
                    >
                      {log.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[280px] truncate">
                    {log.url}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-mono font-bold ${
                        log.statusCode >= 500
                          ? "text-red-600"
                          : log.statusCode >= 400
                            ? "text-orange-600"
                            : "text-green-600"
                      }`}
                    >
                      {log.statusCode}
                    </span>
                  </TableCell>
                  <TableCell>
                    {log.suspicious ? (
                      <Badge className="text-xs bg-red-50 text-red-700 border border-red-200 hover:bg-red-50">
                        ⚠ Yes
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">
                        ✓ No
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Runtime Behaviors ({behaviors.length} detected)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {behaviors.map((b, i) => (
            <motion.div
              key={b.category}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
            >
              <SeverityBadge
                severity={b.severity}
                className="mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {b.category}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {b.timestamp}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-0.5">
                  {b.description}
                </p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  icon,
}: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="text-muted-foreground/30 mb-4">{icon}</div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{desc}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48 col-span-2" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

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
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import { SeverityBadge } from "../components/SeverityBadge";
import { useScanContext } from "../context/ScanContext";
import { useAnalysisResult } from "../hooks/useQueries";
import {
  generateLeakageRisks,
  generatePermissions,
  generateSensitiveAPIs,
} from "../lib/mockData";

export function PrivacyAnalysis() {
  const { selectedJobId } = useScanContext();
  const { data: result, isLoading } = useAnalysisResult(selectedJobId);

  const leakageRisks = useMemo(
    () => (result ? generateLeakageRisks(result) : []),
    [result],
  );

  const sensitiveAPIs = useMemo(
    () => (result ? generateSensitiveAPIs(result.permissionsCount) : []),
    [result],
  );

  const permissions = useMemo(
    () => (result ? generatePermissions(result.permissionsCount) : []),
    [result],
  );

  const permPieData = useMemo(() => {
    const dangerous = permissions.filter((p) => p.type === "Dangerous").length;
    const normal = permissions.filter((p) => p.type === "Normal").length;
    return [
      { name: "Dangerous", value: dangerous, color: "#dc2626" },
      { name: "Normal", value: normal, color: "#16a34a" },
    ];
  }, [permissions]);

  const privacyScore = useMemo(() => {
    if (!result) return 0;
    const base = Number(result.overallScore);
    const permPenalty = Math.min(30, Number(result.permissionsCount) * 2);
    return Math.max(0, base - permPenalty);
  }, [result]);

  if (!selectedJobId) {
    return (
      <div className="p-6">
        <EmptyState
          title="No scan selected"
          desc="Select a scan from the sidebar to view privacy analysis."
          icon={<Lock className="h-10 w-10" />}
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
        <h1 className="text-2xl font-display font-bold">Privacy Analysis</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Data leakage risks, sensitive API usage, and permission analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Privacy Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <svg
                  width="80"
                  height="80"
                  aria-label={`Privacy score: ${privacyScore}`}
                >
                  <title>Privacy score: {privacyScore} out of 100</title>
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke={
                      privacyScore >= 60
                        ? "#16a34a"
                        : privacyScore >= 40
                          ? "#d97706"
                          : "#dc2626"
                    }
                    strokeWidth="8"
                    strokeDasharray={`${(privacyScore / 100) * 201} 201`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold font-display">
                  {privacyScore}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {privacyScore >= 70
                    ? "Good Privacy Posture"
                    : privacyScore >= 40
                      ? "Moderate Privacy Risk"
                      : "High Privacy Risk"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Score derived from permission usage, data leakage risks, and
                  API usage patterns.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {leakageRisks.length} leakage risks
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {sensitiveAPIs.length} sensitive APIs
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Permission Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={permPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {permPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Data Leakage Risks</h2>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          data-ocid="privacy.leakage.table"
        >
          {leakageRisks.map((risk, i) => (
            <motion.div
              key={risk.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg border p-4 ${
                risk.severity === "Critical"
                  ? "bg-red-50 border-red-200"
                  : risk.severity === "High"
                    ? "bg-orange-50 border-orange-200"
                    : risk.severity === "Medium"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{risk.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {risk.description}
                  </p>
                  <p className="text-xs font-mono text-primary/70 mt-1">
                    {risk.location}
                  </p>
                </div>
                <SeverityBadge
                  severity={risk.severity}
                  className="flex-shrink-0"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Sensitive API Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>API</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensitiveAPIs.map((api, i) => (
                <TableRow
                  key={api.name}
                  data-ocid={`privacy.api.item.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs">
                    {api.name}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {api.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    {api.usage}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={api.riskLevel} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Code2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { SeverityBadge } from "../components/SeverityBadge";
import { useScanContext } from "../context/ScanContext";
import { useAnalysisResult } from "../hooks/useQueries";
import { generatePermissions, generateVulnerabilities } from "../lib/mockData";

const SEV_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#d97706",
  Low: "#16a34a",
};

export function StaticAnalysis() {
  const { selectedJobId } = useScanContext();
  const { data: result, isLoading } = useAnalysisResult(selectedJobId);

  const permissions = useMemo(
    () => (result ? generatePermissions(result.permissionsCount) : []),
    [result],
  );

  const vulns = useMemo(
    () => (result ? generateVulnerabilities(result.vulnerabilitiesCount) : []),
    [result],
  );

  const barData = useMemo(() => {
    if (!result) return [];
    return [
      { name: "Critical", count: Number(result.criticalCount) },
      { name: "High", count: Number(result.highCount) },
      { name: "Medium", count: Number(result.mediumCount) },
      { name: "Low", count: Number(result.lowCount) },
    ];
  }, [result]);

  if (!selectedJobId) {
    return (
      <div className="p-6">
        <EmptyState
          title="No scan selected"
          desc="Select a scan from the sidebar to view static analysis results."
          icon={<Code2 className="h-10 w-10" />}
        />
      </div>
    );
  }

  if (isLoading || !result) {
    return <LoadingSkeleton />;
  }

  const overallScore = Number(result.overallScore);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Static Analysis</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Source code and binary analysis findings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Overall Security Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-bold text-foreground">
                {overallScore}
              </span>
              <span className="text-lg text-muted-foreground mb-0.5">/100</span>
            </div>
            <Progress value={overallScore} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {overallScore >= 75
                ? "Good security posture"
                : overallScore >= 50
                  ? "Moderate risk — review findings"
                  : "High risk — immediate action required"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Severity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={barData} barSize={28}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={SEV_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Permissions ({permissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="static.findings.table">
            <TableHeader>
              <TableRow>
                <TableHead>Permission Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((perm, i) => (
                <TableRow
                  key={perm.name}
                  data-ocid={`static.permissions.item.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs">
                    {perm.name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium ${perm.type === "Dangerous" ? "text-red-600" : "text-muted-foreground"}`}
                    >
                      {perm.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={perm.riskLevel} />
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
            Vulnerabilities ({vulns.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vulns.map((vuln, i) => (
            <motion.div
              key={vuln.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <SeverityBadge
                severity={vuln.severity}
                className="mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{vuln.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {vuln.description}
                </p>
                <p className="text-xs font-mono text-primary/70 mt-1">
                  {vuln.file}:{vuln.line}
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
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{desc}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

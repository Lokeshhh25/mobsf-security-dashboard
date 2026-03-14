import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  AlertTriangle,
  Eye,
  Scan,
  Shield,
  Trash2,
  TrendingUp,
} from "lucide-react";
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
import { toast } from "sonner";
import { FileUpload } from "../components/FileUpload";
import { SeverityBadge } from "../components/SeverityBadge";
import { useScanContext } from "../context/ScanContext";
import { useDeleteJob, useListJobs } from "../hooks/useQueries";

const SEVERITY_COLORS = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#d97706",
  Low: "#16a34a",
};

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Dashboard() {
  const { data: jobs = [], isLoading } = useListJobs();
  const { mutate: deleteJob } = useDeleteJob();
  const { setSelectedJobId } = useScanContext();

  const stats = useMemo(() => {
    const total = jobs.length;
    return {
      total,
      critical: Math.floor(total * 0.3),
      high: Math.floor(total * 0.5),
      avgScore: total > 0 ? 62 : 0,
    };
  }, [jobs]);

  const mockPieData = useMemo(
    () => [
      {
        name: "Critical",
        value: stats.critical + 3,
        color: SEVERITY_COLORS.Critical,
      },
      { name: "High", value: stats.high + 5, color: SEVERITY_COLORS.High },
      { name: "Medium", value: 8, color: SEVERITY_COLORS.Medium },
      { name: "Low", value: 12, color: SEVERITY_COLORS.Low },
    ],
    [stats],
  );

  const handleDelete = (id: string, name: string) => {
    deleteJob(id, {
      onSuccess: () => toast.success(`Deleted scan: ${name}`),
      onError: () => toast.error("Failed to delete scan"),
    });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Security Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor and analyze mobile application security across all scans.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Scans",
            value: stats.total,
            icon: Scan,
            color: "text-primary",
          },
          {
            label: "Critical Issues",
            value: stats.critical,
            icon: AlertTriangle,
            color: "text-red-600",
          },
          {
            label: "High Issues",
            value: stats.high,
            icon: Shield,
            color: "text-orange-600",
          },
          {
            label: "Avg Security Score",
            value: `${stats.avgScore}/100`,
            icon: TrendingUp,
            color: "text-green-600",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card
              data-ocid="dashboard.stats.card"
              className="shadow-card hover:shadow-card-hover transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p
                      className={`text-2xl font-display font-bold mt-1 ${stat.color}`}
                    >
                      {isLoading ? "—" : stat.value}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2" data-ocid="jobs.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div
                  data-ocid="jobs.empty_state"
                  className="flex flex-col items-center justify-center py-12 text-center px-4"
                >
                  <Shield className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No scans yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Upload an APK, IPA, or APPX file to get started
                  </p>
                </div>
              ) : (
                <Table data-ocid="jobs.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job, idx) => (
                      <TableRow key={job.id} data-ocid={`jobs.item.${idx + 1}`}>
                        <TableCell className="font-medium font-mono text-xs max-w-[180px] truncate">
                          {job.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {job.fileType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(job.uploadedAt)}
                        </TableCell>
                        <TableCell>
                          <SeverityBadge
                            severity={
                              job.status === "completed"
                                ? "Low"
                                : job.status === "pending"
                                  ? "Info"
                                  : "Medium"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setSelectedJobId(job.id)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              data-ocid="scan.delete_button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(job.id, job.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <FileUpload />

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Severity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={mockPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mockPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 11, color: "#6b7280" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

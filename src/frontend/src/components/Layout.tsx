import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bug,
  ChevronDown,
  Code2,
  LayoutDashboard,
  Lock,
  Shield,
} from "lucide-react";
import type { ReactNode } from "react";
import { useScanContext } from "../context/ScanContext";
import { useListJobs } from "../hooks/useQueries";

const NAV_ITEMS = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    path: "/static",
    label: "Static Analysis",
    icon: Code2,
    ocid: "nav.static.link",
  },
  {
    path: "/dynamic",
    label: "Dynamic Analysis",
    icon: Activity,
    ocid: "nav.dynamic.link",
  },
  {
    path: "/malware",
    label: "Malware Analysis",
    icon: Bug,
    ocid: "nav.malware.link",
  },
  {
    path: "/privacy",
    label: "Privacy Analysis",
    icon: Lock,
    ocid: "nav.privacy.link",
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { selectedJobId, setSelectedJobId } = useScanContext();
  const { data: jobs = [] } = useListJobs();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary">
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-sidebar-foreground leading-none">
              MobSF
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5 uppercase tracking-widest">
              Security Suite
            </p>
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-ocid={item.ocid}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Scan Selector */}
          <div className="px-3 mt-4 pt-4 border-t border-sidebar-border">
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold mb-2 px-1">
              Active Scan
            </p>
            <Select
              value={selectedJobId ?? ""}
              onValueChange={(v) => setSelectedJobId(v || null)}
            >
              <SelectTrigger
                data-ocid="scan.select"
                className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground w-full"
              >
                <SelectValue placeholder="Select a scan..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No scans yet
                  </SelectItem>
                ) : (
                  jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      <span className="truncate max-w-[140px] block">
                        {job.name}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/30 text-center">
            © {new Date().getFullYear()} ·{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-sidebar-foreground/60 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

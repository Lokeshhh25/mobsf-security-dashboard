import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import { ScanProvider } from "./context/ScanContext";
import { Dashboard } from "./pages/Dashboard";
import { DynamicAnalysis } from "./pages/DynamicAnalysis";
import { MalwareAnalysis } from "./pages/MalwareAnalysis";
import { PrivacyAnalysis } from "./pages/PrivacyAnalysis";
import { StaticAnalysis } from "./pages/StaticAnalysis";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const staticRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/static",
  component: StaticAnalysis,
});

const dynamicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dynamic",
  component: DynamicAnalysis,
});

const malwareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/malware",
  component: MalwareAnalysis,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyAnalysis,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  staticRoute,
  dynamicRoute,
  malwareRoute,
  privacyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScanProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </ScanProvider>
    </QueryClientProvider>
  );
}

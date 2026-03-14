import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AnalysisJob, AnalysisResult } from "../backend.d";
import { useActor } from "./useActor";

export function useListJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<AnalysisJob[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listJobs();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useAnalysisResult(jobId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<AnalysisResult | null>({
    queryKey: ["result", jobId],
    queryFn: async () => {
      if (!actor || !jobId) return null;
      return actor.getAnalysisResults(jobId);
    },
    enabled: !!actor && !isFetching && !!jobId,
  });
}

export function useUploadFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      fileType,
      size,
    }: { name: string; fileType: string; size: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.uploadFile(name, fileType, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

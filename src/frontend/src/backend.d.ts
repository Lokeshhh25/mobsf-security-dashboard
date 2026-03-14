import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AnalysisResult {
    mediumCount: bigint;
    overallScore: bigint;
    isMalicious: boolean;
    threatScore: bigint;
    jobId: string;
    highCount: bigint;
    vulnerabilitiesCount: bigint;
    permissionsCount: bigint;
    lowCount: bigint;
    criticalCount: bigint;
}
export interface AnalysisJob {
    id: string;
    status: string;
    name: string;
    size: bigint;
    fileType: string;
    uploadedAt: bigint;
}
export interface backendInterface {
    deleteJob(jobId: string): Promise<boolean>;
    getAnalysisResults(jobId: string): Promise<AnalysisResult | null>;
    listJobs(): Promise<Array<AnalysisJob>>;
    uploadFile(name: string, fileType: string, size: bigint): Promise<AnalysisJob>;
}

# MobSF Security Dashboard

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- File upload interface for APK/IPA/APPX files with drag-and-drop and file type validation
- Static Analysis Dashboard: permissions list, vulnerability findings, code issues with severity badges
- Dynamic Analysis Panel: runtime behavior, network traffic logs, instrumented test results
- Malware Analysis Report View: threat scores, flagged behaviors, risk ratings
- Privacy Analysis Section: data leakage risks, sensitive API usage, permission analysis
- Security Score Cards: severity levels (Critical, High, Medium, Low) with visual summaries
- Charts: pie charts for severity distribution, bar charts for risk categories, timeline for network traffic
- Light professional UI theme with green/red/amber severity color coding

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- `uploadFile(name: Text, fileType: Text, size: Nat): async AnalysisJob` -- create a new analysis job
- `getAnalysisResults(jobId: Text): async ?AnalysisResult` -- fetch simulated results
- `listJobs(): async [AnalysisJob]` -- list all uploaded files/jobs
- `deleteJob(jobId: Text): async Bool`
- Data types: AnalysisJob, StaticFindings, DynamicFindings, MalwareReport, PrivacyReport, SecurityScore
- Simulated findings generated deterministically from file metadata (name hash)

### Frontend
- Sidebar navigation: Dashboard, Static Analysis, Dynamic Analysis, Malware Analysis, Privacy Analysis
- Dashboard home: overview stats, recent scans, aggregate score cards
- File upload flow with drag-and-drop, APK/IPA/APPX validation
- Static Analysis page: permissions table, vulnerability list, code findings
- Dynamic Analysis page: network traffic log table, runtime behavior timeline, test results
- Malware Analysis page: threat score gauge, flagged behaviors list, risk rating
- Privacy Analysis page: data leakage risks, sensitive APIs, permission breakdown
- Recharts for all visualizations

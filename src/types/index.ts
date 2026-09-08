export type FindingType =
  | "PROMPT_INJECTION"
  | "INTERNAL_INCONSISTENCY"
  | "TEMPLATED_INFLATION";

export type Severity = "LOW" | "MEDIUM" | "HIGH";

export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface IntegrityFindingData {
  id?: string;
  type: FindingType;
  severity: Severity;
  title: string;
  evidence: string;
  explanation: string;
  recommendedAction: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface IntegrityReportData {
  id?: string;
  status: AnalysisStatus;
  summary?: string | null;
  findings: IntegrityFindingData[];
  completedAt?: Date | string | null;
}

export interface CandidateScoreData {
  id?: string;
  score: number;
  matchedRequirements: string[];
  missingRequirements: string[];
  explanation: string;
}

export interface RoleData {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  createdById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  candidateCount?: number;
  reviewNeededCount?: number;
}

export interface CandidateData {
  id: string;
  roleId: string;
  name: string;
  email?: string | null;
  resumeText: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  role?: RoleData;
  integrityReport?: IntegrityReportData | null;
  score?: CandidateScoreData | null;
}

export interface AnalysisPipelineResult {
  candidateId: string;
  status: AnalysisStatus;
  integrityReport: IntegrityReportData;
  score?: CandidateScoreData;
  error?: string;
}

export interface CareStatus {
  id: number;
  name: string;
  code: string;
  color: string;
  description?: string;
  sortOrder?: number;
  default: boolean;
  closed: boolean;
  requireFollowUpDate: boolean;
  active: boolean;
}

export interface CareAction {
  id: number;
  name: string;
  code: string;
  description?: string;
  sortOrder?: number;
  active: boolean;
}

export interface CareResult {
  id: number;
  name: string;
  code: string;
  description?: string;
  suggestedStatusId?: number | null;
  requireFollowUpDate: boolean;
  sortOrder?: number;
  active: boolean;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  active: boolean;
}

export interface CaseRow {
  id: string;
  customerEmail: string | null;
  customerPhone: string | null;
  serviceName: string | null;
  name: string | null;
  status: string | null;
  assignedUserId: string | null;
  careStatusId: number | null;
  nextFollowUpAt: string | null;
  lastCaredAt: string | null;
  lastCareResultId: number | null;
  tagIds: number[];
  caseCreatedAt: string | null;
}

export interface CareLog {
  id: number;
  caseId: string;
  staffId: string;
  actionId: number | null;
  resultId: number | null;
  newStatusId: number | null;
  note: string | null;
  followUpAt: string | null;
  createdAt: string;
}

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  position: string;
  email: string;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

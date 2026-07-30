export type DocumentTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type DocumentFieldInputType = 'TEXT' | 'TEXTAREA' | 'DATE' | 'NUMBER';
export type DocumentDataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
export type GeneratedDocumentStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'FINAL'
  | 'VOID';

export interface DocumentTemplateField {
  fieldKey: string;
  label: string;
  helpText?: string;
  inputType: DocumentFieldInputType;
  required: boolean;
  sortOrder: number;
  defaultValue?: string;
  maxLength?: number;
  validationPattern?: string;
  minimum?: number;
  maximum?: number;
  options?: string[];
  dataClassification?: DocumentDataClassification;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  status: DocumentTemplateStatus;
  version: number;
  originalFileName?: string;
  fileSize: number;
  contentSha256?: string;
  fields: DocumentTemplateField[];
  /** Trường lặp suy ra từ placeholder ${list__child}: listKey -> danh sách childKey. */
  lists?: Record<string, string[]>;
  createdByUserId?: string;
  updatedByUserId?: string;
  publishedByUserId?: string;
  effectiveFrom?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  latestVersionId?: string;
  activeVersionId?: string;
  hasUnpublishedChanges?: boolean;
  serviceId?: string;
  serviceName?: string;
  tags?: string[];
  revision?: number;
}

export interface BundleItem {
  templateId: string;
  sortOrder: number;
  required: boolean;
}

export interface DocumentBundle {
  id: string;
  name: string;
  description?: string;
  status: DocumentTemplateStatus;
  serviceId?: string;
  serviceName?: string;
  tags?: string[];
  items: BundleItem[];
  createdByUserId?: string;
  updatedByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  revision?: number;
}

export interface DocumentBundleRequest {
  name: string;
  description?: string;
  serviceId?: string;
  serviceName?: string;
  tags?: string[];
  items: Array<{ templateId: string; sortOrder: number; required: boolean }>;
  expectedRevision?: number;
}

export interface BundleGenerationResult {
  templateId: string;
  document: GeneratedDocument | null;
  error: string | null;
}

export interface GenerateBundleResponse {
  bundleId: string;
  total: number;
  succeeded: number;
  failed: number;
  results: BundleGenerationResult[];
}

export interface ShareLink {
  id: string;
  token: string | null;
  path: string | null;
  expiresAt?: string;
  maxDownloads?: number | null;
  downloadCount: number;
  revoked: boolean;
  active: boolean;
  createdAt?: string;
}

export interface DocumentStats {
  templatesTotal: number;
  templatesByStatus: Record<string, number>;
  generatedTotal: number;
  generatedByStatus: Record<string, number>;
  generatedLast30Days: number;
  bundlesActive: number;
}

export interface TemplatePreview {
  id: string;
  name: string;
  html: string;
}

export interface ApplyMappingItem {
  sampleText: string;
  fieldKey: string;
  label: string;
  helpText?: string;
  inputType: DocumentFieldInputType;
  required: boolean;
  sortOrder: number;
  defaultValue?: string;
  maxLength?: number;
  validationPattern?: string;
  minimum?: number;
  maximum?: number;
  options?: string[];
  dataClassification?: DocumentDataClassification;
  expectedOccurrences?: number;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateVersionId?: string;
  templateName: string;
  templateVersion: number;
  templateContentSha256?: string;
  generatedContentSha256?: string;
  fileName: string;
  downloadUrl: string;
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: GeneratedDocumentStatus;
  reviewerUserId?: string;
  approvedByUserId?: string;
  finalizedByUserId?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  finalizedAt?: string;
  context?: GenerateDocumentContext;
  /** Flat context fields are kept for compatibility with the first document-service API. */
  crmCaseId?: string;
  customerId?: string;
  serviceId?: string;
  serviceName?: string;
  dossierId?: string;
  matterReference?: string;
  sourceReferences?: string[];
  revision?: number;
}

export interface DocumentTemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  previousVersionId?: string;
  name: string;
  description?: string;
  originalFileName?: string;
  fileSize: number;
  contentSha256?: string;
  fields: DocumentTemplateField[];
  changeReason?: string;
  effectiveFrom?: string;
  createdByUserId?: string;
  createdAt?: string;
  active: boolean;
  latest: boolean;
}

export interface DocumentAuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorUserId?: string;
  fromStatus?: string;
  toStatus?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TemplateListQuery {
  q?: string;
  status?: DocumentTemplateStatus | 'ALL';
  serviceId?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface GeneratedDocumentListQuery {
  q?: string;
  status?: GeneratedDocumentStatus | 'ALL';
  templateId?: string;
  crmCaseId?: string;
  customerId?: string;
  serviceId?: string;
  dossierId?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PublishTemplateRequest {
  fields?: DocumentTemplateField[];
  name?: string;
  description?: string;
  serviceId?: string;
  serviceName?: string;
  tags?: string[];
  changeReason?: string;
  effectiveFrom?: string;
  expectedRevision?: number;
}

export interface UpdateTemplateFieldsOptions {
  changeReason?: string;
  expectedRevision?: number;
}

export interface RestoreTemplateVersionRequest {
  changeReason: string;
  expectedRevision?: number;
}

export interface GenerateDocumentContext {
  crmCaseId?: string;
  customerId?: string;
  serviceId?: string;
  serviceName?: string;
  dossierId?: string;
  matterReference?: string;
  sourceReferences?: Record<string, string>;
}

export interface GenerateDocumentRequest extends GenerateDocumentContext {
  values: Record<string, string>;
}

export interface WorkflowTransitionRequest {
  targetStatus: GeneratedDocumentStatus;
  reviewerUserId?: string;
  reason?: string;
  expectedRevision?: number;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
  meta?: unknown;
}

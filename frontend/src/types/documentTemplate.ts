export type DocumentTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type DocumentFieldInputType = 'TEXT' | 'TEXTAREA' | 'DATE' | 'NUMBER';

export interface DocumentTemplateField {
  fieldKey: string;
  label: string;
  helpText?: string;
  inputType: DocumentFieldInputType;
  required: boolean;
  sortOrder: number;
  defaultValue?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  status: DocumentTemplateStatus;
  version: number;
  originalFileName?: string;
  fileSize: number;
  fields: DocumentTemplateField[];
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
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
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateName: string;
  templateVersion: number;
  fileName: string;
  downloadUrl: string;
  createdByUserId?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
  meta?: unknown;
}

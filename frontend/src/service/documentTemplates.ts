import gatewayClient from './gatewayClient';
import {
  ApiResponse,
  ApplyMappingItem,
  DocumentTemplate,
  DocumentTemplateField,
  DocumentTemplateVersion,
  DocumentTemplateStatus,
  DocumentAuditEntry,
  DocumentBundle,
  DocumentBundleRequest,
  DocumentStats,
  DocumentClause,
  DocumentFolder,
  ClauseRequest,
  GenerateBundleResponse,
  ShareLink,
  GeneratedDocumentListQuery,
  GenerateDocumentContext,
  GeneratedDocument,
  PageResponse,
  PublishTemplateRequest,
  RestoreTemplateVersionRequest,
  TemplateListQuery,
  TemplatePreview,
  UpdateTemplateFieldsOptions,
  WorkflowTransitionRequest,
} from '../types/documentTemplate';

const documentTemplateService = {
  getStats: async (): Promise<DocumentStats> => {
    const res = await gatewayClient.get<ApiResponse<DocumentStats>>('/documents/stats');
    return res.data.data;
  },

  listFolders: async (): Promise<DocumentFolder[]> => {
    const res = await gatewayClient.get<ApiResponse<DocumentFolder[]>>('/documents/folders');
    return res.data.data ?? [];
  },

  createFolder: async (name: string): Promise<DocumentFolder> => {
    const res = await gatewayClient.post<ApiResponse<DocumentFolder>>('/documents/folders', {
      name,
    });
    return res.data.data;
  },

  renameFolder: async (
    id: string,
    name: string,
    expectedRevision?: number
  ): Promise<DocumentFolder> => {
    const res = await gatewayClient.put<ApiResponse<DocumentFolder>>(`/documents/folders/${id}`, {
      name,
      expectedRevision,
    });
    return res.data.data;
  },

  deleteFolder: async (id: string): Promise<void> => {
    await gatewayClient.delete(`/documents/folders/${id}`);
  },

  setTemplateFolder: async (
    templateId: string,
    folderId: string | null
  ): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${templateId}/folder`,
      { folderId }
    );
    return res.data.data;
  },

  listClauses: async (query?: string, tag?: string): Promise<DocumentClause[]> => {
    const res = await gatewayClient.get<ApiResponse<DocumentClause[]>>('/documents/clauses', {
      params: cleanParams({ q: query, tag }),
    });
    return res.data.data ?? [];
  },

  createClause: async (request: ClauseRequest): Promise<DocumentClause> => {
    const res = await gatewayClient.post<ApiResponse<DocumentClause>>(
      '/documents/clauses',
      request
    );
    return res.data.data;
  },

  updateClause: async (id: string, request: ClauseRequest): Promise<DocumentClause> => {
    const res = await gatewayClient.put<ApiResponse<DocumentClause>>(
      `/documents/clauses/${id}`,
      request
    );
    return res.data.data;
  },

  archiveClause: async (id: string): Promise<DocumentClause> => {
    const res = await gatewayClient.delete<ApiResponse<DocumentClause>>(`/documents/clauses/${id}`);
    return res.data.data;
  },

  listBundles: async (serviceId?: string): Promise<DocumentBundle[]> => {
    const res = await gatewayClient.get<ApiResponse<DocumentBundle[]>>('/documents/bundles', {
      params: serviceId ? { serviceId } : undefined,
    });
    return res.data.data ?? [];
  },

  getBundle: async (id: string): Promise<DocumentBundle> => {
    const res = await gatewayClient.get<ApiResponse<DocumentBundle>>(`/documents/bundles/${id}`);
    return res.data.data;
  },

  createBundle: async (request: DocumentBundleRequest): Promise<DocumentBundle> => {
    const res = await gatewayClient.post<ApiResponse<DocumentBundle>>(
      '/documents/bundles',
      request
    );
    return res.data.data;
  },

  updateBundle: async (id: string, request: DocumentBundleRequest): Promise<DocumentBundle> => {
    const res = await gatewayClient.put<ApiResponse<DocumentBundle>>(
      `/documents/bundles/${id}`,
      request
    );
    return res.data.data;
  },

  archiveBundle: async (id: string): Promise<DocumentBundle> => {
    const res = await gatewayClient.delete<ApiResponse<DocumentBundle>>(`/documents/bundles/${id}`);
    return res.data.data;
  },

  generateBundle: async (
    id: string,
    sharedValues: Record<string, string>,
    context: GenerateDocumentContext = {},
    idempotencyKey?: string
  ): Promise<GenerateBundleResponse> => {
    const res = await gatewayClient.post<ApiResponse<GenerateBundleResponse>>(
      `/documents/bundles/${id}/generate`,
      { sharedValues, context },
      {
        timeout: 120000,
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      }
    );
    return res.data.data;
  },

  listTemplates: async (status?: DocumentTemplateStatus | 'ALL'): Promise<DocumentTemplate[]> => {
    const res = await gatewayClient.get<ApiResponse<DocumentTemplate[]>>('/documents/templates', {
      params: status ? { status } : undefined,
    });
    return res.data.data ?? [];
  },

  listTemplatesPage: async (
    query: TemplateListQuery = {}
  ): Promise<PageResponse<DocumentTemplate>> => {
    const res = await gatewayClient.get<
      ApiResponse<PageResponse<DocumentTemplate> | DocumentTemplate[]>
    >('/documents/templates/page', {
      params: cleanParams(query),
    });
    return normalizePage(res.data.data, query.page, query.size);
  },

  getTemplate: async (id: string): Promise<DocumentTemplate> => {
    const res = await gatewayClient.get<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}`
    );
    return res.data.data;
  },

  dryRunTemplate: async (
    id: string
  ): Promise<{ valid: boolean; outputSize: number; outputSha256: string }> => {
    const res = await gatewayClient.post<
      ApiResponse<{ valid: boolean; outputSize: number; outputSha256: string }>
    >(`/documents/templates/${id}/dry-run`, { values: {} });
    return res.data.data;
  },

  duplicateTemplate: async (id: string): Promise<DocumentTemplate> => {
    const res = await gatewayClient.post<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/duplicate`
    );
    return res.data.data;
  },

  uploadTemplate: async (
    file: File,
    name: string,
    description?: string
  ): Promise<DocumentTemplate> => {
    const form = new FormData();
    form.append('file', file);
    form.append('name', name);
    if (description) form.append('description', description);
    const res = await gatewayClient.post<ApiResponse<DocumentTemplate>>(
      '/documents/templates',
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
    return res.data.data;
  },

  uploadRaw: async (file: File, name: string, description?: string): Promise<TemplatePreview> => {
    const form = new FormData();
    form.append('file', file);
    form.append('name', name);
    if (description) form.append('description', description);
    const res = await gatewayClient.post<ApiResponse<TemplatePreview>>(
      '/documents/templates/upload-raw',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
    );
    return res.data.data;
  },

  preview: async (id: string): Promise<TemplatePreview> => {
    const res = await gatewayClient.get<ApiResponse<TemplatePreview>>(
      `/documents/templates/${id}/preview`
    );
    return res.data.data;
  },

  applyMappings: async (id: string, mappings: ApplyMappingItem[]): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/mappings`,
      { mappings }
    );
    return res.data.data;
  },

  updateFields: async (
    id: string,
    fields: DocumentTemplateField[],
    options: UpdateTemplateFieldsOptions = {}
  ): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/fields`,
      { fields, ...options }
    );
    return res.data.data;
  },

  publish: async (id: string, request?: PublishTemplateRequest): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/publish`,
      request
    );
    return res.data.data;
  },

  archive: async (id: string): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/archive`
    );
    return res.data.data;
  },

  restore: async (id: string): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/restore`
    );
    return res.data.data;
  },

  generate: async (
    templateId: string,
    values: Record<string, string>,
    context: GenerateDocumentContext = {},
    idempotencyKey?: string,
    lists?: Record<string, Array<Record<string, string>>>
  ): Promise<GeneratedDocument> => {
    const res = await gatewayClient.post<ApiResponse<GeneratedDocument>>(
      `/documents/templates/${templateId}/generate`,
      { values, lists, context },
      {
        timeout: 60000,
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      }
    );
    return res.data.data;
  },

  restoreRetention: async (id: string): Promise<GeneratedDocument> => {
    const res = await gatewayClient.put<ApiResponse<GeneratedDocument>>(
      `/documents/generated/${id}/retention/restore`
    );
    return res.data.data;
  },

  listGenerated: async (): Promise<GeneratedDocument[]> => {
    const res = await gatewayClient.get<ApiResponse<GeneratedDocument[]>>('/documents/generated');
    return res.data.data ?? [];
  },

  listGeneratedPage: async (
    query: GeneratedDocumentListQuery = {}
  ): Promise<PageResponse<GeneratedDocument>> => {
    const res = await gatewayClient.get<
      ApiResponse<PageResponse<GeneratedDocument> | GeneratedDocument[]>
    >('/documents/generated/page', {
      params: cleanParams(query),
    });
    return normalizePage(res.data.data, query.page, query.size);
  },

  listTemplateVersions: async (
    id: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<DocumentTemplateVersion>> => {
    const res = await gatewayClient.get<ApiResponse<PageResponse<DocumentTemplateVersion>>>(
      `/documents/templates/${id}/versions`,
      { params: { page, size } }
    );
    return normalizePage(res.data.data, page, size);
  },

  restoreTemplateVersion: async (
    templateId: string,
    versionId: string,
    request: RestoreTemplateVersionRequest
  ): Promise<DocumentTemplate> => {
    const res = await gatewayClient.post<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${templateId}/versions/${versionId}/restore`,
      request
    );
    return res.data.data;
  },

  listTemplateAudit: async (
    id: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<DocumentAuditEntry>> => {
    const res = await gatewayClient.get<ApiResponse<PageResponse<DocumentAuditEntry>>>(
      `/documents/templates/${id}/audit`,
      { params: { page, size } }
    );
    return normalizePage(res.data.data, page, size);
  },

  listGeneratedAudit: async (
    id: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<DocumentAuditEntry>> => {
    const res = await gatewayClient.get<ApiResponse<PageResponse<DocumentAuditEntry>>>(
      `/documents/generated/${id}/audit`,
      { params: { page, size } }
    );
    return normalizePage(res.data.data, page, size);
  },

  transitionWorkflow: async (
    id: string,
    request: WorkflowTransitionRequest
  ): Promise<GeneratedDocument> => {
    const res = await gatewayClient.put<ApiResponse<GeneratedDocument>>(
      `/documents/generated/${id}/workflow`,
      request
    );
    return res.data.data;
  },

  download: async (id: string, fallbackFileName: string): Promise<void> => {
    const res = await gatewayClient.get(`/documents/generated/${id}/download`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const disposition = res.headers['content-disposition'] as string | undefined;
    const fileName = safeDownloadFileName(
      extractFileName(disposition) || fallbackFileName || 'document.docx'
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  },

  createShareLink: async (
    id: string,
    options: { expiresInHours?: number; maxDownloads?: number } = {}
  ): Promise<ShareLink> => {
    const res = await gatewayClient.post<ApiResponse<ShareLink>>(
      `/documents/generated/${id}/share`,
      options
    );
    return res.data.data;
  },

  emailDocument: async (
    id: string,
    request: { to: string; message?: string; expiresInHours?: number; maxDownloads?: number }
  ): Promise<void> => {
    await gatewayClient.post(`/documents/generated/${id}/email`, request);
  },

  shareLinkUrl: (path: string | null): string => {
    if (!path) return '';
    const base = (process.env.REACT_APP_GATEWAY_URL || '').replace(/\/$/, '');
    return `${base}${path}`;
  },

  downloadPdf: async (id: string, fallbackFileName: string): Promise<void> => {
    const res = await gatewayClient.get(`/documents/generated/${id}/pdf`, {
      responseType: 'blob',
      timeout: 120000,
    });
    const disposition = res.headers['content-disposition'] as string | undefined;
    const base = (extractFileName(disposition) || fallbackFileName || 'document.docx').replace(
      /\.docx$/i,
      ''
    );
    const fileName = safeDownloadFileName(`${base}.pdf`);
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  },
};

function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '' && value !== 'ALL'
    )
  ) as Partial<T>;
}

export function normalizePage<T>(
  data: PageResponse<T> | T[] | null | undefined,
  requestedPage = 0,
  requestedSize = 20
): PageResponse<T> {
  if (Array.isArray(data)) {
    return {
      content: data,
      page: requestedPage,
      size: requestedSize,
      totalElements: data.length,
      totalPages: data.length === 0 ? 0 : 1,
      first: true,
      last: true,
    };
  }
  return {
    content: data?.content ?? [],
    page: data?.page ?? requestedPage,
    size: data?.size ?? requestedSize,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    first: data?.first ?? true,
    last: data?.last ?? true,
  };
}

function extractFileName(disposition?: string): string | null {
  if (!disposition) return null;
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      return utf8[1];
    }
  }
  const ascii = disposition.match(/filename="?([^";]+)"?/i);
  return ascii?.[1] ?? null;
}

function safeDownloadFileName(value: string): string {
  const sanitized = value
    // eslint-disable-next-line no-control-regex -- loai ky tu dieu khien khoi ten file tai ve
    .replace(/[/\\:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/\.+$/g, '')
    .trim();
  return sanitized || 'document.docx';
}

export default documentTemplateService;

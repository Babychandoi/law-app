import gatewayClient from './gatewayClient';
import {
  ApiResponse,
  ApplyMappingItem,
  DocumentTemplate,
  DocumentTemplateField,
  DocumentTemplateStatus,
  GeneratedDocument,
  TemplatePreview,
} from '../types/documentTemplate';

const documentTemplateService = {
  listTemplates: async (status?: DocumentTemplateStatus | 'ALL'): Promise<DocumentTemplate[]> => {
    const res = await gatewayClient.get<ApiResponse<DocumentTemplate[]>>('/documents/templates', {
      params: status ? { status } : undefined,
    });
    return res.data.data ?? [];
  },

  getTemplate: async (id: string): Promise<DocumentTemplate> => {
    const res = await gatewayClient.get<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}`
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

  updateFields: async (id: string, fields: DocumentTemplateField[]): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/fields`,
      { fields }
    );
    return res.data.data;
  },

  publish: async (id: string): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/publish`
    );
    return res.data.data;
  },

  archive: async (id: string): Promise<DocumentTemplate> => {
    const res = await gatewayClient.put<ApiResponse<DocumentTemplate>>(
      `/documents/templates/${id}/archive`
    );
    return res.data.data;
  },

  generate: async (
    templateId: string,
    values: Record<string, string>
  ): Promise<GeneratedDocument> => {
    const res = await gatewayClient.post<ApiResponse<GeneratedDocument>>(
      `/documents/templates/${templateId}/generate`,
      { values },
      { timeout: 60000 }
    );
    return res.data.data;
  },

  listGenerated: async (): Promise<GeneratedDocument[]> => {
    const res = await gatewayClient.get<ApiResponse<GeneratedDocument[]>>('/documents/generated');
    return res.data.data ?? [];
  },

  download: async (id: string, fallbackFileName: string): Promise<void> => {
    const res = await gatewayClient.get(`/documents/generated/${id}/download`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const disposition = res.headers['content-disposition'] as string | undefined;
    const fileName = extractFileName(disposition) || fallbackFileName || 'document.docx';
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

function extractFileName(disposition?: string): string | null {
  if (!disposition) return null;
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) return decodeURIComponent(utf8[1]);
  const ascii = disposition.match(/filename="?([^";]+)"?/i);
  return ascii?.[1] ?? null;
}

export default documentTemplateService;

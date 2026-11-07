import gatewayClient from './gatewayClient';
import {
  CareAction,
  CareLog,
  CareResult,
  CareStatus,
  CaseDetail,
  CaseRow,
  MatterParty,
  PageMeta,
  StaffUser,
  Tag,
} from '../types/crm';

interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
  meta?: PageMeta;
}

export interface CaseFilter {
  keyword?: string;
  status?: string;
  careStatusId?: number;
  assignedTo?: string; // me | none | any | userId
  followUp?: string; // today | overdue | next7 | none
  tagId?: number;
  sort?: string; // "field,dir" — field trong whitelist server (customer|nextFollowUpAt|lastCaredAt|status|caseCreatedAt)
  page?: number;
  size?: number;
}

const crmService = {
  // ----- config -----
  careStatuses: async (): Promise<CareStatus[]> =>
    (await gatewayClient.get<ApiResponse<CareStatus[]>>('/crm/config/care-statuses')).data.data ??
    [],
  careActions: async (): Promise<CareAction[]> =>
    (await gatewayClient.get<ApiResponse<CareAction[]>>('/crm/config/care-actions')).data.data ??
    [],
  careResults: async (): Promise<CareResult[]> =>
    (await gatewayClient.get<ApiResponse<CareResult[]>>('/crm/config/care-results')).data.data ??
    [],
  tags: async (): Promise<Tag[]> =>
    (await gatewayClient.get<ApiResponse<Tag[]>>('/crm/config/tags')).data.data ?? [],

  saveCareStatus: async (s: Partial<CareStatus>): Promise<CareStatus> =>
    (
      await (s.id
        ? gatewayClient.put<ApiResponse<CareStatus>>(`/crm/config/care-statuses/${s.id}`, s)
        : gatewayClient.post<ApiResponse<CareStatus>>('/crm/config/care-statuses', s))
    ).data.data,
  saveCareAction: async (a: Partial<CareAction>): Promise<CareAction> =>
    (
      await (a.id
        ? gatewayClient.put<ApiResponse<CareAction>>(`/crm/config/care-actions/${a.id}`, a)
        : gatewayClient.post<ApiResponse<CareAction>>('/crm/config/care-actions', a))
    ).data.data,
  saveCareResult: async (r: Partial<CareResult>): Promise<CareResult> =>
    (
      await (r.id
        ? gatewayClient.put<ApiResponse<CareResult>>(`/crm/config/care-results/${r.id}`, r)
        : gatewayClient.post<ApiResponse<CareResult>>('/crm/config/care-results', r))
    ).data.data,
  saveTag: async (t: Partial<Tag>): Promise<Tag> =>
    (
      await (t.id
        ? gatewayClient.put<ApiResponse<Tag>>(`/crm/config/tags/${t.id}`, t)
        : gatewayClient.post<ApiResponse<Tag>>('/crm/config/tags', t))
    ).data.data,

  // ----- operations -----
  cases: async (f: CaseFilter): Promise<{ rows: CaseRow[]; meta?: PageMeta }> => {
    const res = await gatewayClient.get<ApiResponse<CaseRow[]>>('/crm/cases', { params: f });
    return { rows: res.data.data ?? [], meta: res.data.meta };
  },
  caseDetail: async (caseId: string): Promise<CaseDetail> =>
    (await gatewayClient.get<ApiResponse<CaseDetail>>(`/crm/cases/${caseId}`)).data.data,
  matterParties: async (caseId: string): Promise<MatterParty[]> =>
    (
      await gatewayClient.get<ApiResponse<MatterParty[]>>(`/crm/cases/${caseId}/parties`, {
        params: { includeArchived: false, page: 0, size: 100 },
      })
    ).data.data ?? [],
  assign: async (caseId: string, userId: string | null): Promise<CaseRow> =>
    (await gatewayClient.put<ApiResponse<CaseRow>>(`/crm/cases/${caseId}/assign`, { userId })).data
      .data,
  changeStatus: async (caseId: string, status: string): Promise<void> => {
    await gatewayClient.put(`/crm/cases/${caseId}/status`, { status });
  },
  careLogs: async (caseId: string): Promise<CareLog[]> =>
    (await gatewayClient.get<ApiResponse<CareLog[]>>(`/crm/cases/${caseId}/care-logs`)).data.data ??
    [],
  recordCare: async (
    caseId: string,
    body: {
      actionId: number;
      resultId?: number;
      newStatusId?: number;
      note?: string;
      followUpAt?: string;
      addTagIds?: number[];
    }
  ): Promise<CareLog> =>
    (await gatewayClient.post<ApiResponse<CareLog>>(`/crm/cases/${caseId}/care-logs`, body)).data
      .data,
  setTags: async (caseId: string, tagIds: number[]): Promise<CaseRow> =>
    (await gatewayClient.put<ApiResponse<CaseRow>>(`/crm/cases/${caseId}/tags`, { tagIds })).data
      .data,
  staff: async (): Promise<StaffUser[]> =>
    (await gatewayClient.get<ApiResponse<StaffUser[]>>('/crm/users')).data.data ?? [],
};

export default crmService;

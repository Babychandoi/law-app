import gatewayClient from '../../service/gatewayClient';
import { calculateLineItem } from './formatters';
import type {
  CrmAccountContactDto,
  CrmAccountDto,
  CrmAccountFilter,
  CrmAccountOverviewDto,
  CrmAccountWritePayload,
  CrmActivityDto,
  CrmActivityWritePayload,
  CrmApiResponse,
  CrmCashflowLedgerType,
  CrmContractCashflowDto,
  CrmContractCashflowWritePayload,
  CrmContractDto,
  CrmContractFilter,
  CrmContractListPayload,
  CrmContractSummaryDto,
  CrmContractWritePayload,
  CrmEntityType,
  CrmKanbanColumnDto,
  CrmLeadConvertRequest,
  CrmLeadConvertResponse,
  CrmLeadDto,
  CrmLeadFilter,
  CrmLeadWritePayload,
  CrmLineItemDto,
  CrmOpportunityDto,
  CrmOpportunityFilter,
  CrmOpportunityWritePayload,
  CrmServiceCatalogItem,
  PageMeta,
  StaffUser,
} from './types';

function ensureStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof val === 'string' && val.trim()) {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function toNumber(val: unknown): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string' && val.trim()) {
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function cleanParams<T extends object>(params: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value;
    }
  });
  return out;
}

function emptyDateToNull(val?: string | null): string | null {
  if (!val || !val.trim()) return null;
  return val.trim();
}

function serializeLineItems(items?: CrmLineItemDto[]): Record<string, unknown>[] | undefined {
  if (!items) return undefined;
  return items.map((item, idx) => ({
    ...item,
    sortOrder: idx,
    itemCode: item.serviceCode || item.itemCode || item.code || '',
    serviceCode: item.serviceCode || item.itemCode || item.code || '',
    description: item.description || item.name || '',
    unit: item.unit || 'Gói',
  }));
}

export function normalizeLineItem(
  raw: Partial<CrmLineItemDto> & Record<string, unknown>
): CrmLineItemDto {
  const serviceCode = String(raw.serviceCode ?? raw.itemCode ?? raw.code ?? '');
  const description = String(raw.description ?? raw.name ?? raw.serviceName ?? '');
  const unit = String(raw.unit ?? 'Gói');
  const quantity = toNumber(raw.quantity ?? 1);
  const unitPrice = toNumber(raw.unitPrice ?? 0);
  const discountRate = toNumber(raw.discountRate ?? 0);
  const discountAmount = toNumber(raw.discountAmount ?? 0);
  const vatRate = String(raw.vatRate ?? raw.taxRate ?? '0%');
  const computed = calculateLineItem({
    quantity,
    unitPrice,
    discountRate,
    discountAmount,
    vatRate,
  });

  return {
    id: raw.id as string | number | undefined,
    itemCode: serviceCode,
    serviceCode,
    code: serviceCode,
    description,
    name: description,
    unit,
    quantity: computed.quantity,
    unitPrice: computed.unitPrice,
    amount: raw.amount !== undefined ? toNumber(raw.amount) : computed.amount,
    discountRate: computed.discountRate,
    discountAmount:
      raw.discountAmount !== undefined ? toNumber(raw.discountAmount) : computed.discountAmount,
    vatRate: computed.vatRate,
    taxRate: computed.vatRate,
    vatAmount:
      raw.vatAmount !== undefined || raw.taxAmount !== undefined
        ? toNumber(raw.vatAmount ?? raw.taxAmount)
        : computed.vatAmount,
    taxAmount:
      raw.vatAmount !== undefined || raw.taxAmount !== undefined
        ? toNumber(raw.vatAmount ?? raw.taxAmount)
        : computed.vatAmount,
    totalAmount: raw.totalAmount !== undefined ? toNumber(raw.totalAmount) : computed.totalAmount,
  };
}

function normalizeLead(raw: CrmLeadDto): CrmLeadDto {
  return {
    ...raw,
    tags: ensureStringArray(raw.tags),
    serviceGroups: ensureStringArray(raw.serviceGroups),
    customerName: raw.customerName ?? raw.fullName ?? '',
    fullName: raw.fullName ?? raw.customerName ?? '',
    phone: raw.phone ?? '',
    customerStatus: raw.customerStatus ?? '3/ Tiềm năng',
  };
}

function normalizeAccount(raw: CrmAccountDto): CrmAccountDto {
  return {
    ...raw,
    tags: ensureStringArray(raw.tags),
    careStatuses: ensureStringArray(raw.careStatuses),
    relatedUsers: ensureStringArray(raw.relatedUsers),
    serviceGroups: ensureStringArray(raw.serviceGroups),
    industries: ensureStringArray(raw.industries),
    customerName: raw.customerName ?? '',
    phone: raw.phone ?? '',
    customerStatus: raw.customerStatus ?? 'Tiềm năng',
  };
}

function normalizeOpportunity(raw: CrmOpportunityDto): CrmOpportunityDto {
  return {
    ...raw,
    tags: ensureStringArray(raw.tags),
    opportunityTypes: ensureStringArray(raw.opportunityTypes),
    serviceGroups: ensureStringArray(raw.serviceGroups),
    expectedRevenue: toNumber(raw.expectedRevenue),
    items: Array.isArray(raw.items)
      ? raw.items.map((item) =>
          normalizeLineItem(item as Partial<CrmLineItemDto> & Record<string, unknown>)
        )
      : [],
  };
}

function normalizeContract(raw: CrmContractDto): CrmContractDto {
  return {
    ...raw,
    liquidationValue: toNumber(raw.liquidationValue),
    orderValue: toNumber(raw.orderValue),
    collectedAmount: toNumber(raw.collectedAmount),
    actualExpense: toNumber(raw.actualExpense),
    plannedExpense: toNumber(raw.plannedExpense),
    receivableAmount: toNumber(raw.receivableAmount),
    payableAmount: toNumber(raw.payableAmount),
    estimatedProfit: toNumber(raw.estimatedProfit),
    serviceExpense: toNumber(raw.serviceExpense),
    stateFeeExpense: toNumber(raw.stateFeeExpense),
    supportExpense: toNumber(raw.supportExpense),
    uninvoicedAmount: toNumber(raw.uninvoicedAmount),
    revenueStatus: raw.revenueStatus ?? 'Bản nháp',
    executionStatus: raw.executionStatus ?? 'Chưa thực hiện',
    items: Array.isArray(raw.items)
      ? raw.items.map((item) =>
          normalizeLineItem(item as Partial<CrmLineItemDto> & Record<string, unknown>)
        )
      : [],
  };
}

function normalizeContact(raw: Record<string, unknown>): CrmAccountContactDto {
  return {
    id: String(raw.id ?? ''),
    accountId: raw.accountId ? String(raw.accountId) : undefined,
    fullName: String(raw.fullName ?? raw.name ?? raw.contactName ?? ''),
    jobTitle: (raw.jobTitle ?? raw.title ?? raw.position ?? '') as string,
    phone: (raw.phone ?? raw.contactPhone ?? '') as string,
    email: (raw.email ?? raw.contactEmail ?? '') as string,
    birthDate: (raw.birthDate ?? '') as string,
    primary: Boolean(raw.primaryContact ?? raw.primary ?? raw.isPrimary),
    notes: (raw.notes ?? '') as string,
  };
}

export function normalizeFlowType(raw: unknown): CrmCashflowLedgerType {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase();
  if (s === 'THUC_THU') return 'THUC_THU';
  if (s === 'DU_KIEN_CHI') return 'DU_KIEN_CHI';
  if (s === 'THUC_CHI') return 'THUC_CHI';
  if (
    s.includes('DU_KIEN') ||
    s.includes('PLANNED') ||
    s.includes('ESTIMAT') ||
    s.includes('DỰ KIẾN')
  ) {
    return 'DU_KIEN_CHI';
  }
  if (
    s === 'OUT' ||
    s.includes('THUC_CHI') ||
    s.includes('THỰC CHI') ||
    s.includes('EXPENSE') ||
    s.includes('CHI')
  ) {
    return 'THUC_CHI';
  }
  if (
    s === 'IN' ||
    s.includes('THUC_THU') ||
    s.includes('THỰC THU') ||
    s.includes('COLLECT') ||
    s.includes('RECEIPT') ||
    s.includes('THU')
  ) {
    return 'THUC_THU';
  }
  return 'THUC_CHI';
}

export function normalizeCashflow(raw: Record<string, unknown>): CrmContractCashflowDto {
  return {
    id: String(raw.id ?? ''),
    contractId: String(raw.contractId ?? ''),
    flowType: normalizeFlowType(raw.flowType ?? raw.type ?? raw.ledgerType),
    title: String(raw.title ?? raw.description ?? raw.reason ?? ''),
    amount: toNumber(raw.amount),
    transactionDate: String(raw.transactionDate ?? raw.flowDate ?? raw.date ?? ''),
    paymentMethod: (raw.paymentMethod ?? raw.method ?? '') as string,
    expenseCategory: (raw.expenseCategory ?? raw.category ?? raw.costType ?? '') as string,
    referenceCode: (raw.referenceCode ?? raw.voucherNo ?? '') as string,
    notes: (raw.notes ?? raw.note ?? '') as string,
    createdBy: (raw.createdBy ?? null) as string | null,
    createdByName: (raw.createdByName ?? null) as string | null,
    createdAt: (raw.createdAt ?? null) as string | null,
  };
}

function serializeAccountBody(payload: CrmAccountWritePayload): Record<string, unknown> {
  return {
    ...payload,
    relatedUsers: Array.isArray(payload.relatedUsers)
      ? payload.relatedUsers.join(', ')
      : (payload.relatedUsers ?? null),
    contactBirthDate: emptyDateToNull(payload.contactBirthDate),
    foundedDate: emptyDateToNull(payload.foundedDate),
  };
}

export const crmEnterpriseApi = {
  // ----- Danh mục dùng chung -----
  listStaff: async (): Promise<StaffUser[]> => {
    const res = await gatewayClient.get<CrmApiResponse<StaffUser[]>>('/crm/users');
    return res.data.data ?? [];
  },

  listServiceCatalog: async (): Promise<CrmServiceCatalogItem[]> => {
    const res =
      await gatewayClient.get<CrmApiResponse<CrmServiceCatalogItem[]>>('/crm/catalog/services');
    return res.data.data ?? [];
  },

  // ----- 1. KH Liên hệ (/crm/leads) -----
  listLeads: async (filter: CrmLeadFilter): Promise<{ rows: CrmLeadDto[]; meta?: PageMeta }> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmLeadDto[]>>('/crm/leads', {
      params: cleanParams(filter),
    });
    return {
      rows: (res.data.data ?? []).map(normalizeLead),
      meta: res.data.meta,
    };
  },

  getLead: async (id: string): Promise<CrmLeadDto> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmLeadDto>>(`/crm/leads/${id}`);
    return normalizeLead(res.data.data);
  },

  createLead: async (payload: CrmLeadWritePayload): Promise<CrmLeadDto> => {
    const res = await gatewayClient.post<CrmApiResponse<CrmLeadDto>>('/crm/leads', {
      ...payload,
      birthDate: emptyDateToNull(payload.birthDate),
    });
    return normalizeLead(res.data.data);
  },

  updateLead: async (id: string, payload: CrmLeadWritePayload): Promise<CrmLeadDto> => {
    const res = await gatewayClient.put<CrmApiResponse<CrmLeadDto>>(`/crm/leads/${id}`, {
      ...payload,
      birthDate: emptyDateToNull(payload.birthDate),
    });
    return normalizeLead(res.data.data);
  },

  deleteLead: async (id: string): Promise<void> => {
    await gatewayClient.delete(`/crm/leads/${id}`);
  },

  convertLead: async (id: string, body: CrmLeadConvertRequest): Promise<CrmLeadConvertResponse> => {
    const res = await gatewayClient.post<CrmApiResponse<CrmLeadConvertResponse>>(
      `/crm/leads/${id}/convert`,
      body
    );
    return res.data.data;
  },

  importLeads: async (items: Record<string, unknown>[]): Promise<{ imported: number }> => {
    const res = await gatewayClient.post<CrmApiResponse<{ imported: number }>>(
      '/crm/leads/import',
      { items }
    );
    return res.data.data ?? { imported: items.length };
  },

  // ----- 2. Khách hàng (/crm/accounts) -----
  listAccounts: async (
    filter: CrmAccountFilter
  ): Promise<{ rows: CrmAccountDto[]; meta?: PageMeta }> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmAccountDto[]>>('/crm/accounts', {
      params: cleanParams(filter),
    });
    return {
      rows: (res.data.data ?? []).map(normalizeAccount),
      meta: res.data.meta,
    };
  },

  getAccount: async (id: string): Promise<CrmAccountDto> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmAccountDto>>(`/crm/accounts/${id}`);
    return normalizeAccount(res.data.data);
  },

  getAccountOverview: async (id: string): Promise<CrmAccountOverviewDto> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmAccountOverviewDto>>(
      `/crm/accounts/${id}/overview`
    );
    const raw = res.data.data;
    return {
      account: normalizeAccount(raw.account),
      kpis: {
        contractCount: toNumber(raw.kpis?.contractCount),
        totalOrderValue: toNumber(raw.kpis?.totalOrderValue),
        totalCollected: toNumber(raw.kpis?.totalCollected),
        totalReceivable: toNumber(raw.kpis?.totalReceivable),
        opportunityCount: toNumber(raw.kpis?.opportunityCount),
        purchaseCycleDays: toNumber(raw.kpis?.purchaseCycleDays),
      },
      contacts: Array.isArray(raw.contacts)
        ? raw.contacts.map((c) => normalizeContact(c as unknown as Record<string, unknown>))
        : [],
      opportunities: Array.isArray(raw.opportunities)
        ? raw.opportunities.map(normalizeOpportunity)
        : [],
      contracts: Array.isArray(raw.contracts) ? raw.contracts.map(normalizeContract) : [],
    };
  },

  createAccount: async (payload: CrmAccountWritePayload): Promise<CrmAccountDto> => {
    const res = await gatewayClient.post<CrmApiResponse<CrmAccountDto>>(
      '/crm/accounts',
      serializeAccountBody(payload)
    );
    return normalizeAccount(res.data.data);
  },

  updateAccount: async (id: string, payload: CrmAccountWritePayload): Promise<CrmAccountDto> => {
    const res = await gatewayClient.put<CrmApiResponse<CrmAccountDto>>(
      `/crm/accounts/${id}`,
      serializeAccountBody(payload)
    );
    return normalizeAccount(res.data.data);
  },

  deleteAccount: async (id: string): Promise<void> => {
    await gatewayClient.delete(`/crm/accounts/${id}`);
  },

  addAccountContact: async (
    accountId: string,
    contact: Omit<CrmAccountContactDto, 'id'>
  ): Promise<CrmAccountContactDto> => {
    const body = {
      ...contact,
      birthDate: emptyDateToNull(contact.birthDate),
      primaryContact: Boolean(contact.primary),
    };
    const res = await gatewayClient.post<CrmApiResponse<Record<string, unknown>>>(
      `/crm/accounts/${accountId}/contacts`,
      body
    );
    return normalizeContact(res.data.data ?? body);
  },

  deleteAccountContact: async (accountId: string, contactId: string): Promise<void> => {
    await gatewayClient.delete(`/crm/accounts/${accountId}/contacts/${contactId}`);
  },

  importAccounts: async (items: Record<string, unknown>[]): Promise<{ imported: number }> => {
    const res = await gatewayClient.post<CrmApiResponse<{ imported: number }>>(
      '/crm/accounts/import',
      { items }
    );
    return res.data.data ?? { imported: items.length };
  },

  // ----- 3. Cơ hội HĐ (/crm/opportunities) -----
  listOpportunities: async (
    filter: CrmOpportunityFilter
  ): Promise<{ rows: CrmOpportunityDto[]; meta?: PageMeta }> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmOpportunityDto[]>>('/crm/opportunities', {
      params: cleanParams(filter),
    });
    return {
      rows: (res.data.data ?? []).map(normalizeOpportunity),
      meta: res.data.meta,
    };
  },

  getOpportunityKanban: async (params: {
    keyword?: string;
    assignedTo?: string;
    serviceGroup?: string;
  }): Promise<CrmKanbanColumnDto[]> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmKanbanColumnDto[]>>(
      '/crm/opportunities/kanban',
      { params: cleanParams(params) }
    );
    return (res.data.data ?? []).map((col) => ({
      stage: col.stage,
      count: toNumber(col.count),
      totalExpectedRevenue: toNumber(col.totalExpectedRevenue),
      items: Array.isArray(col.items) ? col.items.map(normalizeOpportunity) : [],
    }));
  },

  getOpportunity: async (id: string): Promise<CrmOpportunityDto> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmOpportunityDto>>(
      `/crm/opportunities/${id}`
    );
    return normalizeOpportunity(res.data.data);
  },

  createOpportunity: async (payload: CrmOpportunityWritePayload): Promise<CrmOpportunityDto> => {
    const res = await gatewayClient.post<CrmApiResponse<CrmOpportunityDto>>('/crm/opportunities', {
      ...payload,
      expectedCloseDate: emptyDateToNull(payload.expectedCloseDate),
      items: serializeLineItems(payload.items),
    });
    return normalizeOpportunity(res.data.data);
  },

  updateOpportunity: async (
    id: string,
    payload: CrmOpportunityWritePayload
  ): Promise<CrmOpportunityDto> => {
    const res = await gatewayClient.put<CrmApiResponse<CrmOpportunityDto>>(
      `/crm/opportunities/${id}`,
      {
        ...payload,
        expectedCloseDate: emptyDateToNull(payload.expectedCloseDate),
        items: serializeLineItems(payload.items),
      }
    );
    return normalizeOpportunity(res.data.data);
  },

  updateOpportunityStage: async (id: string, stage: string): Promise<CrmOpportunityDto> => {
    const res = await gatewayClient.put<CrmApiResponse<CrmOpportunityDto>>(
      `/crm/opportunities/${id}/stage`,
      { stage }
    );
    return normalizeOpportunity(res.data.data);
  },

  deleteOpportunity: async (id: string): Promise<void> => {
    await gatewayClient.delete(`/crm/opportunities/${id}`);
  },

  convertOpportunityToContract: async (id: string): Promise<CrmContractDto> => {
    const res = await gatewayClient.post<CrmApiResponse<CrmContractDto>>(
      `/crm/opportunities/${id}/convert-contract`,
      {}
    );
    return normalizeContract(res.data.data);
  },

  importOpportunities: async (items: Record<string, unknown>[]): Promise<{ imported: number }> => {
    const res = await gatewayClient.post<CrmApiResponse<{ imported: number }>>(
      '/crm/opportunities/import',
      { items }
    );
    return res.data.data ?? { imported: items.length };
  },

  // ----- 4. Hợp đồng (/crm/contracts) -----
  listContracts: async (
    filter: CrmContractFilter
  ): Promise<{ rows: CrmContractDto[]; summary: CrmContractSummaryDto; meta?: PageMeta }> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmContractListPayload | CrmContractDto[]>>(
      '/crm/contracts',
      { params: cleanParams(filter) }
    );
    const payload = res.data.data;
    const rawRows = Array.isArray(payload) ? payload : (payload?.rows ?? []);
    const rows = rawRows.map(normalizeContract);
    const rawSummary = !Array.isArray(payload) ? payload?.summary : undefined;
    const summary: CrmContractSummaryDto = {
      totalRecords: rawSummary?.totalRecords ?? res.data.meta?.totalElements ?? rows.length,
      totalOrderValue: rawSummary?.totalOrderValue ?? rows.reduce((s, r) => s + r.orderValue, 0),
      totalCollected: rawSummary?.totalCollected ?? rows.reduce((s, r) => s + r.collectedAmount, 0),
      totalReceivable:
        rawSummary?.totalReceivable ?? rows.reduce((s, r) => s + r.receivableAmount, 0),
      totalEstimatedProfit:
        rawSummary?.totalEstimatedProfit ?? rows.reduce((s, r) => s + r.estimatedProfit, 0),
    };
    return {
      rows,
      summary,
      meta: res.data.meta,
    };
  },

  getContract: async (id: string): Promise<CrmContractDto> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmContractDto>>(`/crm/contracts/${id}`);
    return normalizeContract(res.data.data);
  },

  createContract: async (payload: CrmContractWritePayload): Promise<CrmContractDto> => {
    const res = await gatewayClient.post<CrmApiResponse<CrmContractDto>>('/crm/contracts', {
      ...payload,
      bookingDate: emptyDateToNull(payload.bookingDate),
      paymentDate: emptyDateToNull(payload.paymentDate),
      submissionDate: emptyDateToNull(payload.submissionDate),
      handoverDeadline: emptyDateToNull(payload.handoverDeadline),
      orderDate: emptyDateToNull(payload.orderDate),
      productionDeadline: emptyDateToNull(payload.productionDeadline),
      items: serializeLineItems(payload.items),
    });
    return normalizeContract(res.data.data);
  },

  updateContract: async (id: string, payload: CrmContractWritePayload): Promise<CrmContractDto> => {
    const res = await gatewayClient.put<CrmApiResponse<CrmContractDto>>(`/crm/contracts/${id}`, {
      ...payload,
      bookingDate: emptyDateToNull(payload.bookingDate),
      paymentDate: emptyDateToNull(payload.paymentDate),
      submissionDate: emptyDateToNull(payload.submissionDate),
      handoverDeadline: emptyDateToNull(payload.handoverDeadline),
      orderDate: emptyDateToNull(payload.orderDate),
      productionDeadline: emptyDateToNull(payload.productionDeadline),
      items: serializeLineItems(payload.items),
    });
    return normalizeContract(res.data.data);
  },

  updateContractRevenueStatus: async (
    id: string,
    revenueStatus: string
  ): Promise<CrmContractDto> => {
    const res = await gatewayClient.put<CrmApiResponse<CrmContractDto>>(
      `/crm/contracts/${id}/revenue-status`,
      { revenueStatus }
    );
    return normalizeContract(res.data.data);
  },

  deleteContract: async (id: string): Promise<void> => {
    await gatewayClient.delete(`/crm/contracts/${id}`);
  },

  listContractCashflows: async (contractId: string): Promise<CrmContractCashflowDto[]> => {
    const res = await gatewayClient.get<CrmApiResponse<Record<string, unknown>[]>>(
      `/crm/contracts/${contractId}/cashflows`
    );
    return (res.data.data ?? []).map(normalizeCashflow);
  },

  createContractCashflow: async (
    contractId: string,
    payload: CrmContractCashflowWritePayload
  ): Promise<CrmContractCashflowDto> => {
    const combinedDesc = payload.notes?.trim()
      ? `${payload.title.trim()} — ${payload.notes.trim()}`
      : payload.title.trim();
    const body = {
      ...payload,
      type: payload.flowType,
      category: payload.expenseCategory || null,
      description: combinedDesc,
      note: payload.notes || null,
      transactionDate: emptyDateToNull(payload.transactionDate),
    };
    const res = await gatewayClient.post<CrmApiResponse<Record<string, unknown>>>(
      `/crm/contracts/${contractId}/cashflows`,
      body
    );
    return normalizeCashflow(res.data.data ?? body);
  },

  deleteContractCashflow: async (contractId: string, cashflowId: string): Promise<void> => {
    await gatewayClient.delete(`/crm/contracts/${contractId}/cashflows/${cashflowId}`);
  },

  importContracts: async (items: Record<string, unknown>[]): Promise<{ imported: number }> => {
    const res = await gatewayClient.post<CrmApiResponse<{ imported: number }>>(
      '/crm/contracts/import',
      { items }
    );
    return res.data.data ?? { imported: items.length };
  },

  // ----- 5. Hoạt động dùng chung (/crm/activities) -----
  listActivities: async (
    entityType: CrmEntityType,
    entityId: string
  ): Promise<CrmActivityDto[]> => {
    const res = await gatewayClient.get<CrmApiResponse<CrmActivityDto[]>>('/crm/activities', {
      params: { entityType, entityId },
    });
    return res.data.data ?? [];
  },

  createActivity: async (payload: CrmActivityWritePayload): Promise<CrmActivityDto> => {
    const res = await gatewayClient.post<CrmApiResponse<CrmActivityDto>>(
      '/crm/activities',
      payload
    );
    return res.data.data;
  },

  toggleActivityComplete: async (id: string): Promise<CrmActivityDto> => {
    const res = await gatewayClient.put<CrmApiResponse<CrmActivityDto>>(
      `/crm/activities/${id}/toggle-complete`,
      {}
    );
    return res.data.data;
  },

  deleteActivity: async (id: string): Promise<void> => {
    await gatewayClient.delete(`/crm/activities/${id}`);
  },
};

export default crmEnterpriseApi;

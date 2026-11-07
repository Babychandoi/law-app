import {
  DocumentTemplate,
  DocumentTemplateField,
  GeneratedDocument,
} from '../../types/documentTemplate';
import { CaseDetail, MatterParty, MatterPartyPii } from '../../types/crm';

export type TemplateSort = 'updated-desc' | 'name-asc' | 'name-desc' | 'version-desc';
export type GeneratedSort = 'created-desc' | 'created-asc' | 'name-asc' | 'name-desc';

export interface FieldValidationIssue {
  index: number;
  property: keyof DocumentTemplateField;
  message: string;
}

export function searchText(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLocaleLowerCase('vi-VN')
    .trim();
}

export function filterAndSortTemplates(
  templates: DocumentTemplate[],
  query: string,
  status: DocumentTemplate['status'] | 'ALL',
  sort: TemplateSort
): DocumentTemplate[] {
  const needle = searchText(query);
  return [...templates]
    .filter((template) => {
      if (status !== 'ALL' && template.status !== status) return false;
      if (!needle) return true;
      return searchText(
        [
          template.name,
          template.description,
          template.serviceName,
          ...(template.tags ?? []),
          template.originalFileName,
        ].join(' ')
      ).includes(needle);
    })
    .sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name, 'vi');
      if (sort === 'name-desc') return b.name.localeCompare(a.name, 'vi');
      if (sort === 'version-desc') return b.version - a.version;
      return dateValue(b.updatedAt ?? b.createdAt) - dateValue(a.updatedAt ?? a.createdAt);
    });
}

export function filterAndSortGeneratedDocuments(
  documents: GeneratedDocument[],
  query: string,
  sort: GeneratedSort
): GeneratedDocument[] {
  const needle = searchText(query);
  return [...documents]
    .filter((document) => {
      if (!needle) return true;
      return searchText(
        [
          document.fileName,
          document.templateName,
          document.serviceName ?? document.context?.serviceName,
          document.matterReference ?? document.context?.matterReference,
          document.dossierId ?? document.context?.dossierId,
          document.status,
        ].join(' ')
      ).includes(needle);
    })
    .sort((a, b) => {
      if (sort === 'name-asc') return a.fileName.localeCompare(b.fileName, 'vi');
      if (sort === 'name-desc') return b.fileName.localeCompare(a.fileName, 'vi');
      if (sort === 'created-asc') return dateValue(a.createdAt) - dateValue(b.createdAt);
      return dateValue(b.createdAt) - dateValue(a.createdAt);
    });
}

export function paginate<T>(items: T[], page: number, size: number): T[] {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, size);
  return items.slice((safePage - 1) * safeSize, safePage * safeSize);
}

export function validateTemplateFields(fields: DocumentTemplateField[]): FieldValidationIssue[] {
  const issues: FieldValidationIssue[] = [];
  const keyCounts = fields.reduce<Record<string, number>>((counts, field) => {
    const key = field.fieldKey.trim().toLocaleLowerCase();
    if (key) counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  fields.forEach((field, index) => {
    const key = field.fieldKey.trim();
    if (!key) {
      issues.push({ index, property: 'fieldKey', message: 'Key không được để trống.' });
    } else if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key)) {
      issues.push({
        index,
        property: 'fieldKey',
        message: 'Key phải bắt đầu bằng chữ và chỉ gồm chữ, số hoặc dấu gạch dưới.',
      });
    } else if (keyCounts[key.toLocaleLowerCase()] > 1) {
      issues.push({ index, property: 'fieldKey', message: 'Key đang bị trùng.' });
    }
    if (!field.label.trim()) {
      issues.push({ index, property: 'label', message: 'Nhãn hiển thị không được để trống.' });
    }
    if (!Number.isInteger(field.sortOrder) || field.sortOrder < 1) {
      issues.push({ index, property: 'sortOrder', message: 'Thứ tự phải là số nguyên từ 1.' });
    }
    if (field.maxLength !== undefined && field.maxLength < 1) {
      issues.push({ index, property: 'maxLength', message: 'Độ dài tối đa phải lớn hơn 0.' });
    }
    if (
      field.minimum !== undefined &&
      field.maximum !== undefined &&
      field.minimum > field.maximum
    ) {
      issues.push({
        index,
        property: 'minimum',
        message: 'Giá trị nhỏ nhất không được lớn hơn giá trị lớn nhất.',
      });
    }
    if (field.validationPattern) {
      try {
        new RegExp(field.validationPattern);
      } catch {
        issues.push({
          index,
          property: 'validationPattern',
          message: 'Biểu thức kiểm tra không hợp lệ.',
        });
      }
    }
    if (
      (field.options?.length ?? 0) > 500 ||
      field.options?.some((option) => option.length > 500)
    ) {
      issues.push({
        index,
        property: 'options',
        message: 'Danh sách tối đa 500 lựa chọn; mỗi lựa chọn tối đa 500 ký tự.',
      });
    }
  });

  if (fields.length === 0) {
    issues.push({
      index: -1,
      property: 'fieldKey',
      message: 'Mẫu phải có ít nhất một trường trước khi xuất bản.',
    });
  }
  return issues;
}

export function validateGeneratedValue(
  field: DocumentTemplateField,
  rawValue: string
): string | null {
  const value = rawValue.trim();
  if (field.required && !value) return `${field.label || field.fieldKey} là trường bắt buộc.`;
  if (!value) return null;
  if (field.maxLength !== undefined && value.length > field.maxLength) {
    return `${field.label || field.fieldKey} không được vượt quá ${field.maxLength} ký tự.`;
  }
  if (field.inputType === 'NUMBER') {
    const number = Number(value);
    if (!Number.isFinite(number)) return `${field.label || field.fieldKey} phải là một số hợp lệ.`;
    if (field.minimum !== undefined && number < field.minimum) {
      return `${field.label || field.fieldKey} phải từ ${field.minimum} trở lên.`;
    }
    if (field.maximum !== undefined && number > field.maximum) {
      return `${field.label || field.fieldKey} không được lớn hơn ${field.maximum}.`;
    }
  }
  if (field.inputType === 'DATE' && Number.isNaN(Date.parse(value))) {
    return `${field.label || field.fieldKey} phải là một ngày hợp lệ.`;
  }
  if (field.options?.length && !field.options.includes(value)) {
    return `${field.label || field.fieldKey} không thuộc danh sách giá trị được phép.`;
  }
  if (field.validationPattern) {
    try {
      if (!new RegExp(field.validationPattern).test(value)) {
        return `${field.label || field.fieldKey} chưa đúng định dạng yêu cầu.`;
      }
    } catch {
      return `${field.label || field.fieldKey} có quy tắc kiểm tra không hợp lệ.`;
    }
  }
  return null;
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `document-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function buildCrmPrefill(
  caseDetail?: CaseDetail,
  parties: MatterParty[] = []
): Record<string, string> {
  const values: Record<string, string> = {};
  const add = (value: string | null | undefined, ...aliases: string[]) => {
    if (value === null || value === undefined || value === '') return;
    aliases.forEach((alias) => {
      values[alias.toLocaleLowerCase()] = String(value);
    });
  };

  if (caseDetail) {
    add(caseDetail.id, 'crmCaseId', 'caseId', 'matterReference', 'caseReference');
    add(caseDetail.customerId, 'customerId');
    add(caseDetail.customerEmail, 'customerEmail');
    add(caseDetail.customerPhone, 'customerPhone');
    add(caseDetail.serviceId, 'serviceId');
    add(caseDetail.serviceName, 'serviceName');
    add(caseDetail.name, 'caseName', 'matterName');
    add(caseDetail.description, 'caseDescription', 'matterDescription');
    add(caseDetail.status, 'caseStatus', 'matterStatus');
    add(caseDetail.assignedUserId, 'assignedUserId', 'responsibleUserId');
    add(caseDetail.caseCreatedAt, 'caseCreatedAt');
  }

  const activeParties = parties.filter((party) => !party.archived && party.pii);
  activeParties.forEach((party) => {
    const prefix = party.role.toLocaleLowerCase();
    addParty(values, party.pii, prefix);
  });

  const primary =
    activeParties.find((party) => party.role === 'CLIENT') ??
    activeParties.find((party) => party.role === 'APPLICANT') ??
    activeParties.find((party) => party.role === 'OWNER') ??
    activeParties[0];
  if (primary) addParty(values, primary.pii, 'customer', true);

  return values;
}

function addParty(
  values: Record<string, string>,
  pii: MatterPartyPii,
  prefix: string,
  includeLegalAliases = false
) {
  const add = (value: string | undefined, ...keys: string[]) => {
    if (!value) return;
    keys.forEach((key) => {
      values[key.toLocaleLowerCase()] = value;
    });
  };
  const address = pii.address
    ? [
        pii.address.line1,
        pii.address.line2,
        pii.address.locality,
        pii.address.administrativeArea,
        pii.address.postalCode,
        pii.address.countryCode,
      ]
        .filter(Boolean)
        .join(', ')
    : undefined;
  add(pii.displayName, `${prefix}Name`);
  add(pii.legalName, `${prefix}LegalName`);
  add(pii.givenName, `${prefix}GivenName`);
  add(pii.middleName, `${prefix}MiddleName`);
  add(pii.familyName, `${prefix}FamilyName`);
  add(pii.email, `${prefix}Email`);
  add(pii.phone, `${prefix}Phone`);
  add(pii.dateOfBirth, `${prefix}DateOfBirth`);
  add(pii.nationalityCountryCode, `${prefix}NationalityCountryCode`);
  add(pii.identityDocumentType, `${prefix}IdentityDocumentType`);
  add(pii.identityDocumentNumber, `${prefix}IdentityDocumentNumber`);
  add(pii.identityIssuingCountryCode, `${prefix}IdentityIssuingCountryCode`);
  add(pii.identityDocumentExpiresOn, `${prefix}IdentityDocumentExpiresOn`);
  add(pii.taxIdentifier, `${prefix}TaxIdentifier`);
  add(pii.registrationNumber, `${prefix}RegistrationNumber`);
  add(address, `${prefix}Address`);
  if (includeLegalAliases) {
    add(pii.displayName, 'customerName', 'partyName');
    add(pii.legalName, 'customerLegalName', 'legalName');
    add(pii.taxIdentifier, 'customerTaxIdentifier', 'taxIdentifier', 'taxCode');
    add(pii.registrationNumber, 'customerRegistrationNumber', 'registrationNumber');
    add(pii.identityDocumentNumber, 'customerIdentityDocumentNumber');
    add(address, 'customerAddress');
  }
}

function dateValue(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

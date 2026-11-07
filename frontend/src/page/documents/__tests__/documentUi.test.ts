import {
  buildCrmPrefill,
  filterAndSortGeneratedDocuments,
  filterAndSortTemplates,
  paginate,
  validateGeneratedValue,
  validateTemplateFields,
} from '../documentUi';
import { DocumentTemplate, GeneratedDocument } from '../../../types/documentTemplate';

const template = (patch: Partial<DocumentTemplate>): DocumentTemplate => ({
  id: 'template-1',
  name: 'Hợp đồng dịch vụ',
  status: 'ACTIVE',
  version: 1,
  fileSize: 100,
  fields: [],
  ...patch,
});

describe('documentUi', () => {
  it('tìm biểu mẫu không phụ thuộc dấu tiếng Việt và lọc trạng thái', () => {
    const result = filterAndSortTemplates(
      [
        template({ id: 'a', name: 'Hợp đồng chuyển nhượng', status: 'ACTIVE' }),
        template({ id: 'b', name: 'Tờ khai', status: 'DRAFT' }),
      ],
      'hop dong',
      'ACTIVE',
      'name-asc'
    );
    expect(result.map((item) => item.id)).toEqual(['a']);
  });

  it('phát hiện key trùng, label trống và quy tắc RegExp lỗi', () => {
    const issues = validateTemplateFields([
      {
        fieldKey: 'customerName',
        label: '',
        inputType: 'TEXT',
        required: true,
        sortOrder: 1,
        validationPattern: '[',
      },
      {
        fieldKey: 'customerName',
        label: 'Khách hàng',
        inputType: 'TEXT',
        required: true,
        sortOrder: 2,
      },
    ]);
    expect(issues.some((issue) => issue.message.includes('trùng'))).toBe(true);
    expect(issues.some((issue) => issue.property === 'label')).toBe(true);
    expect(issues.some((issue) => issue.property === 'validationPattern')).toBe(true);
  });

  it('kiểm tra giới hạn số và độ dài dữ liệu trước khi sinh file', () => {
    expect(
      validateGeneratedValue(
        {
          fieldKey: 'fee',
          label: 'Phí dịch vụ',
          inputType: 'NUMBER',
          required: true,
          sortOrder: 1,
          minimum: 100,
          maximum: 200,
        },
        '50'
      )
    ).toContain('100');
    expect(
      validateGeneratedValue(
        {
          fieldKey: 'taxCode',
          label: 'Mã số thuế',
          inputType: 'TEXT',
          required: true,
          sortOrder: 2,
          maxLength: 3,
        },
        '1234'
      )
    ).toContain('3 ký tự');
  });

  it('tìm lịch sử theo context lồng và phân trang an toàn', () => {
    const documents: GeneratedDocument[] = [
      {
        id: 'doc-a',
        templateId: 'template-1',
        templateName: 'Hợp đồng',
        templateVersion: 1,
        fileName: 'hop-dong.docx',
        downloadUrl: '/download/a',
        context: { matterReference: 'HS-2026-01' },
        createdAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'doc-b',
        templateId: 'template-1',
        templateName: 'Tờ khai',
        templateVersion: 1,
        fileName: 'to-khai.docx',
        downloadUrl: '/download/b',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];
    expect(
      filterAndSortGeneratedDocuments(documents, 'HS-2026-01', 'created-desc').map(
        (document) => document.id
      )
    ).toEqual(['doc-a']);
    expect(paginate(documents, 2, 1).map((document) => document.id)).toEqual(['doc-b']);
  });

  it('chuẩn hóa dữ liệu CRM và bên liên quan thành key biểu mẫu pháp lý', () => {
    const values = buildCrmPrefill(
      {
        id: 'CASE-01',
        customerId: 'CUSTOMER-01',
        customerEmail: 'case@example.com',
        customerPhone: '0900000000',
        serviceId: 'SERVICE-01',
        serviceName: 'Đăng ký nhãn hiệu',
        name: 'Nhãn hiệu POIP',
        description: null,
        status: 'PROCESSING',
        assignedUserId: 'staff-1',
        careStatusId: null,
        tagIds: [],
        caseCreatedAt: '2026-01-01',
        caseUpdatedAt: null,
        syncedAt: null,
      },
      [
        {
          id: 'party-1',
          caseId: 'CASE-01',
          role: 'APPLICANT',
          type: 'ORGANIZATION',
          revision: 1,
          archived: false,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
          pii: {
            displayName: 'Công ty POIP',
            legalName: 'Công ty TNHH POIP',
            taxIdentifier: '0101234567',
            address: {
              line1: '123 Nguyễn Huệ',
              locality: 'Quận 1',
              countryCode: 'VN',
            },
          },
        },
      ]
    );
    expect(values.crmcaseid).toBe('CASE-01');
    expect(values.applicantname).toBe('Công ty POIP');
    expect(values.customerlegalname).toBe('Công ty TNHH POIP');
    expect(values.taxcode).toBe('0101234567');
    expect(values.customeraddress).toContain('123 Nguyễn Huệ');
  });
});

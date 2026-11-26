import { normalizeCashflow, normalizeFlowType } from '../api';
import {
  CRM_LEAD_SOURCES,
  EXECUTION_STATUSES,
  LEAD_CUSTOMER_STATUSES,
  OPPORTUNITY_STAGES,
  REVENUE_STATUSES,
  VAT_RATES,
} from '../constants';
import {
  buildCsvContent,
  calculateLineItem,
  calculateLineItemsTotal,
  formatDateVi,
  formatStaffActor,
  formatVnd,
  parseTabularPaste,
  toDateInputValue,
} from '../formatters';

describe('CRM formatters, line-item math, and tabular import parser', () => {
  test('formatVnd formats large, zero, and negative Vietnamese currency values cleanly', () => {
    expect(formatVnd(1829414305)).toBe('1.829.414.305');
    expect(formatVnd(2400000, true)).toBe('2.400.000 đ');
    expect(formatVnd(-2400000)).toBe('-2.400.000');
    expect(formatVnd(0)).toBe('0');
    expect(formatVnd(null, true)).toBe('0 đ');
  });

  test('formatDateVi and toDateInputValue convert between ISO and DD/MM/YYYY', () => {
    expect(formatDateVi('2026-11-25')).toBe('25/11/2026');
    expect(formatDateVi('25/11/2026')).toBe('25/11/2026');
    expect(formatDateVi(null)).toBe('—');
    expect(toDateInputValue('25/11/2026')).toBe('2026-11-25');
    expect(toDateInputValue('2026-11-25T08:00:00Z')).toBe('2026-11-25');
  });

  test('calculateLineItem computes discount, VAT (8%, 10%, KCT), and grand total accurately', () => {
    const vat8 = calculateLineItem({
      quantity: 2,
      unitPrice: 5000000,
      discountRate: 10,
      vatRate: '8%',
    });
    expect(vat8.amount).toBe(10000000);
    expect(vat8.discountAmount).toBe(1000000);
    expect(vat8.vatAmount).toBe(720000);
    expect(vat8.totalAmount).toBe(9720000);

    const kct = calculateLineItem({
      quantity: 1,
      unitPrice: 1200000,
      discountRate: 0,
      vatRate: 'KCT',
    });
    expect(kct.vatAmount).toBe(0);
    expect(kct.totalAmount).toBe(1200000);
  });

  test('calculateLineItemsTotal aggregates multiple service rows', () => {
    const totals = calculateLineItemsTotal([
      { quantity: 2, unitPrice: 3000000, discountRate: 0, vatRate: '8%' },
      { quantity: 1, unitPrice: 2000000, discountRate: 5, vatRate: '10%' },
    ]);
    expect(totals.totalQuantity).toBe(3);
    expect(totals.subTotalAmount).toBe(8000000);
    expect(totals.totalDiscountAmount).toBe(100000);
    // Row 1 VAT: 6,000,000 * 8% = 480,000; Row 2 VAT: 1,900,000 * 10% = 190,000
    expect(totals.totalVatAmount).toBe(670000);
    expect(totals.grandTotal).toBe(8570000);
  });

  test('parseTabularPaste parses Excel TSV paste and quoted CSV rows', () => {
    const tsv = [
      'Họ và tên\tĐiện thoại\tTổ chức',
      'Nguyễn Văn A\t0909111222\tCông ty TNHH Sao Mai',
      'Trần Thị B\t0912333444\tCông ty CP Ánh Dương',
    ].join('\r\n');

    const parsedTsv = parseTabularPaste(tsv);
    expect(parsedTsv.headers).toEqual(['Họ và tên', 'Điện thoại', 'Tổ chức']);
    expect(parsedTsv.rows).toHaveLength(2);
    expect(parsedTsv.rows[0]['Điện thoại']).toBe('0909111222');

    const csv = '\uFEFFSố Hợp đồng,Khách hàng,Hàng hóa\nPD001,"Công ty A, B","Nhãn hiệu ""Poip"""';
    const parsedCsv = parseTabularPaste(csv);
    expect(parsedCsv.rows).toHaveLength(1);
    expect(parsedCsv.rows[0]['Khách hàng']).toBe('Công ty A, B');
    expect(parsedCsv.rows[0]['Hàng hóa']).toBe('Nhãn hiệu "Poip"');
  });

  test('buildCsvContent prepends UTF-8 BOM and escapes special characters', () => {
    const csv = buildCsvContent(
      [
        { header: 'Mã', accessor: (r) => r.code },
        { header: 'Tên', accessor: (r) => r.name },
      ],
      [{ code: 'PD01', name: 'Công ty TNHH A, B' }]
    );
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Công ty TNHH A, B"');
  });

  test('MISA CRM constants match exact module specifications', () => {
    expect(LEAD_CUSTOMER_STATUSES).toHaveLength(6);
    expect(OPPORTUNITY_STAGES).toHaveLength(7);
    expect(EXECUTION_STATUSES).toHaveLength(5);
    expect(REVENUE_STATUSES).toEqual(['Bản nháp', 'Đề nghị ghi', 'Đã ghi']);
    expect(VAT_RATES).toEqual(['0%', '5%', '8%', '10%', 'KCT']);
  });

  test('normalizeFlowType and normalizeCashflow distinguish THUC_THU, DU_KIEN_CHI, and THUC_CHI accurately', () => {
    expect(normalizeFlowType('THUC_THU')).toBe('THUC_THU');
    expect(normalizeFlowType('DU_KIEN_CHI')).toBe('DU_KIEN_CHI');
    expect(normalizeFlowType('THUC_CHI')).toBe('THUC_CHI');

    const thucChi = normalizeCashflow({
      id: 'cf-1',
      contractId: 'c-1',
      type: 'THUC_CHI',
      category: 'Chi nhà nước',
      description: 'Nộp lệ phí Cục SHTT',
      amount: 1000000,
      transactionDate: '2026-11-25',
      paymentMethod: 'Chuyển khoản',
    });
    expect(thucChi.flowType).toBe('THUC_CHI');
    expect(thucChi.title).toBe('Nộp lệ phí Cục SHTT');
    expect(thucChi.expenseCategory).toBe('Chi nhà nước');
  });

  test('CRM_LEAD_SOURCES uses canonical 6/ Website and formatStaffActor resolves UUIDs cleanly', () => {
    expect(CRM_LEAD_SOURCES).toContain('6/ Website');
    const staff = [
      { id: '6db21baf-57cb-4ab0-8d07-c861f21f24df', username: 'adminToTo', fullName: null },
      { id: 'u-2', username: 'ma2002nd', fullName: 'Trần Thị Kiều Oanh' },
    ];
    expect(formatStaffActor('6db21baf-57cb-4ab0-8d07-c861f21f24df', staff)).toBe('adminToTo');
    expect(formatStaffActor('u-2', staff)).toBe('Trần Thị Kiều Oanh');
    expect(formatStaffActor('00000000-0000-0000-0000-000000000000', staff)).toBe('Chuyên viên');
    expect(formatStaffActor('system', staff)).toBe('Hệ thống');
  });
});

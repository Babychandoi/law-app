export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  discountAmount?: number;
  vatRate?: string;
}

export interface LineItemComputed {
  quantity: number;
  unitPrice: number;
  amount: number;
  discountRate: number;
  discountAmount: number;
  vatRate: string;
  vatAmount: number;
  totalAmount: number;
}

export interface LineItemsTotals {
  totalQuantity: number;
  subTotalAmount: number;
  totalDiscountAmount: number;
  totalVatAmount: number;
  grandTotal: number;
}

/**
 * Định dạng tiền tệ VNĐ chuẩn kế toán Việt Nam (ví dụ: 1.829.414.305 hoặc -2.400.000).
 */
export function formatVnd(value: number | string | null | undefined, withSuffix = false): string {
  if (value === null || value === undefined || value === '') {
    return withSuffix ? '0 đ' : '0';
  }
  const num = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(num)) {
    return withSuffix ? '0 đ' : '0';
  }
  const rounded = Math.round(num);
  const absFormatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = rounded < 0 ? '-' : '';
  return withSuffix ? `${sign}${absFormatted} đ` : `${sign}${absFormatted}`;
}

/**
 * Chuyển chuỗi nhập tiền tệ sang số nguyên.
 */
export function parseVndInput(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : 0;
  }
  if (!raw) return 0;
  const cleaned = String(raw).replace(/[^\d-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Định dạng ngày Việt Nam DD/MM/YYYY.
 */
export function formatDateVi(value: string | Date | null | undefined): string {
  if (!value) return '—';
  if (typeof value === 'string') {
    const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (isoDateOnly) {
      return `${isoDateOnly[3]}/${isoDateOnly[2]}/${isoDateOnly[1]}`;
    }
    const alreadyVi = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
    if (alreadyVi) {
      return value.trim();
    }
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Định dạng ngày giờ Việt Nam DD/MM/YYYY HH:mm.
 */
export function formatDateTimeVi(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return formatDateVi(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Chuẩn hóa chuỗi ngày về YYYY-MM-DD cho thẻ <input type="date" />.
 */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  const isoPrefix = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
  if (isoPrefix) return isoPrefix[1];
  const viMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (viMatch) {
    const dd = viMatch[1].padStart(2, '0');
    const mm = viMatch[2].padStart(2, '0');
    return `${viMatch[3]}-${mm}-${dd}`;
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Trích tỷ lệ thuế GTGT từ nhãn ('0%', '5%', '8%', '10%', 'KCT').
 */
export function parseVatRatePercent(vatRate?: string | null): number {
  if (!vatRate) return 0;
  const normalized = vatRate.trim().toUpperCase();
  if (normalized === 'KCT' || normalized === 'KKKNT') return 0;
  const num = parseFloat(normalized.replace('%', ''));
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

/**
 * Tính toán một dòng hàng hóa/dịch vụ chuẩn MISA AMIS CRM:
 * - Thành tiền = Số lượng * Đơn giá
 * - Tiền chiết khấu = Thành tiền * (Tỷ lệ CK / 100) (hoặc giữ discountAmount nếu nhập trực tiếp khi discountRate = 0)
 * - Giá trị tính thuế = max(0, Thành tiền - Tiền chiết khấu)
 * - Tiền thuế = Giá trị tính thuế * (Thuế suất / 100)
 * - Tổng tiền = Giá trị tính thuế + Tiền thuế
 */
export function calculateLineItem(input: LineItemInput): LineItemComputed {
  const quantity = Number.isFinite(input.quantity) && input.quantity >= 0 ? input.quantity : 0;
  const unitPrice = Number.isFinite(input.unitPrice) && input.unitPrice >= 0 ? input.unitPrice : 0;
  const amount = Math.round(quantity * unitPrice);

  const rawRate = Number.isFinite(input.discountRate) ? Number(input.discountRate) : 0;
  const discountRate = Math.min(100, Math.max(0, rawRate));

  let discountAmount = 0;
  if (discountRate > 0) {
    discountAmount = Math.round((amount * discountRate) / 100);
  } else if (
    input.discountAmount !== undefined &&
    Number.isFinite(input.discountAmount) &&
    input.discountAmount > 0
  ) {
    discountAmount = Math.min(amount, Math.round(input.discountAmount));
  }

  const taxableBase = Math.max(0, amount - discountAmount);
  const vatRate = input.vatRate && input.vatRate.trim() ? input.vatRate.trim() : '0%';
  const vatPercent = parseVatRatePercent(vatRate);
  const vatAmount = Math.round((taxableBase * vatPercent) / 100);
  const totalAmount = taxableBase + vatAmount;

  return {
    quantity,
    unitPrice,
    amount,
    discountRate,
    discountAmount,
    vatRate,
    vatAmount,
    totalAmount,
  };
}

/**
 * Tính dòng Tổng cộng của toàn bộ bảng hàng hóa/dịch vụ.
 */
export function calculateLineItemsTotal(items: LineItemInput[]): LineItemsTotals {
  return items.reduce<LineItemsTotals>(
    (acc, item) => {
      const computed = calculateLineItem(item);
      return {
        totalQuantity: acc.totalQuantity + computed.quantity,
        subTotalAmount: acc.subTotalAmount + computed.amount,
        totalDiscountAmount: acc.totalDiscountAmount + computed.discountAmount,
        totalVatAmount: acc.totalVatAmount + computed.vatAmount,
        grandTotal: acc.grandTotal + computed.totalAmount,
      };
    },
    {
      totalQuantity: 0,
      subTotalAmount: 0,
      totalDiscountAmount: 0,
      totalVatAmount: 0,
      grandTotal: 0,
    }
  );
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

/**
 * Phân tích nội dung dán từ Excel/Google Sheets (TSV) hoặc tệp CSV thành headers + rows.
 */
export function parseTabularPaste(rawText: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  if (!rawText || !rawText.trim()) {
    return { headers: [], rows: [] };
  }

  const normalized = rawText
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  const nonEmptyLines = normalized
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  if (nonEmptyLines.length === 0) {
    return { headers: [], rows: [] };
  }

  const firstLine = nonEmptyLines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.split(';').length > firstLine.split(',').length && firstLine.includes(';')) {
    delimiter = ';';
  }

  const rawHeaders = splitDelimitedLine(firstLine, delimiter);
  const headers = rawHeaders.map((h, idx) => (h ? h : `Cot_${idx + 1}`));

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < nonEmptyLines.length; r += 1) {
    const values = splitDelimitedLine(nonEmptyLines[r], delimiter);
    const hasAnyValue = values.some((v) => v.length > 0);
    if (!hasAnyValue) continue;
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(record);
  }

  return { headers, rows };
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = Array.isArray(value) ? value.join('; ') : String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Xuất mảng dữ liệu ra nội dung CSV (kèm UTF-8 BOM để mở trực tiếp tiếng Việt trên Excel)
 * và kích hoạt tải xuống nếu đang ở môi trường trình duyệt.
 */
export function buildCsvContent<T>(
  columns: { header: string; accessor: (row: T) => unknown }[],
  rows: T[]
): string {
  const headerLine = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const bodyLines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(col.accessor(row))).join(',')
  );
  return `\uFEFF${[headerLine, ...bodyLines].join('\r\n')}`;
}

export function exportRowsToCsv<T>(
  filename: string,
  columns: { header: string; accessor: (row: T) => unknown }[],
  rows: T[]
): string {
  const content = buildCsvContent(columns, rows);
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
  return content;
}

const UUID_ACTOR_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatStaffActor(
  rawActor: string | null | undefined,
  staffList?: { id: string; username?: string | null; fullName?: string | null }[],
  fallback = 'Chuyên viên'
): string {
  if (!rawActor || !rawActor.trim()) return fallback;
  const trimmed = rawActor.trim();
  if (trimmed.toLowerCase() === 'system') return 'Hệ thống';
  const matched = staffList?.find((u) => u.id === trimmed || u.username === trimmed);
  if (matched) {
    return matched.fullName || matched.username || fallback;
  }
  if (UUID_ACTOR_RE.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

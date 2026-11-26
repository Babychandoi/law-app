import React, { useEffect, useState } from 'react';
import { PackagePlus, Plus, Trash2 } from 'lucide-react';
import crmEnterpriseApi from './api';
import { VAT_RATES } from './constants';
import { calculateLineItem, calculateLineItemsTotal, formatVnd } from './formatters';
import type { CrmLineItemDto, CrmServiceCatalogItem } from './types';

export interface CrmLineItemsEditorProps {
  items: CrmLineItemDto[];
  onChange?: (nextItems: CrmLineItemDto[]) => void;
  readOnly?: boolean;
}

export function createEmptyLineItem(): CrmLineItemDto {
  return {
    serviceCode: '',
    code: '',
    description: '',
    name: '',
    unit: 'Gói',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    discountRate: 0,
    discountAmount: 0,
    vatRate: '8%',
    taxRate: '8%',
    vatAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
  };
}

export default function CrmLineItemsEditor({
  items,
  onChange,
  readOnly = false,
}: CrmLineItemsEditorProps) {
  const [catalog, setCatalog] = useState<CrmServiceCatalogItem[]>([]);
  const [selectedCatalogCode, setSelectedCatalogCode] = useState('');

  useEffect(() => {
    if (readOnly) return;
    let active = true;
    crmEnterpriseApi
      .listServiceCatalog()
      .then((res) => {
        if (active) setCatalog(res);
      })
      .catch(() => {
        if (active) setCatalog([]);
      });
    return () => {
      active = false;
    };
  }, [readOnly]);

  const recomputeRow = (draft: CrmLineItemDto): CrmLineItemDto => {
    const computed = calculateLineItem({
      quantity: draft.quantity,
      unitPrice: draft.unitPrice,
      discountRate: draft.discountRate,
      discountAmount: draft.discountAmount,
      vatRate: draft.vatRate,
    });
    return {
      ...draft,
      code: draft.serviceCode,
      name: draft.description,
      quantity: computed.quantity,
      unitPrice: computed.unitPrice,
      amount: computed.amount,
      discountRate: computed.discountRate,
      discountAmount: computed.discountAmount,
      vatRate: computed.vatRate,
      taxRate: computed.vatRate,
      vatAmount: computed.vatAmount,
      taxAmount: computed.vatAmount,
      totalAmount: computed.totalAmount,
    };
  };

  const updateRow = (index: number, patch: Partial<CrmLineItemDto>) => {
    if (!onChange) return;
    const next = items.map((row, idx) => {
      if (idx !== index) return row;
      return recomputeRow({ ...row, ...patch });
    });
    onChange(next);
  };

  const addCatalogItem = (code: string) => {
    if (!onChange || !code) return;
    const found = catalog.find((c) => c.code === code);
    if (!found) return;
    const newRow = recomputeRow({
      serviceCode: found.code,
      code: found.code,
      description: found.name,
      name: found.name,
      unit: found.unit || 'Gói',
      quantity: 1,
      unitPrice: found.unitPrice || 0,
      amount: 0,
      discountRate: 0,
      discountAmount: 0,
      vatRate: found.vatRate || '8%',
      taxRate: found.vatRate || '8%',
      vatAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
    });
    onChange([...items, newRow]);
    setSelectedCatalogCode('');
  };

  const addBlankRow = () => {
    if (!onChange) return;
    onChange([...items, createEmptyLineItem()]);
  };

  const removeRow = (index: number) => {
    if (!onChange) return;
    onChange(items.filter((_, idx) => idx !== index));
  };

  const clearAll = () => {
    if (!onChange) return;
    onChange([]);
  };

  const totals = calculateLineItemsTotal(items);

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <PackagePlus size={15} className="text-brand-primary" aria-hidden="true" />
              <select
                aria-label="Chọn hàng hóa dịch vụ từ danh mục"
                value={selectedCatalogCode}
                onChange={(e) => addCatalogItem(e.target.value)}
                className="rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <option value="">+ Chọn hàng hóa / dịch vụ mẫu...</option>
                {catalog.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name} ({formatVnd(c.unitPrice)} đ)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={addBlankRow}
              className="inline-flex items-center gap-1 rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Plus size={14} aria-hidden="true" />
              <span>Thêm dòng</span>
            </button>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs font-medium text-[#9f1239] hover:bg-[#ffe4e6]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Xóa tất cả</span>
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-brand-line bg-white">
        <table className="min-w-[1160px] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-brand-line bg-brand-surface text-brand-ink">
              <th className="w-10 px-2.5 py-2.5 text-center font-semibold">STT</th>
              <th className="w-32 px-2.5 py-2.5 font-semibold">Mã hàng hóa</th>
              <th className="min-w-[220px] px-2.5 py-2.5 font-semibold">Diễn giải</th>
              <th className="w-24 px-2.5 py-2.5 font-semibold">Đơn vị tính</th>
              <th className="w-20 px-2.5 py-2.5 text-right font-semibold">Số lượng</th>
              <th className="w-32 px-2.5 py-2.5 text-right font-semibold">Đơn giá</th>
              <th className="w-32 px-2.5 py-2.5 text-right font-semibold">Thành tiền</th>
              <th className="w-24 px-2.5 py-2.5 text-right font-semibold">Tỷ lệ chiết khấu</th>
              <th className="w-28 px-2.5 py-2.5 text-right font-semibold">Tiền chiết khấu</th>
              <th className="w-24 px-2.5 py-2.5 font-semibold">Thuế suất</th>
              <th className="w-28 px-2.5 py-2.5 text-right font-semibold">Tiền thuế</th>
              <th className="w-32 px-2.5 py-2.5 text-right font-semibold">Tổng tiền</th>
              {!readOnly && <th className="w-10 px-2 py-2.5 text-center font-semibold">Xóa</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-brand-line">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 12 : 13}
                  className="px-4 py-8 text-center text-xs text-brand-muted"
                >
                  Chưa có dòng hàng hóa / dịch vụ pháp lý nào.
                </td>
              </tr>
            ) : (
              items.map((row, idx) => (
                <tr key={row.id ?? idx} className="hover:bg-brand-surface/40">
                  <td className="px-2.5 py-2 text-center tabular-nums text-brand-muted">
                    {idx + 1}
                  </td>
                  <td className="px-2.5 py-2">
                    {readOnly ? (
                      <span className="font-medium text-brand-ink">{row.serviceCode || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        aria-label={`Mã hàng hóa dòng ${idx + 1}`}
                        value={row.serviceCode}
                        onChange={(e) => updateRow(idx, { serviceCode: e.target.value })}
                        placeholder="Mã DV"
                        className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                    )}
                  </td>
                  <td className="px-2.5 py-2">
                    {readOnly ? (
                      <span className="text-brand-ink">{row.description || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        aria-label={`Diễn giải dòng ${idx + 1}`}
                        value={row.description}
                        onChange={(e) => updateRow(idx, { description: e.target.value })}
                        placeholder="Nhập tên dịch vụ / nội dung công việc..."
                        className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                    )}
                  </td>
                  <td className="px-2.5 py-2">
                    {readOnly ? (
                      <span className="text-brand-ink">{row.unit || 'Gói'}</span>
                    ) : (
                      <input
                        type="text"
                        aria-label={`Đơn vị tính dòng ${idx + 1}`}
                        value={row.unit}
                        onChange={(e) => updateRow(idx, { unit: e.target.value })}
                        className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                    )}
                  </td>
                  <td className="px-2.5 py-2 text-right tabular-nums">
                    {readOnly ? (
                      <span>{row.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step="any"
                        aria-label={`Số lượng dòng ${idx + 1}`}
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                        className="w-full rounded border border-brand-line bg-white px-2 py-1 text-right text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                    )}
                  </td>
                  <td className="px-2.5 py-2 text-right tabular-nums">
                    {readOnly ? (
                      <span>{formatVnd(row.unitPrice)}</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step="any"
                        aria-label={`Đơn giá dòng ${idx + 1}`}
                        value={row.unitPrice}
                        onChange={(e) => updateRow(idx, { unitPrice: Number(e.target.value) })}
                        className="w-full rounded border border-brand-line bg-white px-2 py-1 text-right text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                    )}
                  </td>
                  <td className="px-2.5 py-2 text-right font-medium tabular-nums text-brand-ink">
                    {formatVnd(row.amount)}
                  </td>
                  <td className="px-2.5 py-2 text-right tabular-nums">
                    {readOnly ? (
                      <span>{row.discountRate}%</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        aria-label={`Tỷ lệ chiết khấu dòng ${idx + 1}`}
                        value={row.discountRate}
                        onChange={(e) =>
                          updateRow(idx, {
                            discountRate: Number(e.target.value),
                            discountAmount: 0,
                          })
                        }
                        className="w-full rounded border border-brand-line bg-white px-2 py-1 text-right text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                    )}
                  </td>
                  <td className="px-2.5 py-2 text-right tabular-nums text-brand-muted">
                    {formatVnd(row.discountAmount)}
                  </td>
                  <td className="px-2.5 py-2">
                    {readOnly ? (
                      <span>{row.vatRate || '0%'}</span>
                    ) : (
                      <select
                        aria-label={`Thuế suất dòng ${idx + 1}`}
                        value={row.vatRate || '0%'}
                        onChange={(e) => updateRow(idx, { vatRate: e.target.value })}
                        className="w-full rounded border border-brand-line bg-white px-1.5 py-1 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      >
                        {VAT_RATES.map((rate) => (
                          <option key={rate} value={rate}>
                            {rate}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-2.5 py-2 text-right tabular-nums text-brand-muted">
                    {formatVnd(row.vatAmount)}
                  </td>
                  <td className="px-2.5 py-2 text-right font-semibold tabular-nums text-brand-primary">
                    {formatVnd(row.totalAmount)}
                  </td>
                  {!readOnly && (
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        aria-label={`Xóa dòng dịch vụ ${idx + 1}`}
                        className="rounded p-1 text-brand-muted hover:bg-[#ffe4e6] hover:text-[#9f1239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>

          <tfoot>
            <tr className="border-t border-brand-line bg-brand-surface font-semibold text-brand-ink">
              <td colSpan={4} className="px-2.5 py-2.5 text-right">
                Tổng cộng
              </td>
              <td className="px-2.5 py-2.5 text-right tabular-nums">{totals.totalQuantity}</td>
              <td className="px-2.5 py-2.5" />
              <td className="px-2.5 py-2.5 text-right tabular-nums">
                {formatVnd(totals.subTotalAmount)}
              </td>
              <td className="px-2.5 py-2.5" />
              <td className="px-2.5 py-2.5 text-right tabular-nums">
                {formatVnd(totals.totalDiscountAmount)}
              </td>
              <td className="px-2.5 py-2.5" />
              <td className="px-2.5 py-2.5 text-right tabular-nums">
                {formatVnd(totals.totalVatAmount)}
              </td>
              <td className="px-2.5 py-2.5 text-right text-sm font-bold tabular-nums text-[#065f46]">
                {formatVnd(totals.grandTotal)}
              </td>
              {!readOnly && <td className="px-2 py-2.5" />}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

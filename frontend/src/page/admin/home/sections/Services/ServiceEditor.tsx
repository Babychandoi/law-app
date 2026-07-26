import { ArrowDown, ArrowLeft, ArrowUp, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  AdminChildrenService,
  createService,
  saveServiceHero,
  saveServicePricing,
  saveServiceProcess,
  saveServiceSections,
  updateService,
  uploadFile,
} from '../../../../../service/admin';
import ServicePageView from '../../../../service/ServicePageView';
import { getServicePage, getServices } from '../../../../../service/service';
import {
  ServicePageData,
  ServiceSection,
  ServiceSectionItem,
} from '../../../../../types/servicePage';

/* ===== helpers ===== */

// Backend lưu tên file; preview cần URL đầy đủ
const resolveImg = (v?: string) =>
  !v
    ? ''
    : v.startsWith('http') || v.startsWith('/')
      ? v
      : `https://minio.luatpoip.com/images/${v}`;

const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20';
const labelCls = 'mb-1 block text-sm font-semibold text-gray-700';
const btnPrimary =
  'inline-flex items-center gap-2 rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50';
const btnGhost =
  'inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:border-amber-600 hover:text-amber-700';

const SECTION_TYPES: { value: string; label: string }[] = [
  { value: 'info', label: 'Đoạn giới thiệu (văn bản + ảnh)' },
  { value: 'benefits', label: 'Lợi ích (lưới icon)' },
  { value: 'cards', label: 'Thẻ có ảnh (loại hình dịch vụ)' },
  { value: 'conditions', label: 'Điều kiện / danh sách đánh số' },
  { value: 'faq', label: 'Hỏi đáp (FAQ)' },
  { value: 'comparison', label: 'Bảng so sánh 2 cột' },
];

interface ProcessDetailForm {
  type: string; // tiêu đề giai đoạn con
  desc: string; // mô tả
  time: string; // thời gian (vd "01-02 tháng")
}

interface ProcessStepForm {
  step: string;
  title: string;
  description: string;
  details: ProcessDetailForm[];
}

interface PricingForm {
  title: string;
  description: string;
  price: string;
  currency: string;
  featured: boolean;
  features: string[];
  image: string;
}

interface Props {
  service: AdminChildrenService | null; // null = tạo mới
  onClose: (changed: boolean) => void;
}

type Tab = 'general' | 'hero' | 'sections' | 'process' | 'pricing';

const TABS: { key: Tab; label: string }[] = [
  { key: 'general', label: 'Thông tin chung' },
  { key: 'hero', label: 'Hero (đầu trang)' },
  { key: 'sections', label: 'Nội dung' },
  { key: 'process', label: 'Quy trình' },
  { key: 'pricing', label: 'Bảng giá' },
];

export default function ServiceEditor({ service, onClose }: Props) {
  const [serviceId, setServiceId] = useState<string | null>(service?.id ?? null);
  const [tab, setTab] = useState<Tab>('general');
  const [changed, setChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!service);

  // --- state từng tab ---
  const [general, setGeneral] = useState({
    title: service?.title ?? '',
    href: service?.href ?? '',
    description: service?.description ?? '',
    descriptionHome: '',
    image: service?.image ?? '',
    parentServiceId: '',
  });
  const [parents, setParents] = useState<{ id: string; title: string }[]>([]);
  const [hero, setHero] = useState({ title: '', subtitle: 'Poip Legal Law', description: '' });
  const [sections, setSections] = useState<ServiceSection[]>([]);
  const [process, setProcess] = useState<ProcessStepForm[]>([]);
  const [pricing, setPricing] = useState<PricingForm[]>([]);

  // Dữ liệu cho tab "Xem trước trang" — ghép từ trạng thái đang nhập, ảnh đổi sang URL đầy đủ
  const previewData: ServicePageData = useMemo(
    () => ({
      id: serviceId || 'preview',
      title: general.title || 'Tên dịch vụ',
      href: general.href || '/',
      description: general.description,
      image: resolveImg(general.image),
      hero: hero.title || hero.description ? { ...hero } : null,
      sections: sections.map((s) => ({
        ...s,
        image: s.image ? resolveImg(s.image) : undefined,
        items: (s.items ?? []).map((it) => ({
          ...it,
          image: it.image ? resolveImg(it.image) : undefined,
        })),
      })),
      process: process.map((p, i) => ({
        id: String(i),
        step: p.step,
        title: p.title,
        description: p.description,
        details: p.details.map((d) => ({ type: d.type, desc: d.desc, time: d.time })),
      })),
      pricing: pricing.map((p, i) => ({
        id: String(i),
        title: p.title,
        price: p.price,
        currency: p.currency,
        description: p.description,
        featured: p.featured,
        features: p.features.filter(Boolean),
        image: p.image ? resolveImg(p.image) : undefined,
      })),
    }),
    [serviceId, general, hero, sections, process, pricing]
  );

  // nhóm dịch vụ cha
  useEffect(() => {
    getServices()
      .then((res) => setParents((res.data || []).map((s) => ({ id: s.id, title: s.title }))))
      .catch(() => undefined);
  }, []);

  // nạp nội dung trang khi sửa
  useEffect(() => {
    if (!service?.href) {
      setLoading(false);
      return;
    }
    getServicePage(service.href)
      .then((res) => {
        const page = res.data;
        if (page.hero) {
          setHero({
            title: page.hero.title || '',
            subtitle: page.hero.subtitle || 'Poip Legal Law',
            description: page.hero.description || '',
          });
        }
        setSections(page.sections || []);
        setProcess(
          (page.process || []).map((p) => ({
            step: p.step || '',
            title: p.title || '',
            description: p.description || '',
            details: (p.details || []).map((d: any) => ({
              type: d.type || '',
              desc: d.desc || '',
              time: d.time || '',
            })),
          }))
        );
        setPricing(
          (page.pricing || []).map((p: any) => ({
            title: p.title || '',
            description: p.description || '',
            price: p.price || '',
            currency: p.currency || 'đ',
            featured: !!p.featured,
            features: (p.features || []).map((f: any) => (typeof f === 'string' ? f : f.text)),
            image: p.image || '',
          }))
        );
      })
      .catch(() => toast.warn('Chưa tải được nội dung trang (trang có thể chưa có nội dung).'))
      .finally(() => setLoading(false));
  }, [service]);

  /* ===== save handlers ===== */

  const saveGeneral = async () => {
    if (!general.title.trim() || !general.href.trim()) {
      toast.error('Cần nhập tên dịch vụ và đường dẫn trang.');
      return;
    }
    setSaving(true);
    try {
      if (serviceId) {
        await updateService(serviceId, general);
        toast.success('Đã lưu thông tin chung.');
      } else {
        const res = await createService(general);
        setServiceId(res.data.id);
        toast.success('Đã tạo dịch vụ. Hãy nhập tiếp Hero, Nội dung, Quy trình, Bảng giá.');
      }
      setChanged(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const saveTab = async (fn: () => Promise<unknown>, okMsg: string) => {
    if (!serviceId) {
      toast.error('Hãy lưu "Thông tin chung" trước để tạo dịch vụ.');
      return;
    }
    setSaving(true);
    try {
      await fn();
      setChanged(true);
      toast.success(okMsg);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const uploadTo = async (file: File, assign: (filename: string) => void) => {
    try {
      const res = await uploadFile(file);
      assign(res.data);
      toast.success('Đã tải ảnh lên (ảnh được tự nén).');
    } catch {
      toast.error('Tải ảnh thất bại.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onClose(changed)} className={btnGhost}>
            <ArrowLeft className="h-4 w-4" />
            Danh sách
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {service ? `Sửa: ${service.title}` : 'Thêm dịch vụ mới'}
          </h1>
        </div>
        {serviceId && general.href && (
          <a
            href={general.href}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-amber-700 hover:underline"
          >
            Xem trang →
          </a>
        )}
      </div>

      {/* tabs */}
      <div className="mb-5 flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          const disabled = t.key !== 'general' && !serviceId;
          return (
            <button
              key={t.key}
              type="button"
              disabled={disabled}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${
                tab === t.key
                  ? 'border-amber-700 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Bố cục: trái = form nhập theo tab, phải = preview toàn trang (cập nhật ngay) */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          {/* ===== TAB: CHUNG ===== */}
          {tab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Tên dịch vụ *</label>
                <input
                  className={inputCls}
                  value={general.title}
                  onChange={(e) => setGeneral({ ...general, title: e.target.value })}
                  placeholder="VD: Đăng ký mã vạch quốc tế"
                />
              </div>
              <div>
                <label className={labelCls}>Đường dẫn trang *</label>
                <input
                  className={inputCls}
                  value={general.href}
                  onChange={(e) => setGeneral({ ...general, href: e.target.value })}
                  placeholder="VD: /dang-ky-ma-vach-quoc-te"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Trang sẽ tồn tại tại luatpoip.com{general.href || '/...'} — dùng chữ thường, không
                  dấu, nối bằng dấu gạch ngang.
                </p>
              </div>
              <div>
                <label className={labelCls}>Nhóm dịch vụ</label>
                <select
                  aria-label="Nhóm dịch vụ"
                  className={inputCls}
                  value={general.parentServiceId}
                  onChange={(e) => setGeneral({ ...general, parentServiceId: e.target.value })}
                >
                  <option value="">— Chọn nhóm (hiện trong trang danh mục) —</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Mô tả ngắn (hiện ở danh mục dịch vụ)</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={general.description}
                  onChange={(e) => setGeneral({ ...general, description: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Ảnh đại diện</label>
                <div className="flex items-center gap-3">
                  {general.image && (
                    <img
                      src={resolveImg(general.image)}
                      alt=""
                      className="h-16 w-24 rounded border border-gray-200 object-cover"
                    />
                  )}
                  <label className={`${btnGhost} cursor-pointer`}>
                    <Upload className="h-4 w-4" />
                    Tải ảnh
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) uploadTo(f, (name) => setGeneral((g) => ({ ...g, image: name })));
                      }}
                    />
                  </label>
                </div>
              </div>
              <button type="button" onClick={saveGeneral} disabled={saving} className={btnPrimary}>
                <Save className="h-4 w-4" />
                {serviceId ? 'Lưu thông tin chung' : 'Tạo dịch vụ'}
              </button>
            </div>
          )}

          {/* ===== TAB: HERO ===== */}
          {tab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Tiêu đề lớn *</label>
                <input
                  className={inputCls}
                  value={hero.title}
                  onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  placeholder="VD: Đăng ký mã vạch quốc tế nhanh chóng"
                />
              </div>
              <div>
                <label className={labelCls}>Phụ đề</label>
                <input
                  className={inputCls}
                  value={hero.subtitle}
                  onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Mô tả</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={hero.description}
                  onChange={(e) => setHero({ ...hero, description: e.target.value })}
                />
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => saveTab(() => saveServiceHero(serviceId!, hero), 'Đã lưu Hero.')}
                className={btnPrimary}
              >
                <Save className="h-4 w-4" />
                Lưu Hero
              </button>
            </div>
          )}

          {/* ===== TAB: SECTIONS ===== */}
          {tab === 'sections' && (
            <SectionsEditor
              sections={sections}
              setSections={setSections}
              onUpload={uploadTo}
              onSave={() =>
                saveTab(() => saveServiceSections(serviceId!, sections), 'Đã lưu nội dung trang.')
              }
              saving={saving}
            />
          )}

          {/* ===== TAB: QUY TRÌNH ===== */}
          {tab === 'process' && (
            <div className="space-y-4">
              <div className="space-y-4">
                {process.map((step, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Bước {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setProcess(process.filter((_, x) => x !== i))}
                        aria-label="Xóa bước quy trình"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
                      <input
                        className={inputCls}
                        value={step.step}
                        placeholder="01"
                        onChange={(e) =>
                          setProcess(
                            process.map((s, x) => (x === i ? { ...s, step: e.target.value } : s))
                          )
                        }
                      />
                      <input
                        className={inputCls}
                        value={step.title}
                        placeholder="Tên bước (VD: Tra cứu, đánh giá)"
                        onChange={(e) =>
                          setProcess(
                            process.map((s, x) => (x === i ? { ...s, title: e.target.value } : s))
                          )
                        }
                      />
                    </div>
                    <textarea
                      className={`${inputCls} mt-3`}
                      rows={2}
                      value={step.description}
                      placeholder="Mô tả bước này"
                      onChange={(e) =>
                        setProcess(
                          process.map((s, x) =>
                            x === i ? { ...s, description: e.target.value } : s
                          )
                        )
                      }
                    />

                    {/* Giai đoạn con (tùy chọn) — hiện dạng lưới chi tiết ngoài trang */}
                    <div className="mt-3 space-y-2 border-t border-dashed border-gray-200 pt-3">
                      <p className="text-xs font-semibold text-gray-500">
                        Giai đoạn con (tùy chọn — để trống nếu bước không chia nhỏ)
                      </p>
                      {step.details.map((d, di) => (
                        <div key={di} className="rounded border border-gray-100 bg-gray-50 p-2.5">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-2">
                              <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
                                <input
                                  className={inputCls}
                                  value={d.type}
                                  placeholder="Tên giai đoạn (VD: Thẩm định hình thức)"
                                  onChange={(e) =>
                                    setProcess(
                                      process.map((s, x) =>
                                        x === i
                                          ? {
                                              ...s,
                                              details: s.details.map((dd, y) =>
                                                y === di ? { ...dd, type: e.target.value } : dd
                                              ),
                                            }
                                          : s
                                      )
                                    )
                                  }
                                />
                                <input
                                  className={inputCls}
                                  value={d.time}
                                  placeholder="Thời gian"
                                  onChange={(e) =>
                                    setProcess(
                                      process.map((s, x) =>
                                        x === i
                                          ? {
                                              ...s,
                                              details: s.details.map((dd, y) =>
                                                y === di ? { ...dd, time: e.target.value } : dd
                                              ),
                                            }
                                          : s
                                      )
                                    )
                                  }
                                />
                              </div>
                              <input
                                className={inputCls}
                                value={d.desc}
                                placeholder="Mô tả giai đoạn"
                                onChange={(e) =>
                                  setProcess(
                                    process.map((s, x) =>
                                      x === i
                                        ? {
                                            ...s,
                                            details: s.details.map((dd, y) =>
                                              y === di ? { ...dd, desc: e.target.value } : dd
                                            ),
                                          }
                                        : s
                                    )
                                  )
                                }
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setProcess(
                                  process.map((s, x) =>
                                    x === i
                                      ? { ...s, details: s.details.filter((_, y) => y !== di) }
                                      : s
                                  )
                                )
                              }
                              aria-label="Xóa chi tiết"
                              className="mt-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setProcess(
                            process.map((s, x) =>
                              x === i
                                ? {
                                    ...s,
                                    details: [...s.details, { type: '', desc: '', time: '' }],
                                  }
                                : s
                            )
                          )
                        }
                        className={btnGhost}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm giai đoạn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setProcess([
                      ...process,
                      {
                        step: String(process.length + 1).padStart(2, '0'),
                        title: '',
                        description: '',
                        details: [],
                      },
                    ])
                  }
                  className={btnGhost}
                >
                  <Plus className="h-4 w-4" />
                  Thêm bước
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    saveTab(() => saveServiceProcess(serviceId!, process), 'Đã lưu quy trình.')
                  }
                  className={btnPrimary}
                >
                  <Save className="h-4 w-4" />
                  Lưu quy trình
                </button>
              </div>
            </div>
          )}

          {/* ===== TAB: BẢNG GIÁ ===== */}
          {tab === 'pricing' && (
            <div className="space-y-4">
              <div className="space-y-4">
                {pricing.map((plan, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Gói {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setPricing(pricing.filter((_, x) => x !== i))}
                        aria-label="Xóa gói giá"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className={inputCls}
                        value={plan.title}
                        placeholder="Tên gói (VD: Gói cơ bản)"
                        onChange={(e) =>
                          setPricing(
                            pricing.map((p, x) => (x === i ? { ...p, title: e.target.value } : p))
                          )
                        }
                      />
                      <div className="flex gap-2">
                        <input
                          className={inputCls}
                          value={plan.price}
                          placeholder="Giá (VD: 1.800.000 hoặc Liên hệ)"
                          onChange={(e) =>
                            setPricing(
                              pricing.map((p, x) => (x === i ? { ...p, price: e.target.value } : p))
                            )
                          }
                        />
                        <input
                          className={`${inputCls} !w-16`}
                          value={plan.currency}
                          placeholder="đ"
                          onChange={(e) =>
                            setPricing(
                              pricing.map((p, x) =>
                                x === i ? { ...p, currency: e.target.value } : p
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                    <textarea
                      className={`${inputCls} mt-3`}
                      rows={2}
                      value={plan.description}
                      placeholder="Mô tả gói"
                      onChange={(e) =>
                        setPricing(
                          pricing.map((p, x) =>
                            x === i ? { ...p, description: e.target.value } : p
                          )
                        )
                      }
                    />
                    <textarea
                      className={`${inputCls} mt-3`}
                      rows={3}
                      value={plan.features.join('\n')}
                      placeholder={
                        'Các quyền lợi, mỗi dòng một mục\nVD: Tra cứu miễn phí\nSoạn hồ sơ trọn gói'
                      }
                      onChange={(e) =>
                        setPricing(
                          pricing.map((p, x) =>
                            x === i ? { ...p, features: e.target.value.split('\n') } : p
                          )
                        )
                      }
                    />
                    <div className="mt-3 flex items-center gap-3">
                      {plan.image && (
                        <img
                          src={resolveImg(plan.image)}
                          alt=""
                          className="h-14 w-20 rounded border border-gray-200 object-cover"
                        />
                      )}
                      <label className={`${btnGhost} cursor-pointer`}>
                        <Upload className="h-3.5 w-3.5" />
                        {plan.image ? 'Đổi ảnh gói' : 'Thêm ảnh gói'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = '';
                            if (f)
                              uploadTo(f, (name) =>
                                setPricing((prev) =>
                                  prev.map((p, x) => (x === i ? { ...p, image: name } : p))
                                )
                              );
                          }}
                        />
                      </label>
                      {plan.image && (
                        <button
                          type="button"
                          onClick={() =>
                            setPricing(pricing.map((p, x) => (x === i ? { ...p, image: '' } : p)))
                          }
                          className="text-xs font-semibold text-red-500 hover:underline"
                        >
                          Bỏ ảnh
                        </button>
                      )}
                    </div>
                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={plan.featured}
                        onChange={(e) =>
                          setPricing(
                            pricing.map((p, x) =>
                              x === i ? { ...p, featured: e.target.checked } : p
                            )
                          )
                        }
                      />
                      Gói nổi bật (đánh dấu "phổ biến")
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPricing([
                      ...pricing,
                      {
                        title: '',
                        description: '',
                        price: '',
                        currency: 'đ',
                        featured: false,
                        features: [],
                        image: '',
                      },
                    ])
                  }
                  className={btnGhost}
                >
                  <Plus className="h-4 w-4" />
                  Thêm gói giá
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    saveTab(
                      () =>
                        saveServicePricing(
                          serviceId!,
                          pricing.map((p) => ({ ...p, features: p.features.filter(Boolean) }))
                        ),
                      'Đã lưu bảng giá.'
                    )
                  }
                  className={btnPrimary}
                >
                  <Save className="h-4 w-4" />
                  Lưu bảng giá
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: preview toàn trang, cập nhật ngay theo nội dung đang nhập */}
        <div className="min-w-0">
          <div className="xl:sticky xl:top-4">
            <p className="mb-2 text-sm font-semibold text-gray-500">
              Xem trước — trang hiển thị như thế này (chưa cần lưu)
            </p>
            <div className="overflow-hidden rounded-xl border-2 border-gray-300 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-3 truncate rounded bg-white px-3 py-0.5 font-mono text-xs text-gray-500">
                  luatpoip.com{general.href || '/...'}
                </span>
              </div>
              <div className="max-h-[80vh] overflow-y-auto">
                <ServicePageView data={previewData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Sections editor ===== */

function SectionsEditor({
  sections,
  setSections,
  onUpload,
  onSave,
  saving,
}: {
  sections: ServiceSection[];
  setSections: (s: ServiceSection[]) => void;
  onUpload: (file: File, assign: (filename: string) => void) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const update = (i: number, patch: Partial<ServiceSection>) =>
    setSections(sections.map((s, x) => (x === i ? { ...s, ...patch } : s)));

  const updateItem = (si: number, ii: number, patch: Partial<ServiceSectionItem>) =>
    setSections(
      sections.map((s, x) =>
        x === si
          ? { ...s, items: (s.items ?? []).map((it, y) => (y === ii ? { ...it, ...patch } : it)) }
          : s
      )
    );

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
  };

  const itemLabels = (type?: string) => {
    switch (type) {
      case 'faq':
        return { title: 'Câu hỏi', description: 'Câu trả lời' };
      case 'comparison':
        return { title: 'Tiêu chí', description: 'Cột A', secondary: 'Cột B' };
      default:
        return { title: 'Tiêu đề', description: 'Mô tả' };
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Nội dung trang gồm nhiều khối (section) xếp theo thứ tự (trái → phải, trên → dưới). Chọn
        kiểu khối phù hợp; khối nào không cần thì xóa — trang chỉ hiện những gì có dữ liệu.
      </p>

      <div className="space-y-5">
        {sections.map((section, i) => {
          const labels = itemLabels(section.type);
          return (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <select
                  aria-label="Loại mục nội dung"
                  className={`${inputCls} !w-auto`}
                  value={section.type}
                  onChange={(e) => update(i, { type: e.target.value })}
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    aria-label="Di chuyển mục lên"
                    className={btnGhost}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    aria-label="Di chuyển mục xuống"
                    className={btnGhost}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSections(sections.filter((_, x) => x !== i))}
                    aria-label="Xóa mục nội dung"
                    className="inline-flex items-center rounded-md border border-gray-300 px-2.5 py-1.5 text-red-500 hover:border-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <input
                className={inputCls}
                value={section.title || ''}
                placeholder="Tiêu đề section"
                onChange={(e) => update(i, { title: e.target.value })}
              />
              <input
                className={`${inputCls} mt-2`}
                value={section.subtitle || ''}
                placeholder={
                  section.type === 'comparison'
                    ? 'Tên 2 cột, ngăn bằng | — VD: Nhãn hiệu|Thương hiệu'
                    : 'Mô tả ngắn dưới tiêu đề (tùy chọn)'
                }
                onChange={(e) => update(i, { subtitle: e.target.value })}
              />

              {(section.type === 'info' || section.type === 'conditions') && (
                <textarea
                  className={`${inputCls} mt-2`}
                  rows={4}
                  value={section.content || ''}
                  placeholder="Nội dung đoạn văn (xuống dòng để tách đoạn)"
                  onChange={(e) => update(i, { content: e.target.value })}
                />
              )}

              {section.type === 'info' && (
                <div className="mt-2 flex items-center gap-3">
                  {section.image && (
                    <img
                      src={resolveImg(section.image)}
                      alt=""
                      className="h-14 w-20 rounded border border-gray-200 object-cover"
                    />
                  )}
                  <label className={`${btnGhost} cursor-pointer`}>
                    <Upload className="h-3.5 w-3.5" />
                    Ảnh minh họa
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) onUpload(f, (name) => update(i, { image: name }));
                      }}
                    />
                  </label>
                </div>
              )}

              {/* items */}
              <div className="mt-3 space-y-2 border-t border-dashed border-gray-200 pt-3">
                {(section.items ?? []).map((item, ii) => (
                  <div key={ii} className="rounded border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          className={inputCls}
                          value={item.title || ''}
                          placeholder={labels.title}
                          onChange={(e) => updateItem(i, ii, { title: e.target.value })}
                        />
                        <textarea
                          className={inputCls}
                          rows={2}
                          value={item.description || ''}
                          placeholder={labels.description}
                          onChange={(e) => updateItem(i, ii, { description: e.target.value })}
                        />
                        {section.type === 'comparison' && (
                          <textarea
                            className={inputCls}
                            rows={2}
                            value={item.secondary || ''}
                            placeholder={labels.secondary}
                            onChange={(e) => updateItem(i, ii, { secondary: e.target.value })}
                          />
                        )}
                        {section.type === 'cards' && (
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={resolveImg(item.image)}
                                alt=""
                                className="h-12 w-16 rounded border border-gray-200 object-cover"
                              />
                            )}
                            <label className={`${btnGhost} cursor-pointer`}>
                              <Upload className="h-3.5 w-3.5" />
                              Ảnh thẻ
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  e.target.value = '';
                                  if (f) onUpload(f, (name) => updateItem(i, ii, { image: name }));
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          update(i, { items: (section.items ?? []).filter((_, y) => y !== ii) })
                        }
                        aria-label="Xóa mục con"
                        className="mt-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => update(i, { items: [...(section.items ?? []), {}] })}
                  className={btnGhost}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm mục
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setSections([...sections, { type: 'info', items: [] }])}
          className={btnGhost}
        >
          <Plus className="h-4 w-4" />
          Thêm section
        </button>
        <button type="button" disabled={saving} onClick={onSave} className={btnPrimary}>
          <Save className="h-4 w-4" />
          Lưu nội dung
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import { GeneratedDocument } from '../../types/documentTemplate';

export default function GeneratedDocumentList() {
  const [docs, setDocs] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setDocs(await documentTemplateService.listGenerated());
    } catch {
      toast.error('Không tải được danh sách tài liệu đã tạo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const download = async (doc: GeneratedDocument) => {
    try {
      await documentTemplateService.download(doc.id, doc.fileName);
    } catch {
      toast.error('Không tải được file');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Tài liệu đã tạo</h2>
        <p className="text-sm text-brand-muted">
          Danh sách file Word đã được sinh từ các mẫu hồ sơ.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-line bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface text-left text-brand-muted">
            <tr>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Mẫu</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Tải về</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-t border-brand-line hover:bg-brand-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-primary/15 text-brand-primaryDark">
                      <FileText size={18} />
                    </span>
                    <span className="font-medium text-brand-ink">{doc.fileName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {doc.templateName} · v{doc.templateVersion}
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleString('vi-VN') : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => download(doc)}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-white hover:bg-brand-primaryDark"
                  >
                    <Download size={16} /> Tải
                  </button>
                </td>
              </tr>
            ))}
            {!loading && docs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-brand-muted">
                  Chưa có tài liệu nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

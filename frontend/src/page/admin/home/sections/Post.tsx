import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../../component/common/Modal';
import { getNews, getNew } from '../../../../service/service';
import {
  createNews,
  deleteNews,
  updateNews,
  uploadFile,
  sendMail,
} from '../../../../service/admin';
import { News } from '../../../../types/service';
import { sanitizeHtml } from '../../../../shared/utils/sanitizeHtml';
import AddNews from './News/AddNews';
import EditNews from './News/EditNews';
import { Eye, Pencil, Trash2, Send, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { Spinner, useConfirm } from '../../../../component/common/ui';

const NewsManagement: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [showAddNews, setShowAddNews] = useState(false);
  const [showEditNews, setShowEditNews] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1); // 1-based
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const { confirm, confirmDialog } = useConfirm();
  const PAGE_SIZE = 12;

  const fetchNewsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNews({ page: page - 1, size: PAGE_SIZE });
      if (response.code === 200) {
        setNewsList(response.data);
        setTotalPages(response.meta?.totalPages ?? 1);
        setTotalElements(response.meta?.totalElements ?? response.data.length);
      } else {
        setError('Không tải được tin tức: ' + response.message);
      }
    } catch (error) {
      setError('Lỗi khi tải tin tức: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNewsList();
  }, [fetchNewsList]);

  const handleEdit = async (id: string) => {
    try {
      const response = await getNew(id);
      if (response.code === 200) {
        setEditingNews(response.data);
        setShowEditNews(true);
      } else {
        toast.error(response.message || 'Không thể tải tin tức');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Lỗi khi tải tin tức');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Xóa tin tức',
      message: 'Tin tức này sẽ bị xóa vĩnh viễn. Tiếp tục?',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setLoading(true);
      const response = await deleteNews(id);
      if (response.code === 200) {
        if (selectedNews?.id === id) setSelectedNews(null);
        toast.success('Đã xóa tin tức');
        fetchNewsList();
      } else {
        toast.error(response.message || 'Không xóa được tin tức');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Lỗi khi xóa tin tức');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setShowAddNews(true);
  };

  const handleViewDetails = async (newId: string) => {
    try {
      const response = await getNew(newId);
      if (response.code === 200) {
        setSelectedNews(response.data);
      } else {
        toast.error(response.message || 'Không thể tải chi tiết tin');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Lỗi khi tải chi tiết tin');
    }
  };

  const handleCloseDetails = () => {
    setSelectedNews(null);
  };

  const handleSaveNewNews = async (newsData: News, file: File) => {
    try {
      if (newsData.image === '' && file !== null) {
        const uploadResponse = await uploadFile(file);
        if (uploadResponse.code === 200) {
          newsData.image = uploadResponse.data;
        } else {
          toast.error(uploadResponse.message || 'Tải ảnh thất bại');
          return;
        }
      }
      const response = await createNews(newsData);
      if (response.code === 200) {
        setShowAddNews(false);
        toast.success('Tạo tin tức thành công!');
        setPage(1);
        fetchNewsList();
      } else {
        toast.error(response.message || 'Không thể tạo tin tức');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Lỗi khi tạo tin tức');
    }
  };

  const handleSaveEditNews = async (updatedNews: News, file?: File) => {
    try {
      if (file) {
        const uploadResponse = await uploadFile(file);
        if (uploadResponse.code === 200) {
          updatedNews.image = uploadResponse.data;
        } else {
          toast.error(uploadResponse.message || 'Tải ảnh thất bại');
          return;
        }
      } else {
        // Không đổi ảnh: lấy lại tên file từ URL MinIO nếu là URL đầy đủ.
        const originalNews = newsList.find((n) => n.id === updatedNews.id);
        if (originalNews?.image) {
          const imageUrl = originalNews.image;
          updatedNews.image = imageUrl.includes('/images/')
            ? imageUrl.split('/images/').pop() || imageUrl
            : imageUrl;
        }
      }

      if (!updatedNews.id) {
        toast.error('Không tìm thấy ID tin tức để cập nhật');
        return;
      }

      const response = await updateNews(updatedNews.id, updatedNews);
      if (response.code === 200) {
        if (selectedNews?.id === updatedNews.id) setSelectedNews(response.data);
        setShowEditNews(false);
        setEditingNews(null);
        toast.success('Cập nhật thành công!');
        fetchNewsList();
      } else {
        toast.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Lỗi khi cập nhật');
    }
  };

  const handleCancelAdd = () => {
    setShowAddNews(false);
  };

  const handleCancelEdit = () => {
    setShowEditNews(false);
    setEditingNews(null);
  };

  const handleSendEmail = async (id: string) => {
    try {
      const response = await sendMail(id);
      if (response.data === true) {
        toast.success('Đã gửi email thành công.');
      } else {
        toast.error(response.message || 'Gửi email thất bại.');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Lỗi khi gửi email.');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {confirmDialog}
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-brand-ink mb-2">Quản lý tin tức</h2>
              <p className="text-gray-600">Tạo, chỉnh sửa và quản lý các bài viết tin tức</p>
            </div>
            <button
              onClick={handleAddNew}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-brand-goldDark hover:bg-brand-gold disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-colors"
            >
              <span className="text-xl leading-none">+</span>
              {loading ? 'Đang tải...' : 'Thêm tin tức'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="text-red-700 font-medium flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-2xl font-bold  transition-transform"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <Spinner center />}

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {newsList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-100">
              <Newspaper className="w-14 h-14 mx-auto mb-4 text-gray-300" aria-hidden="true" />
              <p className="text-gray-500 text-lg">
                {loading ? 'Đang tải tin tức...' : 'Chưa có tin tức nào'}
              </p>
            </div>
          ) : (
            newsList.map((news, index) => (
              <div
                key={news.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-soft border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover  transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-goldDark transition-colors duration-200">
                          {news.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2 mb-3">{news.subtitle}</p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1 bg-brand-surface rounded-lg">
                        <span className="text-brand-goldDark">👤</span>
                        <span className="text-gray-700 font-medium">{news.author}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                        <span className="text-green-600">📅</span>
                        <span className="text-gray-700">
                          {news.createdAt
                            ? new Date(news.createdAt).toLocaleDateString('vi-VN')
                            : 'Không xác định'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => news.id && handleViewDetails(news.id)}
                        disabled={loading}
                        title="Xem chi tiết"
                        className="flex items-center gap-2 px-4 py-2 bg-brand-goldDark hover:bg-brand-gold text-white rounded-lg font-medium shadow-md hover:shadow-lg  active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Eye size={18} />
                        <span>Xem</span>
                      </button>

                      <button
                        onClick={() => handleEdit(news.id ?? '')}
                        disabled={loading}
                        title="Sửa"
                        className="flex items-center gap-2 px-4 py-2 bg-brand-goldDark hover:bg-brand-gold text-white rounded-lg font-medium shadow-md hover:shadow-lg  active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Pencil size={18} />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => handleDelete(news.id ?? '')}
                        disabled={loading}
                        title="Xóa"
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg  active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={18} />
                        <span>Xóa</span>
                      </button>

                      <button
                        onClick={() => handleSendEmail(news.id ?? '')}
                        disabled={loading}
                        title="Gửi email"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg  active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={18} />
                        <span>Gửi email</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Phân trang (server-side) */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>{totalElements} bài viết</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Trang trước"
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2">
                {page}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Trang sau"
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* News Detail Modal */}
        {selectedNews && (
          <Modal title="Chi tiết tin tức" onClose={handleCloseDetails} size="xl">
            <div>
              <div className="mb-6">
                {/* Hero Image */}
                <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-lg">
                  <img
                    src={selectedNews.image}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Title & Subtitle */}
                <h4 className="text-3xl font-bold text-brand-ink mb-3">{selectedNews.title}</h4>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {selectedNews.subtitle}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-brand-surface rounded-xl border-2 border-brand-line">
                    <span className="text-xl">👤</span>
                    <span className="text-gray-700 font-semibold">{selectedNews.author}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                    <span className="text-xl">📅</span>
                    <span className="text-gray-700 font-semibold">
                      {selectedNews.createdAt
                        ? new Date(selectedNews.createdAt).toLocaleString('vi-VN')
                        : 'Không xác định'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Content */}
              {selectedNews.fullContent && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 w-12 bg-brand-gold rounded-full"></div>
                    <h5 className="text-xl font-bold text-gray-800">Nội dung chi tiết</h5>
                    <div className="h-1 flex-1 bg-brand-line rounded-full"></div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <div
                      className="prose prose-lg max-w-none
                          prose-headings:font-bold prose-headings:text-gray-900
                          prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                          prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
                          prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
                          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3
                          prose-a:text-orange-500 prose-a:no-underline hover:prose-a:text-orange-600 hover:prose-a:underline
                          prose-strong:text-gray-900 prose-strong:font-semibold
                          prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-3
                          prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-3
                          prose-li:text-gray-700 prose-li:mb-1
                          prose-img:rounded-xl prose-img:shadow-lg prose-img:my-4 prose-img:max-w-full
                          prose-blockquote:border prose-blockquote:border-orange-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                          prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800
                        "
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedNews.fullContent) }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Add News Modal */}
        {showAddNews && <AddNews onSave={handleSaveNewNews} onCancel={handleCancelAdd} />}

        {/* Edit News Modal */}
        {showEditNews && editingNews && (
          <EditNews news={editingNews} onSave={handleSaveEditNews} onCancel={handleCancelEdit} />
        )}
      </div>
    </div>
  );
};

export default NewsManagement;

import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { getNews, getNew } from "../../../../service/service";
import { createNews, deleteNews, updateNews, uploadFile, sendMail } from "../../../../service/admin";
import { News } from "../../../../types/service";
import AddNews from "./News/AddNews";
import EditNews from "./News/EditNews";
import { Eye, Pencil, Trash2, Send } from "lucide-react";

const NewsManagement: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [showAddNews, setShowAddNews] = useState(false);
  const [showEditNews, setShowEditNews] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch news list on component mount
  useEffect(() => {
    fetchNewsList();
  }, []);

  const fetchNewsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNews();
      if (response.code === 200) {
        setNewsList(response.data);
      } else {
        setError("Failed to fetch news: " + response.message);
      }
    } catch (error) {
      setError("Error fetching news: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    // Hiển thị loading
    Swal.fire({
      title: 'Đang tải dữ liệu...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await getNew(id);

      if (response.code === 200) {
        Swal.close();
        setEditingNews(response.data);
        setShowEditNews(true);
      } else {

        // Hiển thị lỗi phản hồi
        Swal.fire({
          icon: 'error',
          title: 'Không thể tải tin tức',
          text: response.message || 'Có lỗi xảy ra!',
        });
      }
    } catch (error) {
      // Hiển thị lỗi ngoại lệ
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi gọi API',
        text: (error as Error).message || 'Lỗi không xác định!',
      });
    }
  };




  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Tin tức này sẽ bị xóa vĩnh viễn!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await deleteNews(id);
        if (response.code === 200) {
          setNewsList(prev => prev.filter(news => news.id !== id));
          if (selectedNews?.id === id) {
            setSelectedNews(null);
          }

          // ✅ Thông báo xóa thành công
          Swal.fire('Đã xóa!', 'Tin tức đã được xóa.', 'success');
        } else {
          setError("Failed to delete news: " + response.message);
          Swal.fire('Lỗi!', response.message, 'error');
        }
      } catch (error) {
        const message = (error as Error).message;
        setError("Error deleting news: " + message);
        Swal.fire('Lỗi!', message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };


  const handleAddNew = () => {
    setShowAddNews(true);
  };
  const handleViewDetails = async (newId: string) => {
    try {
      // Hiển thị loading
      Swal.fire({
        title: 'Đang tải chi tiết tin...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await getNew(newId);

      if (response.code === 200) {
        // Đóng loading
        Swal.close();
        setSelectedNews(response.data);
      } else {
        // Lỗi từ server
        Swal.fire({
          icon: 'error',
          title: 'Không thể tải chi tiết tin',
          text: response.message || 'Có lỗi xảy ra!',
        });
      }
    } catch (error) {
      // Lỗi hệ thống
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi gọi API',
        text: (error as Error).message || 'Lỗi không xác định!',
      });
    }
  };


  const handleCloseDetails = () => {
    setSelectedNews(null);
  };

  const handleSaveNewNews = async (newsData: News, file: File) => {
    try {
      // Hiển thị loading spinner
      Swal.fire({
        title: 'Đang lưu tin tức...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Nếu chưa có ảnh và có file, thì upload
      if (newsData.image === "" && file !== null) {
        const uploadResponse = await uploadFile(file);
        if (uploadResponse.code === 200) {
          newsData.image = uploadResponse.data;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Tải ảnh thất bại',
            text: uploadResponse.message || 'Không thể tải ảnh lên!',
          });
          return;
        }
      }

      const response = await createNews(newsData);
      if (response.code === 200) {
        // Thêm vào local state
        setNewsList(prev => [response.data, ...prev]);
        setShowAddNews(false);

        Swal.fire({
          icon: 'success',
          title: 'Tạo tin tức thành công!',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Không thể tạo tin tức',
          text: response.message || 'Lỗi không xác định!',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi tạo tin tức',
        text: (error as Error).message || 'Đã xảy ra lỗi!',
      });
    }
  };


  const handleSaveEditNews = async (updatedNews: News, file?: File) => {
    try {
      // Hiển thị loading
      Swal.fire({
        title: 'Đang cập nhật tin tức...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // If there's a new file to upload
      if (file) {
        const uploadResponse = await uploadFile(file);
        if (uploadResponse.code === 200) {
          updatedNews.image = uploadResponse.data;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Tải ảnh thất bại',
            text: uploadResponse.message || 'Không thể tải ảnh lên!',
          });
          return;
        }
      } else {
        // If no new file, extract filename from full URL or keep as is
        const originalNews = newsList.find(n => n.id === updatedNews.id);
        if (originalNews?.image) {
          // Extract filename from MinIO URL if it's a full URL
          const imageUrl = originalNews.image;
          if (imageUrl.includes('/images/')) {
            // Extract just the filename after /images/
            const filename = imageUrl.split('/images/').pop() || imageUrl;
            updatedNews.image = filename;
          } else {
            updatedNews.image = imageUrl;
          }
        }
      }

      if (!updatedNews.id) {
        Swal.fire({
          icon: 'error',
          title: 'Thiếu ID',
          text: 'Không tìm thấy ID của tin tức để cập nhật.',
        });
        return;
      }

      const response = await updateNews(updatedNews.id, updatedNews);
      if (response.code === 200) {
        // Cập nhật local state
        setNewsList(prev => prev.map(news =>
          news.id === updatedNews.id ? response.data : news
        ));

        if (selectedNews?.id === updatedNews.id) {
          setSelectedNews(response.data);
        }

        setShowEditNews(false);
        setEditingNews(null);

        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công!',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Cập nhật thất bại',
          text: response.message || 'Lỗi không xác định!',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi cập nhật',
        text: (error as Error).message || 'Đã xảy ra lỗi!',
      });
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
        Swal.fire('Success!', 'Email sent successfully.', 'success');
      } else {
        Swal.fire('Error!', response.message || 'Failed to send email.', 'error');
      }
    } catch (error) {
      Swal.fire('Error!', (error as Error).message, 'error');
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                Quản lý tin tức
              </h2>
              <p className="text-gray-600">Tạo, chỉnh sửa và quản lý các bài viết tin tức</p>
            </div>
            <button
              onClick={handleAddNew}
              disabled={loading}
              className="group relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">+</span>
                {loading ? "Đang tải..." : "Thêm tin tức"}
              </span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="text-red-700 font-medium flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-2xl font-bold hover:scale-110 transition-transform"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-yellow-400 border-r-orange-400 absolute top-0 left-0"></div>
            </div>
            <span className="ml-3 text-gray-700 font-medium">Đang tải...</span>
          </div>
        )}

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {newsList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-100">
              <div className="text-6xl mb-4">📰</div>
              <p className="text-gray-500 text-lg">
                {loading ? "Đang tải tin tức..." : "Chưa có tin tức nào"}
              </p>
            </div>
          ) : (
            newsList.map((news, index) => (
              <div
                key={news.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
                          {news.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2 mb-3">{news.subtitle}</p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                        <span className="text-blue-600">👤</span>
                        <span className="text-gray-700 font-medium">{news.author}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                        <span className="text-green-600">📅</span>
                        <span className="text-gray-700">
                          {news.createdAt ? new Date(news.createdAt).toLocaleDateString('vi-VN') : "Không xác định"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => news.id && handleViewDetails(news.id)}
                        disabled={loading}
                        title="Xem chi tiết"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Eye size={18} />
                        <span>Xem</span>
                      </button>

                      <button
                        onClick={() => handleEdit(news.id ?? "")}
                        disabled={loading}
                        title="Sửa"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Pencil size={18} />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => handleDelete(news.id ?? "")}
                        disabled={loading}
                        title="Xóa"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={18} />
                        <span>Xóa</span>
                      </button>

                      <button
                        onClick={() => handleSendEmail(news.id ?? "")}
                        disabled={loading}
                        title="Gửi email"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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


        {/* News Detail Modal */}
        {selectedNews && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-100">
              {/* Modal Header */}
              <div className="relative p-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">Chi tiết tin tức</h3>
                  <button
                    onClick={handleCloseDetails}
                    className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-2xl font-bold hover:scale-110 active:scale-95 transition-all duration-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
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
                  <h4 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-3">
                    {selectedNews.title}
                  </h4>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{selectedNews.subtitle}</p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                      <span className="text-xl">👤</span>
                      <span className="text-gray-700 font-semibold">{selectedNews.author}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                      <span className="text-xl">📅</span>
                      <span className="text-gray-700 font-semibold">
                        {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleString('vi-VN') : "Không xác định"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full Content */}
                {selectedNews.fullContent && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                      <h5 className="text-xl font-bold text-gray-800">Nội dung chi tiết</h5>
                      <div className="h-1 flex-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-md">
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
                          prose-blockquote:border-l-4 prose-blockquote:border-orange-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                          prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800
                        "
                        dangerouslySetInnerHTML={{ __html: selectedNews.fullContent }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add News Modal */}
        {showAddNews && (
          <AddNews
            onSave={handleSaveNewNews}
            onCancel={handleCancelAdd}
          />
        )}

        {/* Edit News Modal */}
        {showEditNews && editingNews && (
          <EditNews
            news={editingNews}
            onSave={handleSaveEditNews}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </div>
  );
};

export default NewsManagement;
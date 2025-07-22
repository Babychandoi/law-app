import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { getNews, getNew } from "../../../../service/service";
import { createNews, deleteNews, updateNews, uploadFile, sendMail } from "../../../../service/admin";
import { News } from "../../../../types/service";
import AddNews from "./News/AddNews";
import EditNews from "./News/EditNews";
import { BookOpen, FileText, Shield, Globe, Award, AlertTriangle, Eye, Pencil, Trash2, Send } from "lucide-react";

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

      if (updatedNews.image === "" && file != null) {
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

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'BOOKOPEN': return <BookOpen className="w-5 h-5" />;
      case 'FILETEXT': return <FileText className="w-5 h-5" />;
      case 'SHIELD': return <Shield className="w-5 h-5" />;
      case 'GLOBE': return <Globe className="w-5 h-5" />;
      case 'AWARD': return <Award className="w-5 h-5" />;
      case 'ALERTTRIANGLE': return <AlertTriangle className="w-5 h-5" />;
      default: return null;
    }
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
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý tin tức</h2>
        <button
          onClick={handleAddNew}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? "Đang tải..." : "Thêm tin tức"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* News Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Hình ảnh</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tiêu đề</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tác giả</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày tạo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {newsList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {loading ? "Đang tải tin tức..." : "Không có tin tức nào"}
                </td>
              </tr>
            ) : (
              newsList.map(news => (
                <tr key={news.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 w-24">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-16 h-12 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 max-w-[300px]">
                    <div className="text-sm text-gray-900 font-medium truncate">{news.title}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{news.subtitle}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[150px] text-sm text-gray-700 truncate">{news.author}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {news.createdAt?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => news.id && handleViewDetails(news.id)}
                      disabled={loading}
                      title="Xem chi tiết"
                      className="text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => handleEdit(news.id ?? "")}
                      disabled={loading}
                      title="Sửa"
                      className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(news.id ?? "")}
                      disabled={loading}
                      title="Xóa"
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                    >
                      <Trash2 size={18} />
                    </button>

                    <button
                      onClick={() => handleSendEmail(news.id ?? "")}
                      disabled={loading}
                      title="Gửi email"
                      className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                    >
                      <Send size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Chi tiết tin tức</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.jpg';
                  }}
                />
                <h4 className="text-2xl font-bold text-gray-800 mb-2">{selectedNews.title}</h4>
                <p className="text-lg text-gray-600 mb-4">{selectedNews.subtitle}</p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <span className="mr-4">Tác giả: {selectedNews.author}</span>
                  <span>Ngày tạo: {selectedNews.createdAt?.toLocaleString()}</span>
                </div>
              </div>

              {selectedNews.sections && selectedNews.sections.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 mb-4">Các phần nội dung:</h5>
                  <div className="space-y-4">
                    {selectedNews.sections.map((section, index) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-3">{renderIcon(section.icon)}</span>
                          <h6 className="font-medium text-gray-800">
                            {index + 1}. {section.title}
                          </h6>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{section.content}</p>
                      </div>
                    ))}
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
  );
};

export default NewsManagement;
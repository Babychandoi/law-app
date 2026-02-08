import React, { useEffect, useState } from 'react';
import { FileText, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getChildrenServiceByTitle } from '../../service/service';
import { ChildrenServiceResponse } from '../../types/service';
import { toast } from 'react-toastify';

const LuatBlog: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ChildrenServiceResponse[]>();

  useEffect(() => {
    const fetchPosts = async (Title: string) => {
      try {
        const response = await getChildrenServiceByTitle(Title);
        setPosts(response.data?.[0].children || []);
      } catch (error) {
        toast.error('Không thể lấy thông tin dịch vụ');
      }
    };
    fetchPosts('Dịch vụ sở hữu trí tuệ');
  }, []);

  const handleNavigate = (link: string) => {
    navigate(`${link}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Dịch vụ Sở hữu Trí tuệ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Luật Poip - Đơn vị hàng đầu cung cấp dịch vụ tư vấn và bảo hộ sở hữu trí tuệ
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(posts ?? []).map((post, index) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden hover:shadow-3xl hover:border-yellow-400/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => handleNavigate(post.href)}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden h-56">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Hover Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                  Xem chi tiết
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-2 min-h-[3.5rem]">
                  {post.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 line-clamp-3 min-h-[4.5rem] leading-relaxed">
                  {post.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center gap-2 text-blue-600 group-hover:text-orange-500 transition-colors duration-300 font-semibold">
                    <FileText className="w-5 h-5" />
                    <span>Tìm hiểu thêm</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {posts && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có dịch vụ nào</h3>
            <p className="text-gray-500">Vui lòng quay lại sau</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuatBlog;

import React, { useEffect, useState } from 'react';
import { FileText, ZoomIn, ExternalLink, } from 'lucide-react';
import {  useNavigate, useParams } from 'react-router-dom';
import { getChildrenServiceById } from '../../service/service';
import { ChildrenServiceResponse } from '../../types/service';
const LuatBlog: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? atob(id) : undefined;
  const [posts, setPosts] = useState<ChildrenServiceResponse[]>();
  
  useEffect(() => {
    const fetchPosts = async (decodedId : string) => {
      try {
        const response = await getChildrenServiceById(decodedId);
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    if (decodedId) {
      fetchPosts(decodedId);
    }
  }, [decodedId]);

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const mask = e.currentTarget.querySelector('.mask') as HTMLElement;
    if (mask) {
      mask.style.opacity = '1';
    }
  };

  const handleImageLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const mask = e.currentTarget.querySelector('.mask') as HTMLElement;
    if (mask) {
      mask.style.opacity = '0';
    }
  };

  const handleNagivate = (link: string , id : string) => {
    navigate(`${link}/${btoa(id)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Dịch vụ Sở hữu Trí tuệ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Luật ToTo - Đơn vị hàng đầu cung cấp dịch vụ tư vấn và bảo hộ sở hữu trí tuệ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(posts ?? []).map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image Container */}
              <div
                className="relative overflow-hidden h-64 cursor-pointer group"
                onMouseEnter={handleImageHover}
                onMouseLeave={handleImageLeave}
                onClick={() => handleNagivate(post.href, post.id)}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="mask absolute inset-0 bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-4">
                    <button className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition-all duration-200">
                      <ZoomIn className="w-5 h-5 text-gray-800" />
                    </button>
                    <button className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition-all duration-200">
                      <ExternalLink className="w-5 h-5 text-gray-800" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h2 
                  className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200 cursor-pointer line-clamp-2"
                  onClick={() => handleNagivate(post.href, post.id)}
                >
                  {post.title}
                </h2>

                {/* description */}
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {post.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">

                  <button 
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                    onClick={() => handleNagivate(post.href, post.id)}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Đọc thêm</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LuatBlog;
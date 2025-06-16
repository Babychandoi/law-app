import React, { useState } from 'react';
import { Heart, MessageCircle, FileText, ZoomIn, ExternalLink, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  imageUrl: string;
  slug: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  href: string;
}

const LuatBlog: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: 88,
      title: "Dịch vụ đăng ký mã số mã vạch",
      excerpt: "",
      date: "Tháng Ba 29, 2023",
      author: "Luật ToTo",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=550&h=400&fit=crop",
      slug: "ma-so-ma-vach",
      likes: 58,
      comments: 0,
      isLiked: false,
      href: "/barcodeNumber"
    },
    {
      id: 83,
      title: "Giấy phép Doanh nghiệp Khoa học Công nghệ",
      excerpt: "",
      date: "Tháng Ba 29, 2023",
      author: "Luật ToTo",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=549&fit=crop",
      slug: "doanh-nghiep-khoa-hoc-cong-nghe",
      likes: 57,
      comments: 0,
      isLiked: false,
      href: "/scienceTechnologyEnterprises"
    },
    {
      id: 81,
      title: "Đăng ký giấy phép mạng xã hội",
      excerpt: "",
      date: "Tháng Ba 29, 2023",
      author: "Luật ToTo",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=332&fit=crop",
      slug: "mang-xa-hoi",
      likes: 82,
      comments: 0,
      isLiked: false,
      href: "/socialMedia"
    },
    {
      id: 79,
      title: "Dịch vụ Tư vấn soạn thảo Hợp đồng",
      excerpt: "",
      date: "Tháng Ba 29, 2023",
      author: "Luật ToTo",
      imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=870&h=500&fit=crop",
      slug: "tu-van-soan-thao-hop-dong",
      likes: 80,
      comments: 0,
      isLiked: false,
      href: "/consultationOfDraftingContracts"
    }
  ]);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

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

  const handleNagivate = (link: string) => {
    navigate(`/service${link}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Date Label */}
              <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {post.date}
              </div>

              {/* Image Container */}
              <div
                className="relative overflow-hidden h-64 cursor-pointer group"
                onMouseEnter={handleImageHover}
                onMouseLeave={handleImageLeave}
                onClick={() => handleNagivate(post.href)}
              >
                <img
                  src={post.imageUrl}
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
                {/* Meta Information */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <div className="flex items-center mr-4">
                    <User className="w-4 h-4 mr-1" />
                    <span>Đăng bởi {post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>lúc {post.date}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 
                  className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200 cursor-pointer line-clamp-2"
                  onClick={() => handleNagivate(post.href)}
                >
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                    >
                      <Heart
                        className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                      />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>

                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                  </div>

                  <button 
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                    onClick={() => handleNagivate(post.href)}
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
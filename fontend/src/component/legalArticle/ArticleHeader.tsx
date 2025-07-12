import React, {useState } from 'react';
import { User, Calendar, FileText } from 'lucide-react';
interface HeaderProps {
  headerNew?: HeaderNews;
}
interface HeaderNews {
  title?: string;
  subtitle?: string;
  author?: string;
  createdAt?: Date;
  id?: string;
}
const ArticleHeader: React.FC <HeaderProps> = ({headerNew}) => {
  const [headers, setHeaders] = useState<HeaderNews>(headerNew || {});
  const data: HeaderNews = {
    id : "1",
    title: "Những điểm mới của Nghị định 65/2023/NĐ-CP",
    subtitle: "Hướng dẫn thực thi Luật Sở hữu Trí tuệ",
    author: "Luật ToTo",
    createdAt: new Date("2025-07-01T22:51:40.978+00:00"),

  };
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {headers?.title || data.title}
              </h1>
              <p className="text-gray-600 mt-1">{headers?.subtitle || data.subtitle}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-t pt-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Đăng bởi <strong>{headers?.author || data.author}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{(headers?.createdAt ? new Date(headers.createdAt).toLocaleString() : (data.createdAt ?? new Date()).toLocaleString())}</span>
            </div>
          </div>
    </div>
  );
};

export default ArticleHeader;
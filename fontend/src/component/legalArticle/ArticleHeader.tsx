import React from 'react';
import { User, Calendar, FileText } from 'lucide-react';

const ArticleHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Những điểm mới của Nghị định 65/2023/NĐ-CP
          </h1>
          <p className="text-gray-600 mt-1">Hướng dẫn thực thi Luật Sở hữu Trí tuệ</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-t pt-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Đăng bởi <strong>Luật ToTo</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Tháng Chín 26, 2023</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleHeader;
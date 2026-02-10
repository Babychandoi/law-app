import { useState } from "react";
import { News } from "../../../../../types/service";
import { Upload, X } from "lucide-react";
import React from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface AddNewsProps {
  onSave: (news: News, file : File ) => void;
  onCancel: () => void;
}

const AddNews: React.FC<AddNewsProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    author: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error,setError] = useState<string>("");
  const [fullContent, setFullContent] = useState<string>("");

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Vui lòng chọn file hình ảnh (JPEG, PNG, GIF, WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setFormData(prev => ({
        ...prev,
        image: ""
      }));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      image: value
    }));
    
    if (value) {
      setImageFile(null);
      setImagePreview("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subtitle || !formData.author || (!formData.image && !imageFile)) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    
    if (!fullContent.trim()) {
      setError("Vui lòng nhập nội dung bài viết.");
      return;
    }
    
    setError("");
    const newsData: any = {
      ...formData,
      image: formData.image,
      fullContent: fullContent
    };
    onSave(newsData, imageFile as File);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-100">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">Thêm tin tức mới</h3>
            <button
              onClick={onCancel}
              className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-2xl font-bold hover:scale-110 active:scale-95 transition-all duration-200"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Thông tin cơ bản */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tác giả *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phụ đề *
              </label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                required
              />
            </div>
            
            {/* Image Upload Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh *
              </label>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Tải lên file hình ảnh
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click để tải lên</span> hoặc kéo thả file vào đây
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Hoặc nhập URL hình ảnh
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              {(imagePreview || formData.image) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xem trước hình ảnh
                  </label>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  {imageFile && (
                    <p className="text-sm text-gray-500 mt-2">
                      File: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Nội dung bài viết</h4>
            
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6">
              <div>
                <div className="bg-white rounded-xl overflow-hidden" style={{ border: '2px solid #d1d5db' }}>
                  <ReactQuill
                    theme="snow"
                    value={fullContent}
                    onChange={setFullContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Paste toàn bộ nội dung bài viết vào đây... Bạn có thể paste cả hình ảnh (Ctrl+V)"
                    style={{ minHeight: '400px' }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600 flex items-center justify-between">
                  <span></span>
                  <span>{fullContent.replace(/<[^>]*>/g, '').length} ký tự</span>
                </div>
              </div>
              
              {fullContent.trim() && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-xl">✓</span>
                    <span className="font-semibold">Nội dung đã sẵn sàng!</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <span className="text-red-700 font-medium flex-1">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Lưu tin tức
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNews;

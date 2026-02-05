import { useState } from "react";
import { News, SectionNews } from "../../../../../types/service";
import { BookOpen, FileText, Shield, Globe, Award, AlertTriangle, Upload, X } from "lucide-react";
import React from "react";

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
  const [sections, setSections] = useState<Omit<SectionNews, "id">[]>([]);
  const [currentSection, setCurrentSection] = useState({
    title: "",
    content: "",
    icon: "BOOKOPEN" as const,
  });

  const iconOptions = [
    { value: "BOOKOPEN", label: "📖 Thông tin   ", icon: BookOpen },
    { value: "FILETEXT", label: "📝 Nội dung", icon: FileText },
    { value: "SHIELD", label: "🛡️ Lưu ý", icon: Shield },
    { value: "GLOBE", label: "🌎 Thông tin chung", icon: Globe },
    { value: "AWARD", label: "🏆 Hướng dẫn", icon: Award },
    { value: "ALERTTRIANGLE", label: "⚠️ Cảnh báo", icon: AlertTriangle },
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
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Vui lòng chọn file hình ảnh (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear the URL field when file is selected
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
    
    // Clear file upload when URL is entered
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

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentSection(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSection = () => {
    if (currentSection.title && currentSection.content) {
      setSections(prev => [...prev, { ...currentSection }]);
      setCurrentSection({
        title: "",
        content: "",
        icon: "BOOKOPEN",
      });
    }
  };

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subtitle || !formData.author || (!formData.image && !imageFile)) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    setError("");
    
        const newsData :News = {
          ...formData,
          image: formData.image,
          sections: sections
        };
        onSave(newsData, imageFile as File);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Thêm tin tức mới</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Enhanced Image Upload Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh *
              </label>
              
              {/* File Upload Option */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Tải lên file hình ảnh
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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

              {/* URL Input Option */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xem trước hình ảnh
                  </label>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
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

          {/* Thêm phần nội dung */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Thêm phần nội dung</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề phần
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={currentSection.title}
                    onChange={handleSectionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biểu tượng
                  </label>
                  <select
                    name="icon"
                    value={currentSection.icon}
                    onChange={handleSectionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung
                </label>
                <textarea
                  name="content"
                  value={currentSection.content}
                  onChange={handleSectionChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={addSection}
                disabled={!currentSection.title || !currentSection.content}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                Thêm phần
              </button>
            </div>
          </div>

          {/* Danh sách các phần đã thêm */}
          {sections.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Các phần nội dung ({sections.length})
              </h4>
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">
                          {iconOptions.find(opt => opt.value === section.icon)?.icon && 
                            React.createElement(iconOptions.find(opt => opt.value === section.icon)?.icon ?? (() => null))}
                        </span>
                        <h6 className="font-medium text-gray-800">
                          {index + 1}. {section.title}
                        </h6>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{section.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Lưu tin tức
            </button>
            {error && (
            <div className="text-red-600 mt-2">
                {error}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNews;
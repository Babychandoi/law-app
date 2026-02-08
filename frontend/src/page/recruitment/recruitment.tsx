import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Calendar, Building } from 'lucide-react';
import { Job } from '../../types/service';
import { getJobs, searchJobs } from '../../service/service';
import { jobListingConfig } from './jobData';
import {Seo } from '../../component/Seo';
import ChoosePoip from '../../component/recruitment/ChoosePoip';
const JobListing: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await getJobs();
        setJobs(response.data);
      } catch (error) {
        setError('Không thể tải danh sách công việc. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const navigateToJobDetail = (jobId: string) => {
    navigate(`vi-tri/${btoa(jobId)}`);
  };

  const [filters, setFilters] = useState({
    keywords: '',
    category: jobListingConfig.categories[0].value,
    jobType: jobListingConfig.jobTypes[0].value,
    location: jobListingConfig.locations[0].value,
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true); // hiển thị trạng thái loading ngay lập tức

    setTimeout(async () => {
      try {
        const formData = {
          keywords: filters.keywords.trim(),
          category: filters.category !== '-1'
            ? jobListingConfig.categories.find(category => category.value === filters.category)?.label || ''
            : '',
          jobType: filters.jobType !== '-1'
            ? jobListingConfig.jobTypes.find(jobType => jobType.value === filters.jobType)?.label || ''
            : '',
          location: filters.location !== '-1'
            ? jobListingConfig.locations.find(location => location.value === filters.location)?.label || ''
            : '',
        };


        const response = await searchJobs(formData);
        setJobs(response.data);
      } catch (error) {
        setError('Không tìm thấy công việc phù hợp. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }, 500); // độ trễ 500ms
  };
  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '20px' }}>
      <Seo title="Tuyển dụng - Luật Poip"
        keywords='Tuyển dụng, việc làm, cơ hội nghề nghiệp, luật sư, Luật Poip'
        description="Khám phá cơ hội nghề nghiệp tại Luật Poip. Tham gia đội ngũ chuyên nghiệp của chúng tôi và phát triển sự nghiệp trong lĩnh vực pháp luật." />  
      {/* Tiêu đề trang */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Tuyển dụng
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Gia nhập đội ngũ chuyên nghiệp của Luật Poip - Nơi bạn phát triển sự nghiệp cùng chúng tôi
        </p>
        <div className="w-24 h-1 bg-[#f2c64d] mx-auto">
        </div>
      </div>
      <ChoosePoip />
      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
              <label className="sr-only" htmlFor="keywords">
                {jobListingConfig.filterLabels.keywords}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="keywords"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={jobListingConfig.filterLabels.keywords}
                  value={filters.keywords}
                  onChange={(e) => handleFilterChange('keywords', e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {jobListingConfig.categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
              >
                {jobListingConfig.jobTypes.map((jobType) => (
                  <option key={jobType.value} value={jobType.value}>
                    {jobType.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                {jobListingConfig.locations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Tìm kiếm
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Danh sách việc làm */}
      {loading ? (
        <div className="container mx-auto px-4 py-8 space-y-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      <button
                        onClick={() => navigateToJobDetail(job.id)}
                        className="hover:text-blue-600 transition-colors duration-200 text-left"
                      >
                        {job.title}
                      </button>
                    </h4>
                    {job.company && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building className="w-4 h-4 mr-2" />
                        <span>{job.company}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={() => navigateToJobDetail(job.id)}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Nộp đơn
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{job.jobType}</span>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    <span>{job.location}</span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                    <span>{new Date(job.postedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>)
      }
      {/* Thông báo không có kết quả */}
      {jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            Không có việc làm nào phù hợp với tiêu chí tìm kiếm của bạn.
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListing;

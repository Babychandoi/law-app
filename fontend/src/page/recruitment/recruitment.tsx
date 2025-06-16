import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Calendar, Building } from 'lucide-react';
import { jobs, jobListingConfig } from './jobData';

const JobListing: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    keywords: '',
    category: '-1',
    jobType: '-1',
    location: '-1'
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic tìm kiếm được xử lý trong filteredJobs
  };

  const filteredJobs = jobs.filter(job => {
    return (
      (filters.keywords === '' || 
       job.title.toLowerCase().includes(filters.keywords.toLowerCase()) ||
       (job.company && job.company.toLowerCase().includes(filters.keywords.toLowerCase()))) &&
      (filters.category === '-1' || job.category === filters.category) &&
      (filters.jobType === '-1' || job.jobType === filters.jobType) &&
      (filters.location === '-1' || job.location === filters.location)
    );
  });

  const navigateToJobDetail = (jobId: number) => {
    navigate(`/recruitment/${jobId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tiêu đề trang */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-800">
          <span className="border-b-2 border-blue-500 pb-2">{jobListingConfig.title}</span>
        </h3>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tìm kiếm theo từ khóa */}
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

            {/* Các bộ lọc khác */}
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

            {/* Nút tìm kiếm */}
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
      <div className="space-y-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
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
                  <span>{job.postedDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Thông báo không có kết quả */}
      {filteredJobs.length === 0 && (
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
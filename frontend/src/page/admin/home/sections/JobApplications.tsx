import React, { useEffect, useState } from 'react';
import { Briefcase, Download, Eye, Calendar, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getAllJobApplications, 
  updateApplicationStatus,
  JobApplication 
} from '../../../../service/jobApplication';

interface Job {
  id: string;
  title: string;
  applications: JobApplication[];
}

const JobApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [groupedApplications, setGroupedApplications] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getAllJobApplications();

      if (response.code === 200) {
        const apps = response.data;
        setApplications(apps);
        
        // Group by job
        const grouped = apps.reduce((acc: any, app: JobApplication) => {
          const existing = acc.find((j: Job) => j.id === app.jobId);
          if (existing) {
            existing.applications.push(app);
          } else {
            acc.push({
              id: app.jobId,
              title: app.jobTitle,
              applications: [app]
            });
          }
          return acc;
        }, []);
        
        setGroupedApplications(grouped);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Không thể tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateApplicationStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchApplications();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWING': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'REVIEWING': return 'Đang xem xét';
      case 'ACCEPTED': return 'Chấp nhận';
      case 'REJECTED': return 'Từ chối';
      default: return status;
    }
  };

  const filteredApplications = selectedJob === 'all' 
    ? applications 
    : applications.filter(app => app.jobId === selectedJob);

  const handlePreview = (cvUrl: string) => {
    // MinIO URLs can be opened directly for preview
    window.open(cvUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý ứng viên</h1>
            <p className="text-gray-600 mt-1">
              Tổng số: {applications.length} ứng viên từ {groupedApplications.length} vị trí
            </p>
          </div>
          <Briefcase className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Filter by Job */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lọc theo vị trí tuyển dụng
        </label>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tất cả vị trí ({applications.length})</option>
          {groupedApplications.map(job => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.applications.length})
            </option>
          ))}
        </select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có ứng viên nào</p>
          </div>
        ) : (
          filteredApplications.map(app => (
            <div key={app.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {app.candidateName}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {app.jobTitle}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${app.candidateEmail}`} className="hover:text-blue-600">
                      {app.candidateEmail}
                    </a>
                  </div>
                  {app.candidatePhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${app.candidatePhone}`} className="hover:text-blue-600">
                        {app.candidatePhone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(app.appliedDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => handlePreview(app.cvFileUrl)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Xem CV
                  </button>
                  <a
                    href={app.cvFileUrl.replace('/upload/', '/upload/fl_attachment/')}
                    download={app.cvFileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Tải xuống
                  </a>
                  
                  {/* Status Update Buttons */}
                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'REVIEWING')}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Đang xem xét
                    </button>
                  )}
                  {(app.status === 'PENDING' || app.status === 'REVIEWING') && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobApplications;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Upload, Loader2 } from 'lucide-react';
import { Job } from '../../types/service';
import { getJobById } from '../../service/service';
import { submitJobApplication } from '../../service/jobApplication';
import { toast } from 'react-toastify';
import {Seo } from '../../component/Seo';

const JobComponent : React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const decodedId = id ? atob(id) : undefined;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [job,setJob] = useState<Job>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: ''
    });

    useEffect(() => {
        const fetchJob = async () => {
        if (decodedId) {
                try {
                    const response = await getJobById(decodedId);
                    setJob(response.data);
                } catch (error) {
                    toast.error('Không thể lấy thông tin công việc');
                }
            }
        };
        fetchJob();
    },[decodedId])
    
    if (!job) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white">
                <h1 className="text-2xl font-bold text-red-500">Không tìm thấy công việc</h1>
                <button
                    onClick={() => navigate('/tuyen-dung')}
                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Chỉ chấp nhận file PDF, DOC, hoặc DOCX');
                return;
            }
            
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Kích thước file không được vượt quá 10MB');
                return;
            }
            
            setSelectedFile(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        // Validation
        if (!formData.candidateName.trim()) {
            toast.error('Vui lòng nhập họ tên');
            return;
        }
        
        if (!formData.candidateEmail.trim()) {
            toast.error('Vui lòng nhập email');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.candidateEmail)) {
            toast.error('Email không hợp lệ');
            return;
        }
        
        if (!selectedFile) {
            toast.error('Vui lòng đính kèm CV của bạn');
            return;
        }

        setLoading(true);

        try {
            // Create FormData
            const submitData = new FormData();
            submitData.append('jobId', job.id);
            submitData.append('jobTitle', job.title);
            submitData.append('candidateName', formData.candidateName);
            submitData.append('candidateEmail', formData.candidateEmail);
            if (formData.candidatePhone) {
                submitData.append('candidatePhone', formData.candidatePhone);
            }
            submitData.append('cvFile', selectedFile);

            // Submit to backend
            const response = await submitJobApplication(submitData);
            
            if (response.code === 200) {
                toast.success('Nộp đơn ứng tuyển thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
                
                // Reset form
                setFormData({
                    candidateName: '',
                    candidateEmail: '',
                    candidatePhone: ''
                });
                setSelectedFile(null);
                
                // Navigate back after 2 seconds
                setTimeout(() => {
                    navigate('/tuyen-dung');
                }, 2000);
            } else {
                toast.error(response.message || 'Có lỗi xảy ra khi nộp đơn');
            }
        } catch (error: any) {
            console.error('Error submitting application:', error);
            toast.error(error.response?.data?.message || 'Không thể nộp đơn ứng tuyển. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const ListWithBullets = ({ items, bulletColor = 'bg-blue-500' }: { items: string[], bulletColor?: string }) => (
        <ul className="space-y-3 text-gray-700">
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                    <span className={`w-2 h-2 ${bulletColor} rounded-full mt-2 flex-shrink-0`}></span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white" style={{marginTop : "30px"}} >
            <Seo title={job.title + " - Luật Poip"}
                keywords='Tuyển dụng, việc làm, cơ hội nghề nghiệp, luật sư, Luật Poip'
                description={job.title + " tại Luật Poip. Tham gia đội ngũ chuyên nghiệp của chúng tôi và phát triển sự nghiệp trong lĩnh vực pháp luật."} />   
            {/* Header */}
            <header className="mb-8">
                <div className="border-b pb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {job.title}
                    </h1>

                    <div className="flex flex-wrap gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>{new Date(job.postedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Mô tả công việc</h2>
                <ListWithBullets items={job.description} />
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Yêu cầu công việc</h2>
                <ListWithBullets items={job.requirements} bulletColor="bg-red-500" />
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Phúc lợi</h2>
                <ListWithBullets items={job.benefits} bulletColor="bg-green-500" />
            </section>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông tin ứng viên</h3>
                
                <div>
                    <label className="block text-gray-700 font-medium mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="candidateName"
                        value={formData.candidateName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="candidateEmail"
                        value={formData.candidateEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">
                        Số điện thoại
                    </label>
                    <input
                        type="tel"
                        name="candidatePhone"
                        value={formData.candidatePhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0123456789"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">
                        Tải lên CV của bạn <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                            id="cv-upload"
                            required
                        />
                        <label
                            htmlFor="cv-upload"
                            className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
                        >
                            <Upload className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="text-gray-600">
                                {selectedFile ? selectedFile.name : 'Chọn file CV (PDF, DOC, DOCX - Max 10MB)'}
                            </span>
                        </label>
                    </div>
                    {selectedFile && (
                        <p className="mt-2 text-sm text-green-600">
                            ✓ Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang gửi...
                        </>
                    ) : (
                        'Nộp đơn ứng tuyển'
                    )}
                </button>
            </form>
        </div>
    );
};

export default JobComponent;
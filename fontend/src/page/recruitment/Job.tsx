import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { Job } from '../../types/service';
import { getJobById } from '../../service/service';
const JobComponent : React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [job,setJob] = useState<Job>();
    useEffect(() => {
        const fetchJob = async () => {
        if (id) {
                try {
                    const response = await getJobById(id);
                    setJob(response.data);
                } catch (error) {
                    console.error('Error fetching job:', error);
                }
            }
        };
        fetchJob();
    },[id])
    if (!job) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white">
                <h1 className="text-2xl font-bold text-red-500">Không tìm thấy công việc</h1>
                <button
                    onClick={() => navigate('/recruitment')}
                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedFile) {
            alert('Vui lòng đính kèm CV của bạn');
            return;
        }
        alert(`Đã nộp đơn ứng tuyển thành công cho vị trí ${job.title}!`);
        navigate('/jobs');
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
        <div className="max-w-4xl mx-auto p-6 bg-white">
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
                            <span>{job.postedDate}</span>
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

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <label className="block">
                    <span className="text-gray-700 font-medium">Tải lên CV của bạn</span>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="mt-2 block w-full border border-gray-300 p-2 rounded-md"
                    />
                </label>
                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Nộp đơn
                </button>
            </form>
        </div>
    );
};

export default JobComponent;
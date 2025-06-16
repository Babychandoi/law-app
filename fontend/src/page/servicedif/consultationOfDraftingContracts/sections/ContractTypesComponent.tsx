import React from 'react';
import { FileText, Scale, Briefcase, Users } from 'lucide-react';

interface ContractType {
    id: number;
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

const ContractTypesComponent: React.FC = () => {
    const contractTypes: ContractType[] = [
        {
            id: 1,
            name: "Hợp đồng lao động",
            icon: <Users className="w-6 h-6" />,
            color: "text-blue-600",
            bgColor: "bg-blue-50 hover:bg-blue-100"
        },
        {
            id: 2,
            name: "Hợp đồng mua bán",
            icon: <Briefcase className="w-6 h-6" />,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50 hover:bg-emerald-100"
        },
        {
            id: 3,
            name: "Hợp đồng cung cấp dịch vụ",
            icon: <FileText className="w-6 h-6" />,
            color: "text-purple-600",
            bgColor: "bg-purple-50 hover:bg-purple-100"
        },
        {
            id: 4,
            name: "Hợp đồng thuê tài sản",
            icon: <Scale className="w-6 h-6" />,
            color: "text-orange-600",
            bgColor: "bg-orange-50 hover:bg-orange-100"
        },
        {
            id: 5,
            name: "Hợp đồng đại lý",
            icon: <Users className="w-6 h-6" />,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50 hover:bg-indigo-100"
        },
        {
            id: 6,
            name: "Hợp đồng nhượng quyền thương mại",
            icon: <Briefcase className="w-6 h-6" />,
            color: "text-rose-600",
            bgColor: "bg-rose-50 hover:bg-rose-100"
        },
        {
            id: 7,
            name: "Hợp đồng hợp tác",
            icon: <Users className="w-6 h-6" />,
            color: "text-teal-600",
            bgColor: "bg-teal-50 hover:bg-teal-100"
        },
        {
            id: 8,
            name: "Hợp đồng thuê/cho thuê",
            icon: <FileText className="w-6 h-6" />,
            color: "text-cyan-600",
            bgColor: "bg-cyan-50 hover:bg-cyan-100"
        },
        {
            id: 9,
            name: "Hợp đồng nguyên tắc/gia công",
            icon: <Scale className="w-6 h-6" />,
            color: "text-amber-600",
            bgColor: "bg-amber-50 hover:bg-amber-100"
        },
        {
            id: 10,
            name: "Các loại Hợp đồng dịch vụ khác",
            icon: <Briefcase className="w-6 h-6" />,
            color: "text-slate-600",
            bgColor: "bg-slate-50 hover:bg-slate-100"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute top-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
                    <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
                </div>

                <div className="relative py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="text-center mb-16">
                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-60 animate-pulse"></div>
                                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full shadow-2xl">
                                        <Scale className="w-16 h-16 text-white" />
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 leading-tight">
                                CÁC DẠNG HỢP ĐỒNG
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 mb-8">
                                MÀ LUẬT TOTO TƯ VẤN SOẠN THẢO
                            </h2>
                            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
                        </div>

                        {/* Contract Types Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {contractTypes.map((contract, index) => (
                                <div
                                    key={contract.id}
                                    className={`group relative ${contract.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 backdrop-blur-sm`}
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    {/* Card number */}
                                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                                        <span className="text-lg font-bold text-slate-700">
                                            {contract.id}
                                        </span>
                                    </div>

                                    {/* Hover effect overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <div className={`inline-flex p-4 rounded-2xl ${contract.color} mb-6 bg-white/80 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                            {contract.icon}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors duration-300">
                                            {contract.name}
                                        </h3>

                                        {/* Decorative line */}
                                        <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover:w-24 transition-all duration-300"></div>
                                    </div>

                                    {/* Subtle pattern overlay */}
                                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-45"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Call to Action */}
                        <div className="mt-20 text-center">
                            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/50 max-w-4xl mx-auto">
                                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                                    Cần hỗ trợ tư vấn pháp lý?
                                </h3>
                                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                    Đội ngũ luật sư chuyên nghiệp của TAGA sẵn sàng hỗ trợ bạn soạn thảo và tư vấn chi tiết cho từng loại hợp đồng
                                </p>
                                <button
                                    className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold 
                                text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg 
                                hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                                    onClick={() => {
                                        const contactForm = document.getElementById('contact-form');
                                        if (contactForm) {
                                            contactForm.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }
                                    }>
                                    <span className="relative z-10">Liên hệ ngay</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractTypesComponent;
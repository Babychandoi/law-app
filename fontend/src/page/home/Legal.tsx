import React, { useEffect } from 'react';
import { Scale, Shield, Lightbulb, Palette, Sword, BarChart3, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceItem } from '../../types/service';
import { getServiceHome } from '../../service/service';
import { toast } from 'react-toastify';
const LegalServicesSection: React.FC = () => {
  const [services , setServices] = React.useState<ServiceItem[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServiceHome();
        if (response && response.data) {
          setServices(response.data);
        } else {
          toast.warning('Không có dữ liệu dịch vụ nào được trả về!');
        }
      } catch (error) {
        toast.error('Lỗi khi tải danh sách dịch vụ. Vui lòng thử lại!');
      }
    };
    fetchServices();
  }, []);
  
  const handleServiceClick = (link: string,id : string) => {
    navigate(`${link}/${btoa(id)}`);
  };
  const icon  = (iconName: string) => {
    switch (iconName) {
      case 'scale':
        return <Scale className="w-12 h-12 text-yellow-500" />;
      case 'shield':
        return <Shield className="w-12 h-12 text-yellow-500" />;
      case 'lightbulb':
        return <Lightbulb className="w-12 h-12 text-yellow-500" />;
      case 'palette':
        return <Palette className="w-12 h-12 text-yellow-500" />;
      case 'sword':
        return <Sword className="w-12 h-12 text-yellow-500" />;
      case 'barChart3':
        return <BarChart3 className="w-12 h-12 text-yellow-500" />;
      case 'fileText':
        return <FileText className="w-12 h-12 text-yellow-500" />;
      case 'users':
        return <Users className="w-12 h-12 text-yellow-500" />;
      default:
        return null;
    }
  }
  return (
    <div className="min-h-screen">
      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="text-center group cursor-pointer p-6 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => handleServiceClick(service.href,service.id)}
              >
                <div className="flex justify-center mb-6">
                  <div className="transform group-hover:scale-110 transition-transform duration-300 bg-yellow-50 p-4 rounded-full">
                    {icon(service.icon)}
                  </div>
                </div>
                <h5 className="text-lg font-semibold mb-4 text-gray-800 group-hover:text-yellow-600 transition-colors duration-300">
                  {service.title}
                </h5>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalServicesSection;
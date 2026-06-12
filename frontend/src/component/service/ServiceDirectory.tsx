import { ArrowRight, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getChildrenServiceByTitle } from '../../service/service';
import { ChildrenServiceResponse } from '../../types/service';

interface ServiceDirectoryProps {
  serviceTitle: string;
  heading: string;
  description: string;
}

const ServiceDirectory = ({ serviceTitle, heading, description }: ServiceDirectoryProps) => {
  const [services, setServices] = useState<ChildrenServiceResponse[]>();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getChildrenServiceByTitle(serviceTitle);
        setServices(response.data?.[0].children || []);
      } catch (error) {
        toast.error('Không thể lấy thông tin dịch vụ');
      }
    };

    fetchServices();
  }, [serviceTitle]);

  return (
    <section className="bg-brand-surface py-14 sm:py-16" aria-labelledby="service-directory-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-goldDark">
            Hướng dẫn dịch vụ
          </p>
          <h1
            id="service-directory-title"
            className="text-3xl font-semibold leading-tight text-brand-ink md:text-4xl"
          >
            {heading}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-brand-muted">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(services ?? []).map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-lg border border-brand-line bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-brand-gold hover:shadow-soft"
            >
              <Link
                to={service.href}
                className="group flex h-full flex-col focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  width={400}
                  height={192}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-brand-surface text-brand-goldDark">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold leading-7 text-brand-ink group-hover:text-brand-goldDark">
                    {service.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-brand-muted">
                    {service.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-goldDark">
                    Tìm hiểu dịch vụ
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {services && services.length === 0 && (
          <div className="rounded-lg border border-brand-line bg-white px-6 py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-brand-goldDark" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-brand-ink">Chưa có dịch vụ nào</h2>
            <p className="mt-2 text-brand-muted">Vui lòng quay lại sau.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceDirectory;

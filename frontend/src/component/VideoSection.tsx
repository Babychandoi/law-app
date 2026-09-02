import { CheckCircle2, PlayCircle } from 'lucide-react';

const principles = [
  'Đội ngũ am hiểu sở hữu trí tuệ và pháp lý doanh nghiệp',
  'Quy trình rõ ràng, dễ theo dõi theo từng giai đoạn',
  'Trao đổi thực tế, tập trung vào quyết định của khách hàng',
];

export default function VideoSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="video-heading">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14">
        <div className="overflow-hidden rounded-lg border border-brand-line bg-brand-ink shadow-soft">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/mdE0caGDfrE"
              title="Giới thiệu về Luật Poip Legal"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex items-center gap-3 border-t border-white/15 px-5 py-4 text-white">
            <PlayCircle className="shrink-0 text-brand-gold" size={22} aria-hidden="true" />
            <p className="text-sm font-medium">
              Tìm hiểu cách Luật Poip Legal đồng hành cùng khách hàng
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-goldDark">Gặp gỡ Luật Poip Legal</p>
          <h2
            id="video-heading"
            className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-gray-950 md:text-4xl"
          >
            Một đối tác pháp lý dễ trao đổi và đáng tin cậy
          </h2>
          <p className="mt-5 text-base leading-8 text-gray-700">
            Xem video giới thiệu để hiểu thêm về cách đội ngũ tiếp cận nhu cầu, giải thích lựa chọn
            và hỗ trợ khách hàng trong quá trình xử lý công việc.
          </p>
          <ul className="mt-7 divide-y divide-brand-line border-y border-brand-line">
            {principles.map((principle) => (
              <li
                key={principle}
                className="flex items-start gap-3 py-4 text-sm leading-6 text-gray-700"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-brand-goldDark"
                  aria-hidden="true"
                />
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

import ConsultationForm from '../../../component/Consultation';
import Contact from './Contact';

export default function Consultation() {
  return (
    <div aria-label="Tư vấn và thông tin liên hệ">
      <ConsultationForm />

      <section className="bg-brand-surface py-12 sm:py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-brand-line bg-white shadow-soft">
            <Contact />
          </div>
        </div>
      </section>
    </div>
  );
}

// src/components/layout/Banner.tsx
interface BannerProps {
    imageUrl: string;
    alt: string;
  }
  
  export const Banner = ({ imageUrl, alt }: BannerProps) => (
    <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      <img 
        src={imageUrl} 
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
  
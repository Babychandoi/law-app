// types/index.ts
export interface Service {
    title: string;
    items: string[];
  }
  
  export interface HeroSectionProps {
    title: string;
    subtitle: string;
  }
  
  export interface AboutSectionProps {
    title: string;
    content: string[];
    image: string;
  }
  
  export interface ServicesSectionProps {
    title: string;
    services: Service[];
    image: string;
  }
  
  export interface TeamSectionProps {
    title: string;
    content: string[];
    image: string;
  }
  
  export interface ContactSectionProps {
    title: string;
    buttonText: string;
  }
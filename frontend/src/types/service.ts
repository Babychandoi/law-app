export interface Service {
    id :string;
    title :string;
    description?:string;
    href :string;
}
export interface ServiceResponse {
    id :string;
    title :string;
    href :string;
    children?: Service[];
}
export interface ChildrenServiceResponse{
    id :string;
    title :string;
    href :string;
    description?: string;
    image?: string;
}
export interface PricingPlan {
    id: string;
    title: string;
    price: string;
    currency?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    features?: (string | { text: string })[];
    featured?: boolean;
    buttonText?: string;
    customContent?: React.ReactNode;
  }
  export interface Hero {
    title: string;
    subtitle: string;
    description: string;
  }
export interface Process {
    id: string;
    step: string;
    title: string;
    description: string;
    details?: ProcessDetail[];
}
export interface ProcessDetail {
    desc : string;
    type: string;
    accuracy?: string;
    time?: string;
}
export interface PreviousPartner{
    id: string;
    title : string;
    image :string;
    shortName : string;
}
export interface ProcessStep {
    title: string;
    description: string;
    icon?: string;
    color?: 'blue' | 'emerald' | 'purple' | 'orange';
    duration?: string;
  }
export interface ServiceItem {
    icon: string;
    title: string;
    description: string;
    href: string;
    id : string;
    color?: string;
  }
  export interface CustomerService {
    name: string;
    email: string;
    phone: string;
    serviceId: string;
    description: string;
  }
  export interface Job {
    id: string;
    title: string;
    company?: string;
    jobType: string;
    location: string;
    postedDate: string;
    description: string[];
    requirements: string[];
    benefits: string[];
    category: string;
  }
  export interface News {
    id?: string;
    title: string;
    subtitle: string;
    createdAt?: Date;
    author: string;
    image? : string;
    sections? : SectionNews[];
  }
  export interface SectionNews{
    id?: string;
    title: string;
    content: string;
    icon: string;
  }
export interface BreadcrumbItem {
  name: string;
  href: string;
}


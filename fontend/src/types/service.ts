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
  
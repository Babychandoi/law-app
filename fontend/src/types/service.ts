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
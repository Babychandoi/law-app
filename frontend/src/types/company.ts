export interface Company {
    id: string;
    name: string;
    representative: string;
    taxCode: string;
    websiteName: string;
    email: string;
  }
  export interface Location {
    id: string;
    type: string;
    address: string;
    color: string;
  }
  export interface PhoneContact {
    id: string;
    label: string;
    number: string;
    color: string;
  }
  export interface Important {
    id: string;
    icon: string; // icon name, e.g., "Shield", "FileText"
    text: string;
    href: string;
    color: string;
  }
  export interface Social {
    id: string;
    icon: string; // icon name, e.g., "Facebook", "Linkedin"
    href: string;
    label: string;
    color: string;
  }
  export interface TotoCompany{
    company: Company;
    locations: Location[];
    phoneContacts: PhoneContact[];
    importants: Important[];
    socials: Social[];
  }
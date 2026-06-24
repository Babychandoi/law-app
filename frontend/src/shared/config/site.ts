import {
  Award,
  Barcode,
  Briefcase,
  Building2,
  Copyright,
  FileText,
  Home,
  Lightbulb,
  MessageCircle,
  Newspaper,
  Share2,
  Shield,
  Sparkles,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { ServiceResponse } from '../../types/service';

export const contactInfo = {
  hotline: '0947.600.064',
  phoneHref: 'tel:0947600064',
  email: 'luatpoip@gmail.com',
  emailHref: 'mailto:luatpoip@gmail.com',
  zaloHref: 'https://zalo.me/0947600064',
  messengerHref: 'https://m.me/61577813197981',
  mapHref: 'https://maps.app.goo.gl/JgpZ9sgqkDv3Y9NU7',
};

export const menuItems: ServiceResponse[] = [
  { id: 'home', title: 'Trang chủ', href: '/' },
  { id: 'about', title: 'Về chúng tôi', href: '/ve-chung-toi' },
  {
    id: 'services',
    title: 'Sở hữu trí tuệ',
    href: '/dich-vu',
    children: [
      {
        id: 'service1',
        title: 'Đăng ký nhãn hiệu',
        href: '/dang-ky-bao-ho-nhan-hieu',
      },
      {
        id: 'service2',
        title: 'Bảo hộ kiểu dáng công nghiệp',
        href: '/bao-ho-kieu-dang-cong-nghiep',
      },
      {
        id: 'service3',
        title: 'Xử lý xâm phạm sở hữu trí tuệ',
        href: '/xu-ly-xam-pham',
      },
      {
        id: 'service4',
        title: 'Bảo hộ sáng chế, giải pháp hữu ích',
        href: '/bao-ho-sang-che-giai-phap-huu-ich',
      },
      {
        id: 'service5',
        title: 'Đăng ký bản quyền',
        href: '/dang-ky-bao-ho-ban-quyen',
      },
    ],
  },
  {
    id: 'other-services',
    title: 'Dịch vụ khác',
    href: '/dich-vu-khac',
    children: [
      { id: 'service6', title: 'Mã số mã vạch', href: '/ma-so-ma-vach' },
      {
        id: 'service7',
        title: 'Doanh nghiệp khoa học công nghệ',
        href: '/giay-phep-doanh-nghiep-khoa-hoc-cong-nghe',
      },
      {
        id: 'service8',
        title: 'Giấy phép mạng xã hội',
        href: '/dang-ky-giay-phep-mang-xa-hoi',
      },
      {
        id: 'service9',
        title: 'Tư vấn soạn thảo hợp đồng',
        href: '/tu-van-soan-thao-hop-dong',
      },
    ],
  },
  { id: 'news', title: 'Bản tin', href: '/tin-tuc' },
  { id: 'qa', title: 'Tuyển dụng', href: '/tuyen-dung' },
  { id: 'contact', title: 'Liên hệ', href: '/lien-he' },
];

export const menuIconMap = {
  home: Home,
  about: Users,
  services: Shield,
  'other-services': Briefcase,
  news: Newspaper,
  qa: Users,
  contact: MessageCircle,
  service1: Award,
  service2: Sparkles,
  service3: AlertTriangle,
  service4: Lightbulb,
  service5: Copyright,
  service6: Barcode,
  service7: Building2,
  service8: Share2,
  service9: FileText,
};

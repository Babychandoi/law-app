import { RouteObject } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import About from '../page/aboutUs';
import Contact from '../page/contact';
import Home from '../page/home/Home';
import Job from '../page/recruitment/Job';
import Recruitment from '../page/recruitment/recruitment';
import Brand from '../page/service/brand';
import CopyRight from '../page/service/copyright';
import Design from '../page/service/design';
import Invention from '../page/service/invention';
import Service from '../page/service';
import Violate from '../page/service/violate';
import BarcodeNumber from '../page/servicedif/barcodeNumber';
import ConsultationOfDraftingContracts from '../page/servicedif/consultationOfDraftingContracts';
import ServiceDif from '../page/servicedif';
import ScienceTechnologyEnterprises from '../page/servicedif/scienceTechnologyEnterprises';
import SocialMedia from '../page/servicedif/socialMedia';
import News from '../page/news';
import NewsDetail from '../page/news/section/New';
import Login from '../page/admin/login/login';
import AdminHome from '../page/admin/home';
import ChatManagement from '../page/admin/home/sections/Chat';
import CustomerManagement from '../page/admin/home/sections/Customer';
import EmployeeManagement from '../page/admin/home/sections/Employee';
import JobApplications from '../page/admin/home/sections/JobApplications';
import PostManagement from '../page/admin/home/sections/Post';
import Subscribers from '../page/admin/home/sections/Subscribers';
import LandingPage from '../page/landing/LandingPage';

export const publicRoutes: RouteObject = {
  path: '/',
  element: <PublicLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: 've-chung-toi', element: <About /> },
    { path: 'lien-he', element: <Contact /> },
    { path: 'tuyen-dung', element: <Recruitment /> },
    { path: 'tuyen-dung/vi-tri/:id', element: <Job /> },
    { path: 'dich-vu', element: <Service /> },
    { path: 'dang-ky-bao-ho-nhan-hieu', element: <Brand /> },
    { path: 'dang-ky-bao-ho-ban-quyen', element: <CopyRight /> },
    { path: 'bao-ho-kieu-dang-cong-nghiep', element: <Design /> },
    { path: 'bao-ho-sang-che-giai-phap-huu-ich', element: <Invention /> },
    { path: 'xu-ly-xam-pham', element: <Violate /> },
    { path: 'dich-vu-khac', element: <ServiceDif /> },
    { path: 'ma-so-ma-vach', element: <BarcodeNumber /> },
    {
      path: 'giay-phep-doanh-nghiep-khoa-hoc-cong-nghe',
      element: <ScienceTechnologyEnterprises />,
    },
    { path: 'dang-ky-giay-phep-mang-xa-hoi', element: <SocialMedia /> },
    { path: 'tu-van-soan-thao-hop-dong', element: <ConsultationOfDraftingContracts /> },
    { path: 'tin-tuc', element: <News /> },
    { path: 'tin-tuc/:id', element: <NewsDetail /> },
  ],
};

export const adminRoutes: RouteObject[] = [
  { path: '/2025/luatpoip/admin/login', element: <Login /> },
  {
    path: '/2025/luatpoip/admin',
    element: <AdminHome />,
    children: [
      { path: 'employees', element: <EmployeeManagement /> },
      { path: 'posts', element: <PostManagement /> },
      { path: 'customers', element: <CustomerManagement /> },
      { path: 'applications', element: <JobApplications /> },
      { path: 'subscribers', element: <Subscribers /> },
      { path: 'chats', element: <ChatManagement /> },
    ],
  },
];

// Landing page chạy ads — layout riêng, KHÔNG dùng PublicLayout (không nav/footer)
export const landingRoutes: RouteObject[] = [{ path: '/lp/:slug', element: <LandingPage /> }];

export const appRoutes: RouteObject[] = [...adminRoutes, ...landingRoutes, publicRoutes];

import { RouteObject } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import About from '../page/aboutUs';
import Contact from '../page/contact';
import Home from '../page/home/Home';
import Job from '../page/recruitment/Job';
import Recruitment from '../page/recruitment/recruitment';
import Service from '../page/service';
import ServiceDif from '../page/servicedif';
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
import DynamicServicePage from '../page/service/DynamicServicePage';
import ServiceImages from '../page/admin/home/sections/ServiceImages';
import ServiceManager from '../page/admin/home/sections/Services';

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
    { path: 'dich-vu-khac', element: <ServiceDif /> },
    // 9 trang dịch vụ cũ (hardcode) đã chuyển sang trang động — route :slug bên dưới
    { path: 'tin-tuc', element: <News /> },
    { path: 'tin-tuc/:id', element: <NewsDetail /> },
    // Trang dịch vụ động (CMS): mọi đường dẫn chưa khai báo sẽ tra DB theo href.
    // Các route tĩnh phía trên luôn được ưu tiên khớp trước.
    { path: ':slug', element: <DynamicServicePage /> },
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
      { path: 'service-images', element: <ServiceImages /> },
      { path: 'services', element: <ServiceManager /> },
    ],
  },
];

// Landing page chạy ads — layout riêng, KHÔNG dùng PublicLayout (không nav/footer)
export const landingRoutes: RouteObject[] = [{ path: '/lp/:slug', element: <LandingPage /> }];

export const appRoutes: RouteObject[] = [...adminRoutes, ...landingRoutes, publicRoutes];

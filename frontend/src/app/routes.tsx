import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';

const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const About = lazy(() => import('../page/aboutUs'));
const PrivacyPolicy = lazy(() => import('../page/legal/PrivacyPolicy'));
const AdminDashboard = lazy(() => import('../page/admin/home/sections/Dashboard'));
const Contact = lazy(() => import('../page/contact'));
const Home = lazy(() => import('../page/home/Home'));
const Job = lazy(() => import('../page/recruitment/Job'));
const Recruitment = lazy(() => import('../page/recruitment/recruitment'));
const Service = lazy(() => import('../page/service'));
const ServiceDif = lazy(() => import('../page/servicedif'));
const News = lazy(() => import('../page/news'));
const NewsDetail = lazy(() => import('../page/news/section/New'));
const Login = lazy(() => import('../page/admin/login/login'));
const AdminHome = lazy(() => import('../page/admin/home'));
const SystemHome = lazy(() => import('../page/admin/home/SystemHome'));
const ChatManagement = lazy(() => import('../page/admin/home/sections/Chat'));
const CustomerManagement = lazy(() => import('../page/admin/home/sections/Customer'));
const EmployeeManagement = lazy(() => import('../page/admin/home/sections/Employee'));
const JobApplications = lazy(() => import('../page/admin/home/sections/JobApplications'));
const PostManagement = lazy(() => import('../page/admin/home/sections/Post'));
const Subscribers = lazy(() => import('../page/admin/home/sections/Subscribers'));
const LandingPage = lazy(() => import('../page/landing/LandingPage'));
const DynamicServicePage = lazy(() => import('../page/service/DynamicServicePage'));
const ServiceImages = lazy(() => import('../page/admin/home/sections/ServiceImages'));
const ServiceManager = lazy(() => import('../page/admin/home/sections/Services'));
const CRM = lazy(() => import('../page/admin/home/sections/CRM'));
const CrmConfig = lazy(() => import('../page/admin/home/sections/CRM/Config'));
const TeamChat = lazy(() => import('../page/admin/home/sections/TeamChat'));
const A11yPreview = lazy(() => import('../page/admin/A11yPreview'));
const DocumentLayout = lazy(() => import('../page/documents/DocumentLayout'));
const TemplateList = lazy(() => import('../page/documents/TemplateList'));
const TemplateUpload = lazy(() => import('../page/documents/TemplateUpload'));
const TemplateFieldEditor = lazy(() => import('../page/documents/TemplateFieldEditor'));
const GenerateDocument = lazy(() => import('../page/documents/GenerateDocument'));
const GeneratedDocumentList = lazy(() => import('../page/documents/GeneratedDocumentList'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-white" role="status">
      <span className="sr-only">Dang tai noi dung</span>
    </div>
  );
}

function withSuspense(element: ReactElement) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

export const publicRoutes: RouteObject = {
  path: '/',
  element: withSuspense(<PublicLayout />),
  children: [
    { index: true, element: withSuspense(<Home />) },
    { path: 've-chung-toi', element: withSuspense(<About />) },
    { path: 'lien-he', element: withSuspense(<Contact />) },
    { path: 'tuyen-dung', element: withSuspense(<Recruitment />) },
    { path: 'tuyen-dung/vi-tri/:id', element: withSuspense(<Job />) },
    { path: 'dich-vu', element: withSuspense(<Service />) },
    { path: 'dich-vu-khac', element: withSuspense(<ServiceDif />) },
    { path: 'tin-tuc', element: withSuspense(<News />) },
    { path: 'tin-tuc/:id', element: withSuspense(<NewsDetail />) },
    { path: 'chinh-sach-bao-mat', element: withSuspense(<PrivacyPolicy />) },
    { path: ':slug', element: withSuspense(<DynamicServicePage />) },
  ],
};

export const adminRoutes: RouteObject[] = [
  { path: '/2025/luatpoip/admin/login', element: withSuspense(<Login />) },
  // Trang preview a11y offline (không cần đăng nhập) — dùng cho axe-core làm cổng chặn PR.
  { path: '/2025/luatpoip/_a11y', element: withSuspense(<A11yPreview />) },
  // Khu VẬN HÀNH (nhân viên + admin)
  {
    path: '/2025/luatpoip/admin',
    element: withSuspense(<AdminHome />),
    children: [
      { index: true, element: withSuspense(<AdminDashboard />) },
      { path: 'customers', element: withSuspense(<CustomerManagement />) },
      { path: 'crm', element: withSuspense(<CRM />) },
      { path: 'chats', element: withSuspense(<ChatManagement />) },
      { path: 'team-chat', element: withSuspense(<TeamChat />) },
    ],
  },
  // Khu QUẢN TRỊ HỆ THỐNG (chỉ admin) — SystemHome tự chặn role
  {
    path: '/2025/luatpoip/he-thong',
    element: withSuspense(<SystemHome />),
    children: [
      { index: true, element: <Navigate to="services" replace /> },
      { path: 'services', element: withSuspense(<ServiceManager />) },
      { path: 'posts', element: withSuspense(<PostManagement />) },
      { path: 'service-images', element: withSuspense(<ServiceImages />) },
      { path: 'employees', element: withSuspense(<EmployeeManagement />) },
      { path: 'applications', element: withSuspense(<JobApplications />) },
      { path: 'subscribers', element: withSuspense(<Subscribers />) },
      { path: 'crm-config', element: withSuspense(<CrmConfig />) },
    ],
  },
];

export const documentRoutes: RouteObject[] = [
  {
    path: '/2025/luatpoip/tai-lieu',
    element: withSuspense(<DocumentLayout />),
    children: [
      { index: true, element: withSuspense(<TemplateList />) },
      { path: 'templates/new', element: withSuspense(<TemplateUpload />) },
      { path: 'templates/:id/edit', element: withSuspense(<TemplateFieldEditor />) },
      { path: 'generate/:templateId', element: withSuspense(<GenerateDocument />) },
      { path: 'generated', element: withSuspense(<GeneratedDocumentList />) },
    ],
  },
];

export const landingRoutes: RouteObject[] = [
  { path: '/lp/:slug', element: withSuspense(<LandingPage />) },
];

export const appRoutes: RouteObject[] = [
  ...adminRoutes,
  ...documentRoutes,
  ...landingRoutes,
  publicRoutes,
];

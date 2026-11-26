import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';

const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const About = lazy(() => import('../page/aboutUs'));
const PrivacyPolicy = lazy(() => import('../page/legal/PrivacyPolicy'));
const AdminDashboard = lazy(() => import('../page/admin/home/sections/Dashboard'));
const Contact = lazy(() => import('../page/contact'));
const ThankYou = lazy(() => import('../pages/ThankYou'));
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
const LandingManager = lazy(() => import('../page/admin/home/sections/Landing'));
const CRM = lazy(() => import('../page/admin/home/sections/CRM'));
const CrmConfig = lazy(() => import('../page/admin/home/sections/CRM/Config'));
const TeamChat = lazy(() => import('../page/admin/home/sections/TeamChat'));
const A11yPreview = lazy(() => import('../page/admin/A11yPreview'));
const AuditLog = lazy(() => import('../page/admin/home/sections/AuditLog'));
const AuditAnalytics = lazy(() => import('../page/admin/home/sections/AuditAnalytics'));
const DocumentLayout = lazy(() => import('../page/documents/DocumentLayout'));
const TemplateList = lazy(() => import('../page/documents/TemplateList'));
const TemplateUpload = lazy(() => import('../page/documents/TemplateUpload'));
const TemplateFieldEditor = lazy(() => import('../page/documents/TemplateFieldEditor'));
const GenerateDocument = lazy(() => import('../page/documents/GenerateDocument'));
const GeneratedDocumentList = lazy(() => import('../page/documents/GeneratedDocumentList'));
const DocumentDashboard = lazy(() => import('../page/documents/DocumentDashboard'));
const BundleList = lazy(() => import('../page/documents/BundleList'));
const BundleEditor = lazy(() => import('../page/documents/BundleEditor'));
const GenerateBundle = lazy(() => import('../page/documents/GenerateBundle'));
const ClauseLibrary = lazy(() => import('../page/documents/ClauseLibrary'));
function retryImport<T>(importer: () => Promise<T>): () => Promise<T> {
  return async () => {
    try {
      return await importer();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400));
      try {
        return await importer();
      } catch (retryError) {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const key = `chunk_retry_${window.location.pathname}`;
          if (!window.sessionStorage.getItem(key)) {
            window.sessionStorage.setItem(key, '1');
            window.location.reload();
          }
        }
        throw retryError;
      }
    }
  };
}

const CrmWorkspaceLayout = lazy(retryImport(() => import('../pages/crm/CrmWorkspaceLayout')));
const LeadListPage = lazy(retryImport(() => import('../pages/crm/LeadListPage')));
const LeadDetailPage = lazy(retryImport(() => import('../pages/crm/LeadDetailPage')));
const LeadFormPage = lazy(retryImport(() => import('../pages/crm/LeadFormPage')));
const AccountListPage = lazy(retryImport(() => import('../pages/crm/AccountListPage')));
const AccountDetailPage = lazy(retryImport(() => import('../pages/crm/AccountDetailPage')));
const AccountFormPage = lazy(retryImport(() => import('../pages/crm/AccountFormPage')));
const OpportunityListPage = lazy(retryImport(() => import('../pages/crm/OpportunityListPage')));
const OpportunityDetailPage = lazy(retryImport(() => import('../pages/crm/OpportunityDetailPage')));
const OpportunityFormPage = lazy(retryImport(() => import('../pages/crm/OpportunityFormPage')));
const ContractListPage = lazy(retryImport(() => import('../pages/crm/ContractListPage')));
const ContractDetailPage = lazy(retryImport(() => import('../pages/crm/ContractDetailPage')));
const ContractFormPage = lazy(retryImport(() => import('../pages/crm/ContractFormPage')));

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
    // Đặt TRƯỚC ':slug' — nếu để sau, trang dịch vụ động sẽ nuốt mất /cam-on.
    { path: 'cam-on', element: withSuspense(<ThankYou />) },
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
      { path: 'landing', element: withSuspense(<LandingManager />) },
      { path: 'posts', element: withSuspense(<PostManagement />) },
      { path: 'service-images', element: withSuspense(<ServiceImages />) },
      { path: 'employees', element: withSuspense(<EmployeeManagement />) },
      { path: 'applications', element: withSuspense(<JobApplications />) },
      { path: 'subscribers', element: withSuspense(<Subscribers />) },
      { path: 'crm-config', element: withSuspense(<CrmConfig />) },
      { path: 'audit-logs', element: withSuspense(<AuditLog />) },
      { path: 'activity-stats', element: withSuspense(<AuditAnalytics />) },
    ],
  },
];

export const documentRoutes: RouteObject[] = [
  {
    path: '/2025/luatpoip/tai-lieu',
    element: withSuspense(<DocumentLayout />),
    children: [
      { index: true, element: withSuspense(<TemplateList />) },
      { path: 'dashboard', element: withSuspense(<DocumentDashboard />) },
      { path: 'templates/new', element: withSuspense(<TemplateUpload />) },
      { path: 'templates/:id/edit', element: withSuspense(<TemplateFieldEditor />) },
      { path: 'generate/:templateId', element: withSuspense(<GenerateDocument />) },
      { path: 'generated', element: withSuspense(<GeneratedDocumentList />) },
      { path: 'bundles', element: withSuspense(<BundleList />) },
      { path: 'bundles/new', element: withSuspense(<BundleEditor />) },
      { path: 'bundles/:id/edit', element: withSuspense(<BundleEditor />) },
      { path: 'bundles/:id/generate', element: withSuspense(<GenerateBundle />) },
      { path: 'clauses', element: withSuspense(<ClauseLibrary />) },
    ],
  },
];

export const crmRoutes: RouteObject[] = [
  {
    path: '/2025/luatpoip/crm',
    element: withSuspense(<CrmWorkspaceLayout />),
    children: [
      { index: true, element: <Navigate to="sale-order" replace /> },
      { path: 'lead', element: withSuspense(<LeadListPage />) },
      { path: 'lead/new', element: withSuspense(<LeadFormPage />) },
      { path: 'lead/:id', element: withSuspense(<LeadDetailPage />) },
      { path: 'lead/:id/edit', element: withSuspense(<LeadFormPage />) },
      { path: 'account', element: withSuspense(<AccountListPage />) },
      { path: 'account/new', element: withSuspense(<AccountFormPage />) },
      { path: 'account/:id', element: withSuspense(<AccountDetailPage />) },
      { path: 'account/:id/edit', element: withSuspense(<AccountFormPage />) },
      { path: 'opportunity', element: withSuspense(<OpportunityListPage />) },
      { path: 'opportunity/new', element: withSuspense(<OpportunityFormPage />) },
      { path: 'opportunity/:id', element: withSuspense(<OpportunityDetailPage />) },
      { path: 'opportunity/:id/edit', element: withSuspense(<OpportunityFormPage />) },
      { path: 'sale-order', element: withSuspense(<ContractListPage />) },
      { path: 'sale-order/new', element: withSuspense(<ContractFormPage />) },
      { path: 'sale-order/:id', element: withSuspense(<ContractDetailPage />) },
      { path: 'sale-order/:id/edit', element: withSuspense(<ContractFormPage />) },
    ],
  },
];

export const landingRoutes: RouteObject[] = [
  { path: '/lp/:slug', element: withSuspense(<LandingPage />) },
];

export const appRoutes: RouteObject[] = [
  ...adminRoutes,
  ...crmRoutes,
  ...documentRoutes,
  ...landingRoutes,
  publicRoutes,
];

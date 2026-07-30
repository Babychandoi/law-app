import {
  LayoutDashboard,
  Users,
  UserCog,
  Newspaper,
  Briefcase,
  Mail,
  MessageSquare,
  MessagesSquare,
  HeartHandshake,
  SlidersHorizontal,
  Puzzle,
  Image,
  ScrollText,
  BarChart3,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react';

export const ADMIN_BASE = '/2025/luatpoip/admin';
export const SYS_BASE = '/2025/luatpoip/he-thong';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Vận hành — nhân viên + admin đều dùng. */
export const OPERATIONS_GROUPS: NavGroup[] = [
  {
    title: 'Tổng quan',
    items: [{ label: 'Trang chủ', path: ADMIN_BASE, icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Khách hàng & CRM',
    items: [
      { label: 'Khách hàng', path: `${ADMIN_BASE}/customers`, icon: Users },
      { label: 'CRM chăm sóc', path: `${ADMIN_BASE}/crm`, icon: HeartHandshake },
    ],
  },
  {
    title: 'Giao tiếp',
    items: [
      { label: 'Chat khách', path: `${ADMIN_BASE}/chats`, icon: MessageSquare },
      { label: 'Chat nội bộ', path: `${ADMIN_BASE}/team-chat`, icon: MessagesSquare },
    ],
  },
  {
    title: 'Hồ sơ pháp lý',
    items: [
      {
        label: 'Tài liệu & biểu mẫu',
        path: '/2025/luatpoip/tai-lieu',
        icon: FolderKanban,
      },
    ],
  },
];

/** Quản trị hệ thống — chỉ admin. */
export const SYSTEM_GROUPS: NavGroup[] = [
  {
    title: 'Nội dung website',
    items: [
      { label: 'Dịch vụ', path: `${SYS_BASE}/services`, icon: Puzzle },
      { label: 'Bài viết', path: `${SYS_BASE}/posts`, icon: Newspaper },
      { label: 'Ảnh dịch vụ', path: `${SYS_BASE}/service-images`, icon: Image },
    ],
  },
  {
    title: 'Nhân sự',
    items: [
      { label: 'Nhân viên', path: `${SYS_BASE}/employees`, icon: UserCog },
      { label: 'Ứng viên', path: `${SYS_BASE}/applications`, icon: Briefcase },
    ],
  },
  {
    title: 'Khác',
    items: [
      { label: 'Người đăng ký', path: `${SYS_BASE}/subscribers`, icon: Mail },
      { label: 'Cấu hình CRM', path: `${SYS_BASE}/crm-config`, icon: SlidersHorizontal },
      { label: 'Nhật ký kiểm toán', path: `${SYS_BASE}/audit-logs`, icon: ScrollText },
      { label: 'Thống kê hoạt động', path: `${SYS_BASE}/activity-stats`, icon: BarChart3 },
    ],
  },
];

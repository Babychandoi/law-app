import { User } from '../../../../../types/admin';
import { Pencil, Key } from 'lucide-react';
import { DataTable, type Column } from '../../../../../component/common/ui';

// User Table Component
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onChangePassword: (user: User) => void;
  onRoleChange: (userId: string, newRole: 'ADMIN' | 'USER') => void;
  onActiveChange: (userId: string, newActive: 'ACTIVE' | 'INACTIVE') => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onChangePassword,
  onRoleChange,
  onActiveChange,
}) => {
  const columns: Column<User>[] = [
    { key: 'username', header: 'Tên đăng nhập', sortable: true },
    { key: 'fullName', header: 'Họ tên', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Điện thoại' },
    { key: 'position', header: 'Chức vụ' },
    {
      key: 'role',
      header: 'Vai trò',
      render: (user) => (
        <select
          aria-label="Vai trò người dùng"
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value as 'ADMIN' | 'USER')}
          className="px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer bg-brand-surface text-brand-goldDark"
        >
          <option value="USER">Nhân viên</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>
      ),
    },
    {
      key: 'active',
      header: 'Trạng thái',
      render: (user) => (
        <select
          aria-label="Trạng thái hoạt động"
          value={user.active}
          onChange={(e) => onActiveChange(user.id, e.target.value as 'ACTIVE' | 'INACTIVE')}
          className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
            user.active === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Không hoạt động</option>
        </select>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      sortValue: (user) => new Date(user.createdAt).getTime(),
      render: (user) => new Date(user.createdAt).toLocaleString(),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (user) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-brand-goldDark hover:bg-brand-surface rounded-lg transition-colors"
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onChangePassword(user)}
            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
            title="Đổi mật khẩu"
            aria-label="Đổi mật khẩu"
          >
            <Key size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      rowKey={(u) => u.id}
      urlKey="usr"
      searchable
      searchPlaceholder="Tìm theo tên đăng nhập, họ tên, email..."
      searchText={(u) => `${u.username} ${u.fullName} ${u.email} ${u.position ?? ''}`}
      pageSize={10}
      emptyTitle="Chưa có người dùng nào"
    />
  );
};

export default UserTable;

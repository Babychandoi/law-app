import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, UserCreate } from '../../../../types/admin';
import UserTable from './Employee/TableUser';
import UserForm from './Employee/User';
import PasswordChangeForm from './Employee/ChangePassword';
import UserEdit from './Employee/EditUser';
import {
  getUsers,
  changeActive,
  changePassword,
  changeRole,
  createUser,
  editUser,
} from '../../../../service/admin';
import Swal from 'sweetalert2';
import { useConfirm } from '../../../../component/common/ui';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1));
  const [q, setQ] = useState(() => searchParams.get('q') ?? '');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(() => {
    const s = searchParams.get('sort');
    if (!s) return null;
    const [key, dir] = s.split(',');
    return key ? { key, dir: dir === 'asc' ? 'asc' : 'desc' } : null;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const { confirm, confirmDialog } = useConfirm();

  const PAGE_SIZE = 10;

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        page > 1 ? next.set('page', String(page)) : next.delete('page');
        q ? next.set('q', q) : next.delete('q');
        sort ? next.set('sort', `${sort.key},${sort.dir}`) : next.delete('sort');
        return next;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, sort]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getUsers({
        page: page - 1,
        size: PAGE_SIZE,
        q: q || undefined,
        sort: sort ? `${sort.key},${sort.dir}` : undefined,
      });
      setUsers(response.data);
      setTotalPages(response.meta?.totalPages ?? 1);
      setTotalElements(response.meta?.totalElements ?? response.data.length);
      setError(null);
    } catch (error) {
      setError('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  }, [page, q, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddNew = () => {
    setIsUserFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleChangePassword = (user: User) => {
    setPasswordChangeUser(user);
    setIsPasswordFormOpen(true);
  };

  // Handle creating new user
  const handleSaveUser = async (formData: UserCreate) => {
    try {
      // Hiển thị loading UI
      Swal.fire({
        title: 'Đang tạo người dùng...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await createUser(formData);

      if (response.data) {
        fetchUsers();
        setIsUserFormOpen(false);
        setError(null);

        Swal.fire({
          icon: 'success',
          title: 'Tạo người dùng thành công!',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Không thể tạo người dùng',
          text: response.message || 'Đã có lỗi xảy ra.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi tạo người dùng',
        text: (error as Error).message || 'Đã xảy ra lỗi không xác định.',
      });
    } finally {
      setIsLoading(false); // Nếu bạn vẫn cần quản lý isLoading cho UI ngoài Swal
    }
  };

  // Handle updating existing user
  const handleUpdateUser = async (formData: UserCreate, userId: string) => {
    try {
      // Hiển thị loading SweetAlert
      Swal.fire({
        title: 'Đang cập nhật người dùng...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await editUser(userId, formData);

      if (response.data) {
        // Cập nhật state người dùng
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, ...response.data } : user))
        );

        setEditingUser(null);
        setError(null);

        // Thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công!',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Không thể cập nhật người dùng',
          text: response.message || 'Có lỗi xảy ra.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi cập nhật người dùng',
        text: (error as Error).message || 'Đã xảy ra lỗi không xác định.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async (userId: string, newPassword: string) => {
    try {
      // Hiển thị Swal loading
      Swal.fire({
        title: 'Đang thay đổi mật khẩu...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await changePassword(userId, newPassword);

      if (response.data) {
        // Đóng form đổi mật khẩu
        setIsPasswordFormOpen(false);
        setPasswordChangeUser(null);
        setError(null);

        // Thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Đã thay đổi mật khẩu thành công!',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Không thể thay đổi mật khẩu',
          text: response.message || '',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi thay đổi mật khẩu',
        text: (error as Error).message || 'Đã xảy ra lỗi không xác định.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'USER') => {
    const ok = await confirm({
      title: 'Đổi vai trò',
      message:
        newRole === 'ADMIN'
          ? 'Cấp quyền QUẢN TRỊ VIÊN cho người dùng này? Họ sẽ vào được khu Quản trị hệ thống.'
          : 'Hạ về vai trò Nhân viên? Người dùng sẽ mất quyền quản trị hệ thống.',
      confirmText: 'Đổi vai trò',
    });
    if (!ok) {
      fetchUsers(); // trả select về giá trị cũ
      return;
    }
    try {
      setIsLoading(true);
      const response = await changeRole(userId, newRole);
      if (response.data) {
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
        );
        setError(null);
      } else {
        setError('Không thể thay đổi vai trò');
      }
    } catch (error) {
      setError('Không thể thay đổi vai trò');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActiveChange = async (userId: string, newActive: 'ACTIVE' | 'INACTIVE') => {
    const ok = await confirm({
      title: 'Đổi trạng thái',
      message:
        newActive === 'INACTIVE'
          ? 'Khóa tài khoản này? Người dùng sẽ không đăng nhập được.'
          : 'Mở khóa tài khoản này?',
      confirmText: newActive === 'INACTIVE' ? 'Khóa' : 'Mở khóa',
      variant: newActive === 'INACTIVE' ? 'danger' : 'primary',
    });
    if (!ok) {
      fetchUsers();
      return;
    }
    try {
      setIsLoading(true);
      const response = await changeActive(userId, newActive);
      if (response.data) {
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, active: newActive } : user))
        );
        setError(null);
      } else {
        setError('Không thể thay đổi trạng thái');
      }
    } catch (error) {
      setError('Không thể thay đổi trạng thái');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {confirmDialog}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h2>
        <button
          onClick={handleAddNew}
          className="bg-brand-goldDark hover:bg-brand-goldDark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Thêm người dùng
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={handleCloseError}
            aria-label="Đóng thông báo lỗi"
            className="text-red-700 hover:text-red-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-brand-goldDark"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Đang xử lý...</span>
          </div>
        </div>
      )}

      <UserTable
        users={users}
        loading={isLoading}
        onEdit={handleEdit}
        onChangePassword={handleChangePassword}
        onRoleChange={handleRoleChange}
        onActiveChange={handleActiveChange}
        onSearch={(v) => {
          setQ(v);
          setPage(1);
        }}
        serverPagination={{ page, totalPages, totalElements, onPageChange: setPage }}
        sortState={sort}
        onSortChange={(key, dir) => {
          setSort({ key, dir });
          setPage(1);
        }}
      />

      {/* User Edit Modal */}
      <UserEdit
        initialData={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUser}
        isLoading={isLoading}
      />

      {/* User Create Modal */}
      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSave={handleSaveUser}
      />

      {/* Password Change Modal */}
      <PasswordChangeForm
        user={passwordChangeUser}
        isOpen={isPasswordFormOpen}
        onClose={() => setIsPasswordFormOpen(false)}
        onSave={handleSavePassword}
      />
    </div>
  );
};

export default UserManagement;

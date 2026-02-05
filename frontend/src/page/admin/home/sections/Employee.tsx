import { useEffect, useState } from "react";
import { User, UserCreate } from "../../../../types/admin";
import UserTable from "./Employee/TableUser";
import UserForm from "./Employee/User";
import PasswordChangeForm from "./Employee/ChangePassword";
import UserEdit from "./Employee/EditUser";
import { getUsers, changeActive, changePassword, changeRole, createUser, editUser} from "../../../../service/admin";
import Swal from "sweetalert2";

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await getUsers();
                setUsers(response.data);
                setError(null);
            } catch (error) {
                setError('Không thể tải danh sách người dùng');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

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
            setUsers(prev => [...prev, response.data]);
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
            setUsers(prev =>
              prev.map(user => user.id === userId ? { ...user, ...response.data } : user)
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
        try {
            setIsLoading(true);
            const response = await changeRole(userId, newRole);
            if (response.data) {
                setUsers(prev => prev.map(user => 
                    user.id === userId ? { ...user, role: newRole } : user
                ));
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
        try {
            setIsLoading(true);
            const response = await changeActive(userId, newActive);
            if (response.data) {
                setUsers(prev => prev.map(user => 
                    user.id === userId ? { ...user, active: newActive } : user
                ));
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h2>
                <button 
                    onClick={handleAddNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
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
                        className="text-red-700 hover:text-red-900"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang xử lý...</span>
                    </div>
                </div>
            )}
            
            <UserTable 
                users={users}
                onEdit={handleEdit}
                onChangePassword={handleChangePassword}
                onRoleChange={handleRoleChange}
                onActiveChange={handleActiveChange}
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
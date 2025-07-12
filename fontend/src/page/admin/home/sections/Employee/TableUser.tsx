import { User } from "../../../../../types/admin";

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
    onActiveChange 
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full table-auto">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tên đăng nhập</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Họ tên</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Điện thoại</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Chức vụ</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vai trò</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày tạo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{user.username}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{user.fullName}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{user.phoneNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{user.position}</td>
                            <td className="px-4 py-3">
                                <select 
                                    value={user.role}
                                    onChange={(e) => onRoleChange(user.id, e.target.value as 'ADMIN' | 'USER')}
                                    className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                                        user.role === 'ADMIN' 
                                            ? 'bg-purple-100 text-purple-800' 
                                            : 'bg-blue-100 text-blue-800'
                                    }`}
                                >
                                    <option value="USER">Người dùng</option>
                                    <option value="ADMIN">Quản trị viên</option>
                                </select>
                            </td>
                            <td className="px-4 py-3">
                                <select 
                                    value={user.active}
                                    onChange={(e) => onActiveChange(user.id, e.target.value as 'ACTIVE' | 'INACTIVE')}
                                    className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                                        user.active === 'ACTIVE' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="INACTIVE">Không hoạt động</option>
                                </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{new Date(user.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-3">
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => onEdit(user)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        title="Chỉnh sửa"
                                    >
                                        Sửa
                                    </button>
                                    <button 
                                        onClick={() => onChangePassword(user)}
                                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                                        title="Đổi mật khẩu"
                                    >
                                        changePassword
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default UserTable;
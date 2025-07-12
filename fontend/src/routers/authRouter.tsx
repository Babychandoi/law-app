import React from 'react';
import Login from '../page/admin/login/login';
import Home from '../page/admin/home/index';
import CustomerManagement from '../page/admin/home/sections/Customer';
import EmployeeManagement from '../page/admin/home/sections/Employee';
import PostManagement from '../page/admin/home/sections/Post';
export const authRouter = [
    {
      path: '/login',
      element: < Login/>
    },{
      path: '/administration',
      element: <Home />,
      children: [
        {
          path: 'employees',
          element: <EmployeeManagement />
        },
        {
          path: 'posts',
          element: <PostManagement />
        },
        {
          path: 'customers',
          element: <CustomerManagement />
        },
      ]
    }
]
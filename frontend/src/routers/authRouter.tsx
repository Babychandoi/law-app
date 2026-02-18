import React from 'react';
import Login from '../page/admin/login/login';
import Home from '../page/admin/home/index';
import CustomerManagement from '../page/admin/home/sections/Customer';
import EmployeeManagement from '../page/admin/home/sections/Employee';
import PostManagement from '../page/admin/home/sections/Post';
import ChatManagement from '../page/admin/home/sections/Chat';
import JobApplications from '../page/admin/home/sections/JobApplications';
import Subscribers from '../page/admin/home/sections/Subscribers';

export const authRouter = [
    {
      path: '/2025/luatpoip/admin/login',
      element: < Login/>
    },{
      path: '/2025/luatpoip/admin',
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
        {
          path: 'applications',
          element: <JobApplications />
        },
        {
          path: 'subscribers',
          element: <Subscribers />
        },
        {
          path: 'chats',
          element: <ChatManagement />
        }
      ]
    }
]
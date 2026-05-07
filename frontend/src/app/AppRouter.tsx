import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { appRoutes } from './routes';

function Routes() {
  return useRoutes(appRoutes);
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

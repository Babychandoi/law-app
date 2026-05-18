import React from 'react'
import './App.css';

import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { indexRouter } from './routers/indexRouter';
import { authRouter } from './routers/authRouter';
import { ToastContainer } from 'react-toastify';
function AppRouter() {
  const routes = useRoutes([...authRouter,indexRouter]);
  return routes;
}
function App() {
  return (
      <Router>
        <AppRouter />
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
      </Router>
  );
}

export default App;


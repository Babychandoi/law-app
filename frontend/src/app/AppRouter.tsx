import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { appRoutes } from './routes';

const ToastContainer = lazy(() =>
  import('react-toastify').then((module) => ({ default: module.ToastContainer }))
);

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function Routes() {
  return useRoutes(appRoutes);
}

function LazyToastContainer() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const idleWindow = window as WindowWithIdleCallback;
    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const renderToastContainer = () => {
      if (typeof idleWindow.requestIdleCallback === 'function') {
        idleId = idleWindow.requestIdleCallback(() => setShouldRender(true), { timeout: 4000 });
      } else {
        timeoutId = window.setTimeout(() => setShouldRender(true), 3000);
      }
    };

    if (document.readyState === 'complete') {
      renderToastContainer();
    } else {
      window.addEventListener('load', renderToastContainer, { once: true });
    }

    return () => {
      window.removeEventListener('load', renderToastContainer);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (idleId && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleId);
      }
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <Suspense fallback={null}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </Suspense>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes />
      <LazyToastContainer />
    </BrowserRouter>
  );
}

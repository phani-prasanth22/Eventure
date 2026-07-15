import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
    </>
  );
}

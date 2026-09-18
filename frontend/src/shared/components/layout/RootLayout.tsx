import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default RootLayout;

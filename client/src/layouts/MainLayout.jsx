
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import Navbar from '../components/header/Navbar';
import Sidebar from '../components/sidebar/Sidebar';
import LoginBannerPopup from '../pages/CasinoBet/components/LoginBannerPopup';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="bg-body min-h-screen flex flex-col">
      <LoginBannerPopup />

      <Header
        onMenuToggle={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <main className="scrollbar-hide w-full min-w-0 flex-1 lg:ml-0">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default MainLayout;

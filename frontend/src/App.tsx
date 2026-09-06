import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  LayoutDashboard, 
  IndianRupee, 
  Users, 
  Truck, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Bell, 
  Settings,
  PlusCircle,
  User,
  Store,
  ShoppingCart,
  CheckCircle,
  Menu,
  X,
  LogOut
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Public pages
import LandingPage from './pages/public/LandingPage';
import RegisterSelect from './pages/public/RegisterSelect';
import FarmerRegister from './pages/public/FarmerRegister';
import ConsumerRegister from './pages/public/ConsumerRegister';
import CoordinatorRegister from './pages/public/CoordinatorRegister';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PriceManagement from './pages/admin/PriceManagement';
import FarmerManagement from './pages/admin/FarmerManagement';
import ConsumerManagement from './pages/admin/ConsumerManagement';
import CoordinatorManagement from './pages/admin/CoordinatorManagement';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminReports from './pages/admin/AdminReports';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';

// Farmer pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MyProduce from './pages/farmer/MyProduce';
import AddProduce from './pages/farmer/AddProduce';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerEarnings from './pages/farmer/FarmerEarnings';
import FarmerProfile from './pages/farmer/FarmerProfile';
import FarmerNotifications from './pages/farmer/FarmerNotifications';

// Consumer pages
import Marketplace from './pages/consumer/Marketplace';
import ProductDetails from './pages/consumer/ProductDetails';
import Cart from './pages/consumer/Cart';
import Checkout from './pages/consumer/Checkout';
import ConsumerOrders from './pages/consumer/ConsumerOrders';
import OrderTracking from './pages/consumer/OrderTracking';
import ConsumerProfile from './pages/consumer/ConsumerProfile';
import ConsumerNotifications from './pages/consumer/ConsumerNotifications';

// Coordinator pages
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import PreBookedOrders from './pages/coordinator/PreBookedOrders';
import OrderDetails from './pages/coordinator/OrderDetails';
import CompletedOrders from './pages/coordinator/CompletedOrders';
import CoordFarmers from './pages/coordinator/CoordFarmers';
import CoordCustomers from './pages/coordinator/CoordCustomers';
import CoordReports from './pages/coordinator/CoordReports';
import CoordNotifications from './pages/coordinator/CoordNotifications';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard based on role
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'FARMER') return <Navigate to="/farmer" replace />;
    if (user.role === 'CONSUMER') return <Navigate to="/consumer" replace />;
    if (user.role === 'COORDINATOR') return <Navigate to="/coordinator" replace />;
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

const getRoleMenuItems = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return [
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/prices', label: 'Vegetable Prices', icon: <IndianRupee size={20} /> },
        { path: '/admin/farmers', label: 'Farmers', icon: <Sprout size={20} /> },
        { path: '/admin/consumers', label: 'Consumers', icon: <Users size={20} /> },
        { path: '/admin/coordinators', label: 'Coordinators', icon: <Truck size={20} /> },
        { path: '/admin/products', label: 'Products', icon: <Package size={20} /> },
        { path: '/admin/orders', label: 'Orders', icon: <ClipboardList size={20} /> },
        { path: '/admin/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
        { path: '/admin/notifications', label: 'Notifications', icon: <Bell size={20} /> },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
      ];
    case 'FARMER':
      return [
        { path: '/farmer', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/farmer/produce', label: 'My Produce', icon: <Package size={20} /> },
        { path: '/farmer/add-produce', label: 'Add Produce', icon: <PlusCircle size={20} /> },
        { path: '/farmer/orders', label: 'My Orders', icon: <ClipboardList size={20} /> },
        { path: '/farmer/earnings', label: 'My Earnings', icon: <IndianRupee size={20} /> },
        { path: '/farmer/profile', label: 'Profile', icon: <User size={20} /> },
        { path: '/farmer/notifications', label: 'Notifications', icon: <Bell size={20} /> },
      ];
    case 'CONSUMER':
      return [
        { path: '/consumer', label: 'Marketplace', icon: <Store size={20} /> },
        { path: '/consumer/cart', label: 'My Cart', icon: <ShoppingCart size={20} /> },
        { path: '/consumer/orders', label: 'My Orders', icon: <ClipboardList size={20} /> },
        { path: '/consumer/profile', label: 'Profile', icon: <User size={20} /> },
        { path: '/consumer/notifications', label: 'Notifications', icon: <Bell size={20} /> },
      ];
    case 'COORDINATOR':
      return [
        { path: '/coordinator', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/coordinator/orders', label: 'Pre-Booked Orders', icon: <ClipboardList size={20} /> },
        { path: '/coordinator/completed', label: 'Completed Orders', icon: <CheckCircle size={20} /> },
        { path: '/coordinator/farmers', label: 'Farmers', icon: <Sprout size={20} /> },
        { path: '/coordinator/customers', label: 'Customers', icon: <Users size={20} /> },
        { path: '/coordinator/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
        { path: '/coordinator/notifications', label: 'Notifications', icon: <Bell size={20} /> },
      ];
    default:
      return [];
  }
};

const DashboardLayout = ({ role }: { role: string }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const menuItems = getRoleMenuItems(role);

  const isActive = (path: string) => {
    if (path === `/${role.toLowerCase()}`) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between py-6 px-4 border-b">
          <div className="flex items-center space-x-2">
            <Sprout className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">FarmDirect Hub</span>
          </div>
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 font-semibold border-l-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b shadow-sm z-10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <button 
              className="md:hidden text-gray-500 mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 capitalize hidden sm:block">
              {role.toLowerCase()} Portal
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterSelect />} />
            <Route path="/register/farmer" element={<FarmerRegister />} />
            <Route path="/register/consumer" element={<ConsumerRegister />} />
            <Route path="/register/coordinator" element={<CoordinatorRegister />} />
            
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<DashboardLayout role="ADMIN" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/prices" element={<PriceManagement />} />
                <Route path="/admin/farmers" element={<FarmerManagement />} />
                <Route path="/admin/consumers" element={<ConsumerManagement />} />
                <Route path="/admin/coordinators" element={<CoordinatorManagement />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
              <Route element={<DashboardLayout role="FARMER" />}>
                <Route path="/farmer" element={<FarmerDashboard />} />
                <Route path="/farmer/produce" element={<MyProduce />} />
                <Route path="/farmer/add-produce" element={<AddProduce />} />
                <Route path="/farmer/orders" element={<FarmerOrders />} />
                <Route path="/farmer/earnings" element={<FarmerEarnings />} />
                <Route path="/farmer/profile" element={<FarmerProfile />} />
                <Route path="/farmer/notifications" element={<FarmerNotifications />} />
              </Route>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['CONSUMER']} />}>
              <Route element={<DashboardLayout role="CONSUMER" />}>
                <Route path="/consumer" element={<Marketplace />} />
                <Route path="/consumer/product/:id" element={<ProductDetails />} />
                <Route path="/consumer/cart" element={<Cart />} />
                <Route path="/consumer/checkout" element={<Checkout />} />
                <Route path="/consumer/orders" element={<ConsumerOrders />} />
                <Route path="/consumer/orders/:id" element={<OrderTracking />} />
                <Route path="/consumer/profile" element={<ConsumerProfile />} />
                <Route path="/consumer/notifications" element={<ConsumerNotifications />} />
              </Route>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['COORDINATOR']} />}>
              <Route element={<DashboardLayout role="COORDINATOR" />}>
                <Route path="/coordinator" element={<CoordinatorDashboard />} />
                <Route path="/coordinator/orders" element={<PreBookedOrders />} />
                <Route path="/coordinator/orders/:id" element={<OrderDetails />} />
                <Route path="/coordinator/completed" element={<CompletedOrders />} />
                <Route path="/coordinator/farmers" element={<CoordFarmers />} />
                <Route path="/coordinator/customers" element={<CoordCustomers />} />
                <Route path="/coordinator/reports" element={<CoordReports />} />
                <Route path="/coordinator/notifications" element={<CoordNotifications />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

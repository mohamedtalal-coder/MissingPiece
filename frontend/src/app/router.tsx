import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../shared/components/layout";
import HomePage from '../features/static/HomePage';
import ProductListPage from '../features/products/ProductListPage';
import ProductDetailPage from '../features/products/ProductDetailPage';
import CartPage from '../features/cart/CartPage';
import { WishlistPage } from '../features/wishlist/WishlistPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ProfilePage } from '../features/account/ProfilePage';
import { CheckoutPage } from '../features/orders/CheckoutPage';
import { OrderHistoryPage } from '../features/orders/OrderHistoryPage';
import { AdminProductsPage } from '../features/products/AdminProductsPage';
import { AdminOrdersPage } from '../features/orders/AdminOrdersPage';
import { AdminMessagesPage } from '../features/static/AdminMessagesPage';
import { AboutPage } from '../features/static/AboutPage';
import { ContactPage } from '../features/static/ContactPage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/products',
        element: <ProductListPage />,
      },
      {
        path: '/products/:id', // Using their param naming convention or ours, let's stick to :id since it's common
        element: <ProductDetailPage />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/wishlist',
        element: <WishlistPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/orders',
        element: <OrderHistoryPage />,
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
      {
        path: '/contact',
        element: <ContactPage />,
      },
      // Admin Routes
      {
        path: '/admin/products',
        element: <AdminProductsPage />,
      },
      {
        path: '/admin/orders',
        element: <AdminOrdersPage />,
      },
      {
        path: '/admin/messages',
        element: <AdminMessagesPage />,
      },
    ]
  }
]);
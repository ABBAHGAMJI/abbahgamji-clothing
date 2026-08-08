'use client';

import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { AdminAuthProvider } from '../context/AdminAuthContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>{children}</CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

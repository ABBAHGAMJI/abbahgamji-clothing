'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '../../context/AdminAuthContext';

const LINKS = [
  { href: '/admin', label: 'Analytics' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/customers', label: 'Customers' }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutAdmin } = useAdminAuth();

  return (
    <aside className="admin-sidebar">
      <span className="logo-word">ABBAH<span style={{ color: 'var(--gold)' }}>GAMJI</span></span>
      <nav>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>{l.label}</Link>
        ))}
      </nav>
      <button className="btn btn-outline btn-sm mt-32" style={{ borderColor: 'rgba(246,241,228,.3)', color: 'var(--ivory)' }} onClick={() => { logoutAdmin(); router.push('/admin'); }}>
        Log Out
      </button>
    </aside>
  );
}

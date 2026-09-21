import { NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useLanguage } from '../../context/LanguageContext';

export function AdminAtelierNav() {
  const { t } = useLanguage();
  const n = t.adminPanel?.nav ?? {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    fulfillment: 'Orders',
    inquiries: 'Messages',
    users: 'Users',
    reviews: 'Reviews',
    faqs: 'FAQs',
    discounts: 'Discounts',
    audit: 'Audit logs',
  };

  const links = [
    { to: '/admin', label: n.dashboard, icon: 'dashboard' as const, end: true },
    { to: '/admin/products', label: n.inventory, icon: 'inventory_2' as const },
    { to: '/admin/orders', label: n.fulfillment, icon: 'local_shipping' as const },
    { to: '/admin/messages', label: n.inquiries, icon: 'chat_bubble_outline' as const },
    { to: '/admin/users', label: n.users, icon: 'group' as const },
    { to: '/admin/reviews', label: n.reviews, icon: 'star_rate' as const },
    { to: '/admin/faq', label: n.faqs, icon: 'help_outline' as const },
    { to: '/admin/discounts', label: n.discounts, icon: 'sell' as const },
    { to: '/admin/audit', label: n.audit, icon: 'history' as const },
  ];

  return (
    <div className="mb-space-lg space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded border border-primary-container/50 bg-surface-container flex items-center justify-center font-headline-sm text-primary-container text-xs font-bold">
          MP
        </div>
        <div>
          <p className="font-label-caps text-label-caps text-primary uppercase tracking-widest">{t.adminPanel?.nav?.vaultTitle || 'Atelier Vault'}</p>
          <p className="text-[11px] text-outline">{t.adminPanel?.nav?.vaultDesc || 'Admin operations'}</p>
        </div>
      </div>
      <nav
        className="flex gap-1 overflow-x-auto pb-1 border-b border-outline-variant/30"
        aria-label={t.adminPanel?.nav?.ariaLabel || "Admin sections"}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                isActive
                  ? 'border-primary-container text-primary bg-surface-container/60'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`
            }
          >
            <Icon name={link.icon} size={16} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AdminAtelierNav;

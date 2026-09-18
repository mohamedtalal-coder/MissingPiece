import { NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';

const links = [
  { to: '/admin/products', label: 'Inventory', icon: 'inventory_2' },
  { to: '/admin/orders', label: 'Fulfillment', icon: 'local_shipping' },
  { to: '/admin/messages', label: 'Inquiries', icon: 'chat_bubble_outline' },
] as const;

export function AdminAtelierNav() {
  return (
    <div className="mb-space-lg space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded border border-primary-container/50 bg-surface-container flex items-center justify-center font-headline-sm text-primary-container text-xs font-bold">
          MP
        </div>
        <div>
          <p className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Atelier Vault</p>
          <p className="text-[11px] text-outline">Admin operations</p>
        </div>
      </div>
      <nav
        className="flex gap-1 overflow-x-auto pb-1 border-b border-outline-variant/30"
        aria-label="Admin sections"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
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

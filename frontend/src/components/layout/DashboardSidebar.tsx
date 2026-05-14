'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  Trophy, 
  User, 
  Settings, 
  Store, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Briefcase 
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
}

export default function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const customerItems: SidebarItem[] = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { label: 'CrediPay', href: '/dashboard/credit', icon: CreditCard },
    { label: 'Rewards', href: '/dashboard/rewards', icon: Trophy },
    { label: 'Profile', href: '/dashboard/verify', icon: User },
  ];

  const shopkeeperItems: SidebarItem[] = [
    { label: 'Store View', href: '/shopkeeper', icon: LayoutDashboard },
    { label: 'Manage Products', href: '/shopkeeper/products', icon: Package },
    { label: 'Incoming Orders', href: '/shopkeeper/orders', icon: ShoppingBag },
    { label: 'Receivables', href: '/shopkeeper/receivables', icon: TrendingUp },
    { label: 'Settlements', href: '/shopkeeper/settlements', icon: CreditCard },
  ];

  const adminItems: SidebarItem[] = [
    { label: 'Admin Panel', href: '/admin', icon: ShieldCheck },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Shop Approvals', href: '/admin/approvals', icon: Store },
    { label: 'All Orders', href: '/admin/orders', icon: Briefcase },
    { label: 'Interest Rules', href: '/admin/interest-rules', icon: Settings },
  ];

  const items = role === 'ADMIN' ? adminItems : role === 'SHOPKEEPER' ? shopkeeperItems : customerItems;

  return (
    <aside className="w-72 hidden lg:flex flex-col h-[calc(100vh-8rem)] sticky top-32">
      <div className="glass-dark rounded-[2.5rem] p-4 flex-1 flex flex-col gap-2">
        <div className="px-6 py-4 mb-2">
          <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">{role} PORTAL</p>
        </div>
        
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                ? 'bg-brand-500 text-white shadow-neon-blue' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-brand-500'}`} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
            </Link>
          );
        })}

        <div className="mt-auto p-6 bg-white/5 rounded-[2rem] border border-white/5">
          <p className="text-xs font-bold text-white mb-1">Premium Support</p>
          <p className="text-[10px] text-gray-500 leading-relaxed mb-3">24/7 Priority support for Pro members.</p>
          <button className="w-full py-2 bg-brand-500/10 text-brand-500 text-[10px] font-black uppercase rounded-lg border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all">
            Get Help
          </button>
        </div>
      </div>
    </aside>
  );
}

import { useAuth, type UserRole } from '../store/auth';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ShoppingBag,
  GraduationCap,
  Church,
  ScrollText,
  Wallet,
  Hand,
  Crown,
  LogOut,
  Bell,
  UserPlus,
  Heart,
  CalendarCheck,
  GitBranch,
  ClipboardCheck,
  HeartHandshake,
  Trophy,
  Image,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
  onNavigate: (section: string) => void;
  current: string;
  fullHeight?: boolean;
}

type NavItem = { label: string; section: string; icon: any; roles: UserRole[] };

const navItems: NavItem[] = [
  // HQ Super-Admin only
  { label: 'Command Centre', section: 'admin-dashboard', icon: LayoutDashboard, roles: ['hq_admin'] },
  { label: 'Landing Page CMS', section: 'admin-cms', icon: Image, roles: ['hq_admin'] },
  { label: 'Member Directory', section: 'admin-members', icon: Users, roles: ['hq_admin', 'pastor'] },
  { label: 'Cell Groups', section: 'admin-cellgroups', icon: GitBranch, roles: ['pastor'] },
  { label: 'First-Timer Pipeline', section: 'admin-firsttimers', icon: UserPlus, roles: ['hq_admin', 'pastor'] },
  { label: 'Event Registrations', section: 'admin-registrations', icon: CalendarCheck, roles: ['hq_admin', 'pastor', 'ushers'] },
  { label: 'Attendance Check-In', section: 'admin-attendance', icon: ClipboardCheck, roles: ['pastor', 'ushers'] },
  { label: 'Attendance Report', section: 'admin-attendance-report', icon: BarChart3, roles: ['hq_admin', 'pastor'] },
  { label: 'Counselling & Visits', section: 'admin-counselling', icon: HeartHandshake, roles: ['hq_admin', 'pastor'] },
  { label: 'Soul-Winning Tracker', section: 'admin-soulwinning', icon: Trophy, roles: ['hq_admin', 'pastor'] },
  { label: 'Growth Analytics', section: 'analytics', icon: BarChart3, roles: ['hq_admin'] },
  { label: 'Bookstore Admin', section: 'admin-bookstore', icon: ShoppingBag, roles: ['hq_admin'] },
  { label: 'Grace Giver Admin', section: 'admin-gracegiver', icon: Heart, roles: ['hq_admin'] },
  { label: 'Academy Admin', section: 'admin-academy', icon: GraduationCap, roles: ['hq_admin', 'pastor'] },
  { label: 'Branch Oversight', section: 'admin-branches', icon: Church, roles: ['hq_admin'] },
  { label: 'User Management', section: 'admin-users', icon: Crown, roles: ['hq_admin', 'pastor'] },

  // Role-specific workspaces
  { label: 'My Workspace', section: 'workspace-pastor', icon: ScrollText, roles: ['pastor'] },
  { label: 'My Workspace', section: 'workspace-treasurer', icon: Wallet, roles: ['treasurer'] },
  { label: 'My Workspace', section: 'workspace-ushers', icon: Hand, roles: ['ushers'] },

  { label: 'HQ Approvals', section: 'portal-hq', icon: Crown, roles: ['hq_admin'] },
];

export default function AdminSidebar({ onNavigate, current, fullHeight }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const filteredItems = navItems.filter((item) => item.roles.includes(user.role as UserRole));

  return (
    <aside
      className={`fixed left-0 ${fullHeight ? 'top-0' : 'top-[104px]'} bottom-0 z-30 glass-dark border-r border-gold/30 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-3 w-6 h-6 rounded-full bg-maroon border border-gold/40 grid place-items-center text-gold hover:bg-maroon-light z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-maroon grid place-items-center font-display text-xs text-ink shrink-0">
              {user.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-parchment font-medium truncate">{user.full_name}</div>
              <div className="text-[9px] uppercase tracking-widest text-gold/80">
                {user.role === 'hq_admin' ? 'HQ SUPER-ADMIN' :
                 user.role === 'pastor' ? 'BRANCH PASTOR' :
                 user.role === 'treasurer' ? 'TREASURER' : 'USHERS'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filteredItems.map((item) => {
          const active = current === item.section;
          return (
            <button
              key={item.section}
              onClick={() => onNavigate(item.section)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'text-parchment/70 hover:text-parchment hover:bg-white/5 border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="p-2 border-t border-gold/20 space-y-0.5">
        <button
          onClick={() => onNavigate('home')}
          title={collapsed ? 'Public View' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-parchment/70 hover:text-parchment hover:bg-white/5 transition ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Bell className="w-4 h-4 shrink-0 text-gold" />
          {!collapsed && <span>Public View</span>}
        </button>
        <button
          onClick={logout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-maroon-light hover:bg-white/5 transition ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

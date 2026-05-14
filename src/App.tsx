import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminSidebar from "./components/AdminSidebar";
import PortalLogin from "./components/PortalLogin";
import Home from "./sections/Home";
import LiveStream from "./sections/LiveStream";
import GraceGiver from "./sections/GraceGiver";
import PrayerTestimony from "./sections/PrayerTestimony";
import DailyManna from "./sections/DailyManna";
import Academy from "./sections/Academy";
import Bookstore from "./sections/Bookstore";
import BookstoreAdmin from "./sections/BookstoreAdmin";
import GraceGiverAdmin from "./sections/GraceGiverAdmin";
import Analytics from "./sections/Analytics";
import BranchPortal from "./sections/BranchPortal";
import MembersDirectory from "./sections/MembersDirectory";
import CellGroups from "./sections/CellGroups";
import EventRegistrations from "./sections/EventRegistrations";
import FirstTimerFollowups from "./sections/FirstTimerFollowups";
import HqDashboard from "./sections/HqDashboard";
import AttendanceCheckin from "./sections/AttendanceCheckin";
import AttendanceReport from "./sections/AttendanceReport";
import CounsellingLog from "./sections/CounsellingLog";
import SoulWinningTracker from "./sections/SoulWinningTracker";
import BranchOversight from "./sections/BranchOversight";
import LandingPageCMS from "./sections/LandingPageCMS";
import UshersWorkspace from "./sections/workspaces/UshersWorkspace";
import TreasurerWorkspace from "./sections/workspaces/TreasurerWorkspace";
import PastorWorkspace from "./sections/workspaces/PastorWorkspace";
import UserManagement from "./sections/UserManagement";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, type UserRole } from "./store/auth";
import type { Section } from "./components/Navbar";

const roleToPortalRole: Record<UserRole, 'hq' | 'pastor' | 'treasurer' | 'ushers'> = {
  hq_admin: 'hq',
  pastor: 'pastor',
  treasurer: 'treasurer',
  ushers: 'ushers',
  admin_staff: 'hq',
};

const roleToSection: Record<string, Section> = {
  hq_admin: 'admin-dashboard',
  pastor: 'workspace-pastor',
  treasurer: 'workspace-treasurer',
  ushers: 'workspace-ushers',
  admin_staff: 'admin-dashboard',
};

export default function App() {
  const [section, setSection] = useState<Section>("home");
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect on login/logout
  useEffect(() => {
    if (!user) {
      setSection('home');
    } else if (!section.startsWith('admin-') && !section.startsWith('workspace-') && section !== 'analytics') {
      const target = roleToSection[user.role] || 'admin-dashboard';
      setSection(target as Section);
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [section]);

  const onNavigate = (s: string) => {
    setSection(s as Section);
  };

  const renderSection = () => {
    switch (section) {
      case "home": return <Home go={onNavigate} />;
      case "live": return <LiveStream />;
      case "grace": return <GraceGiver />;
      case "prayer": return <PrayerTestimony />;
      case "manna": return <DailyManna />;
      case "academy": return <Academy />;
      case "bookstore": return <Bookstore />;
      case "analytics": return <Analytics />;
      case "portal": return <BranchPortal initialRole={user ? roleToPortalRole[user.role as UserRole] : undefined} />;
      case "portal-hq": return <BranchPortal initialRole="hq" />;
      case "portal-pastor": return <BranchPortal initialRole="pastor" />;
      case "portal-treasurer": return <BranchPortal initialRole="treasurer" />;
      case "portal-ushers": return <BranchPortal initialRole="ushers" />;
      case "admin-dashboard": return <HqDashboard onNavigate={onNavigate} />;
      case "admin-members": return <MembersDirectory />;
      case "admin-cellgroups": return <CellGroups />;
      case "admin-registrations": return <EventRegistrations />;
      case "admin-firsttimers": return <FirstTimerFollowups />;
      case "admin-attendance": return <AttendanceCheckin />;
      case "admin-attendance-report": return <AttendanceReport />;
      case "admin-counselling": return <CounsellingLog />;
      case "admin-soulwinning": return <SoulWinningTracker />;
      case "admin-bookstore": return <BookstoreAdmin />;
      case "admin-gracegiver": return <GraceGiverAdmin />;
      case "admin-academy": return <Academy />;
      case "admin-branches": return <BranchOversight />;
      case "admin-cms": return <LandingPageCMS />;
      case "admin-users": return <UserManagement />;
      case "workspace-ushers": return <UshersWorkspace />;
      case "workspace-treasurer": return <TreasurerWorkspace />;
      case "workspace-pastor": return <PastorWorkspace />;
      default: return <Home go={onNavigate} />;
    }
  };

  const isAdmin = section.startsWith('admin-') || section === 'analytics' || section === 'portal' || section.startsWith('portal-') || section.startsWith('workspace-');

  return (
    <div className="min-h-screen maroon-bg">
      {!isAdmin && (
        <Navbar
          current={section}
          setCurrent={onNavigate}
          onOpenLogin={() => setLoginOpen(true)}
        />
      )}

      {/* Admin sidebar — only in admin/workspace sections, NOT on public pages */}
      {user && isAdmin && (
        <AdminSidebar onNavigate={onNavigate} current={section as string} fullHeight={true} />
      )}

      {/* Main content — shift right only when admin sidebar is visible */}
      <main className={`transition-all duration-300 ${user && isAdmin ? 'ml-[240px]' : ''} ${!isAdmin ? 'pt-[104px]' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAdmin && <Footer />}

      <PortalLogin open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

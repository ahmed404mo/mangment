"use client";
import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  TrendingUp, 
  Globe,
  Contact2, 
  UserCog,
  ChevronLeft,
  Settings,
  Bell,
  GraduationCap,
  RotateCcw,
  Home,
  Send,
  Monitor // ضفنا أيقونة الشاشة هنا
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  // --- منطق الـ Context Menu المخصص ---
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <>
      {/* --- شاشة التحذير للموبايل والتابلت (تظهر فقط في الشاشات الصغيرة) --- */}
      <div className="flex lg:hidden fixed inset-0 z-[99999] bg-[#020617] flex-col items-center justify-center p-8 text-center text-white" dir="rtl">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(37,99,235,0.3)]">
            <Monitor size={48} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-black mb-3 text-slate-100">عذراً، الشاشة صغيرة جداً</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
            لوحة تحكم الإدارة تحتوي على جداول وإحصائيات دقيقة. يرجى فتح النظام من شاشة كمبيوتر (PC) لضمان أفضل تجربة استخدام.
          </p>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 rounded-xl transition-all font-bold text-sm group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            العودة وتسجيل الخروج
          </button>
        </motion.div>
      </div>

      {/* --- الكود الأصلي (يظهر فقط في شاشات اللابتوب والكمبيوتر lg:flex) --- */}
      <div 
        className="hidden lg:flex min-h-screen bg-[#f8fafc] font-sans overflow-hidden" 
        dir="rtl"
        onContextMenu={handleContextMenu}
      >
        {/* القائمة المنبثقة (Context Menu) */}
        <AnimatePresence>
          {contextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className="fixed z-[9999] w-56 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl overflow-hidden p-1.5"
            >
              <ContextItem icon={<Home size={16}/>} label="الرئيسية" onClick={() => router.push('/admin-dashboard')} />
              <ContextItem icon={<RotateCcw size={16}/>} label="تحديث الصفحة" onClick={() => window.location.reload()} />
              <div className="h-px bg-slate-100 my-1 mx-2" />
              <ContextItem icon={<Send size={16}/>} label="إرسال تعميم" onClick={() => router.push('/admin-dashboard/broadcast')} />
              <div className="h-px bg-slate-100 my-1 mx-2" />
              <ContextItem icon={<LogOut size={16}/>} label="تسجيل الخروج" onClick={() => signOut({ callbackUrl: "/login" })} variant="danger" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar - الزجاجي المطور */}
        <aside className="w-72 bg-slate-950/95 backdrop-blur-xl border-l border-white/5 text-white flex flex-col fixed h-full z-50">
          
          {/* Logo Section */}
          <div className="p-8 mb-4">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <GraduationCap size={28} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-400 font-black tracking-[2px] uppercase opacity-80">Admin Panel</span>
                <span className="text-lg font-black tracking-tight text-white">الدراسات العليا</span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            <SectionTitle title="الإدارة العامة" />
            <NavItem href="/admin-dashboard" icon={<LayoutDashboard size={20} />} label="لوحة الإحصائيات" active={isActive('/admin-dashboard')} />
            <NavItem href="/admin-dashboard/theses" icon={<FileText size={20} />} label="الرسائل العلمية" active={isActive('/admin-dashboard/theses')} />

            {/* القسم الجديد الخاص بالإشعارات والتعميمات */}
            <SectionTitle title="التواصل والنظام" />
            <NavItem 
              href="/admin-dashboard/broadcast" 
              icon={<Bell size={20} />} 
              label="إرسال إشعارات (عمومي)" 
              active={isActive('/admin-dashboard/broadcast')} 
            />
            
            <SectionTitle title="هيئة الإشراف" />
            <NavItem href="/admin-dashboard/faculty-doctors" icon={<Contact2 size={20} />} label="إدارة المشرفين" active={isActive('/admin-dashboard/faculty-doctors')} />
            <NavItem href="/admin-dashboard/promotions" icon={<TrendingUp size={20} />} label="سجل الترقيات" active={isActive('/admin-dashboard/promotions')} />
            <NavItem href="/admin-dashboard/externals" icon={<Globe size={20} />} label="المناقشين الخارجيين" active={isActive('/admin-dashboard/externals')} />

            <SectionTitle title="النظام" />
            <NavItem href="/admin-dashboard/doctors" icon={<UserCog size={20} />} label="حسابات الدخول" active={isActive('/admin-dashboard/doctors')} />
          </nav>

          {/* Logout Footer */}
          <div className="p-4 mt-auto border-t border-white/5 bg-white/5 backdrop-blur-md">
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center justify-between w-full p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                <span className="text-sm font-bold">تسجيل الخروج</span>
              </div>
              <ChevronLeft size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 mr-72 flex flex-col">
          {/* Header */}
          <header className="h-20 bg-white/70 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/60 px-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
              <span className="text-sm font-bold text-slate-500 tracking-wide">النظام قيد التشغيل</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                <div className="text-left hidden md:block">
                  <p className="text-xs font-black text-slate-900 leading-none mb-1 text-right">أدمن النظام</p>
                  <p className="text-[10px] text-slate-500 font-bold text-right">الإدارة المركزية</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                  AD
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
}

// مكون صغير لعناصر قائمة الكليك يمين
function ContextItem({ icon, label, onClick, variant = "default" }: { icon: any, label: string, onClick: () => void, variant?: "default" | "danger" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
        variant === "danger" 
        ? "text-rose-500 hover:bg-rose-50" 
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="text-slate-500 text-[10px] font-black px-4 pt-6 mb-2 uppercase tracking-[3px] opacity-60">
      {title}
    </p>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 cursor-pointer group ${
          active 
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
            {icon}
          </span>
          <span className="text-[13px] font-bold tracking-wide">{label}</span>
        </div>
        {active && (
          <motion.div 
            layoutId="activeTab" 
            className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#ffffff]"
          />
        )}
      </motion.div>
    </Link>
  );
}
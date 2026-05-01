import { prisma } from "@/lib/prisma";
import { 
  FileText, 
  Users, 
  GraduationCap, 
  Plus,
  UserCircle,
  UserCheck,     // ✅ أيقونة جديدة للأطباء (أكثر احترافية للمجتمع الأكاديمي)
  Globe,
} from "lucide-react";
import Link from "next/link";
import ThesisList from "./thesis-list";

export default async function AdminDashboardHome() {
  const [thesesCount, facultyCount, externalExaminersCount, totalUsers, doctorsCount, masterCount, phdCount, recentTheses] = await Promise.all([
    prisma.thesis.count(),
    prisma.facultyDoctor.count(),
    prisma.externalExaminer.count(),
    prisma.user.count(),                              // إجمالي جميع المستخدمين
    prisma.user.count({ where: { role: "DOCTOR" } }), // ✅ الدكاترة فقط
    prisma.thesis.count({ where: { type: "MASTER" } }),
    prisma.thesis.count({ where: { type: "PHD" } }),
    prisma.thesis.findMany({
      orderBy: { registrationDate: 'desc' },
      take: 10,
    })
  ]);

  const stats = [
    { label: "إجمالي الرسائل", value: thesesCount, icon: FileText, color: "bg-blue-600" },
    { label: "أعضاء هيئة التدريس", value: facultyCount, icon: Users, color: "bg-slate-900" },
    { label: "المناقشين الخارجيين", value: externalExaminersCount, icon: Globe, color: "bg-orange-600" },
    { label: "إجمالي المستخدمين", value: totalUsers, icon: UserCircle, color: "bg-emerald-600" },
    { label: "الدكاترة", value: doctorsCount, icon: UserCheck, color: "bg-indigo-600" }, // ✅ اسم وأيقونة جديدة
    { label: "درجة الماجستير", value: masterCount, icon: GraduationCap, color: "bg-purple-600" },
    { label: "درجة الدكتوراه", value: phdCount, icon: GraduationCap, color: "bg-amber-500" },
  ];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12" dir="rtl">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-950 tracking-tight leading-tight">
            لوحة التحكم <span className="text-blue-600">الإحصائية</span>
          </h1>
          <p className="text-slate-400 font-bold text-lg italic opacity-80">نظام إدارة الدراسات العليا والبحوث العلمية</p>
        </div>
        
        <Link 
          href="/admin-dashboard/theses" 
          className="group flex items-center justify-center gap-3 bg-slate-950 text-white px-8 py-5 rounded-[2rem] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
        >
          <Plus size={24} />
          <span className="font-black tracking-tight text-lg">تسجيل رسالة جديدة</span>
        </Link>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="relative group overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:-translate-y-2 transition-all duration-500">
            <div className={`absolute top-0 right-0 w-2 h-full ${stat.color} opacity-20`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} text-white p-3 rounded-2xl shadow-lg shadow-slate-200`}>
                <stat.icon size={24} />
              </div>
              <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest rotate-90">Live</div>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black mb-1">{stat.label}</p>
              <div className="text-3xl font-black text-slate-950 tabular-nums tracking-tighter">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Theses List Section */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="font-black text-slate-900 text-2xl flex items-center gap-3 italic">
            <span className="w-8 h-1 bg-blue-600 rounded-full inline-block"></span>
            آخر الرسائل العلمية المسجلة
          </h3>
        </div>
        
        <ThesisList initialTheses={recentTheses} />
      </div>
    </div>
  );
}
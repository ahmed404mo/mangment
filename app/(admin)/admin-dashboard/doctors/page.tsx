"use client";

import { useState, useEffect } from "react";
import { addDoctorAction, getDoctorAccounts, updateDoctorAction, deleteDoctorAction } from "./actions";
import { 
  UserPlus, ListOrdered, GraduationCap, Copy, 
  CheckCircle2, Search, User, Edit3, X, Check, AlertCircle, Trash2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorManagement() {
  const [activeTab, setActiveTab] = useState<"add" | "list">("add");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", academicTitle: "" });

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false, message: "", type: "success",
  });

  const showPopup = (message: string, type: "success" | "error") => {
    setPopup({ show: true, message, type });
    if (type === "success") {
      setTimeout(() => setPopup(p => ({ ...p, show: false })), 3000);
    }
  };

  useEffect(() => {
    if (activeTab === "list") loadAccounts();
  }, [activeTab]);

  const loadAccounts = async () => {
    const data = await getDoctorAccounts();
    setAccounts(data);
  };

  const handleEditClick = (acc: any) => {
    setEditingId(acc.id);
    setEditForm({ name: acc.name, academicTitle: acc.academicTitle });
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    const res = await updateDoctorAction(id, editForm);
    if (res.success) {
      setEditingId(null);
      await loadAccounts();
      showPopup("تم تحديث البيانات بنجاح", "success");
    } else {
      showPopup(res.error || "فشل التحديث", "error");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const res = await deleteDoctorAction(id);
    if (res.success) {
      setDeleteConfirm(null);
      await loadAccounts();
      showPopup("تم حذف الحساب بنجاح", "success");
    } else {
      showPopup(res.error || "حدث خطأ أثناء الحذف", "error");
    }
    setLoading(false);
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.doctorCode.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 relative" dir="rtl">
      
      <AnimatePresence>
        {popup.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -50, x: "-50%" }} className="fixed top-5 left-1/2 z-[9999] min-w-[320px]">
            <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-4 ${popup.type === "success" ? "bg-emerald-500/90 border-emerald-400 text-white" : "bg-rose-600/90 border-rose-400 text-white"}`}>
              <div className="bg-white/20 p-2 rounded-xl">{popup.type === "success" ? <Check size={20}/> : <AlertCircle size={20}/>}</div>
              <p className="font-black text-sm flex-1">{popup.message}</p>
              <button onClick={() => setPopup(p => ({ ...p, show: false }))} className="hover:bg-white/20 p-1 rounded-lg"><X size={16}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center top-0 left-0 m-0 p-0 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setDeleteConfirm(null)} 
              className="absolute inset-0 w-full h-full bg-slate-950/60 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="relative z-10 bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-[90%] md:w-full text-center border border-slate-100 mx-auto"
            >
              <div className="w-20 h-sc bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertCircle size={40} /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2">تأكيد الحذف</h3>
              <p className="text-slate-500 font-bold text-sm mb-8">هل أنت متأكد من حذف هذا الحساب نهائياً؟</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteConfirm)} disabled={loading} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black hover:bg-rose-700 transition-all">{loading ? "جاري الحذف..." : "نعم، احذف"}</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40 rotate-3 transition-transform duration-300">
            <UserPlus size={30} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">إدارة الحسابات</h1>
            <p className="text-sm font-bold text-slate-500 mt-2 opacity-80 italic">تحكم كامل في بيانات ولوج أعضاء التدريس</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-2xl shadow-2xl relative min-w-[320px] border border-white/5">
          <button onClick={() => setActiveTab("add")} className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all duration-300 ${activeTab === "add" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}><UserPlus size={18} /> إضافة حساب</button>
          <button onClick={() => setActiveTab("list")} className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all duration-300 ${activeTab === "list" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}><ListOrdered size={18} /> سجل البيانات</button>
          <motion.div layoutId="activeTabPill" className="absolute bg-blue-600 rounded-xl h-[calc(100%-12px)] top-[6px] w-[calc(50%-9px)] shadow-lg shadow-blue-600/40" animate={{ x: activeTab === "add" ? 0 : "-100%" }} transition={{ type: "spring", stiffness: 350, damping: 30 }} style={{ right: "6px" }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "add" ? (
          <motion.div key="add-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-2xl max-w-2xl mx-auto relative overflow-hidden z-10">
            <div className="absolute top-0 right-0 w-2 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3"><CheckCircle2 size={22} className="text-blue-600"/> إنشاء حساب جديد</h2>
            <form action={async (fd) => { setLoading(true); const res = await addDoctorAction(fd); setLoading(false); if (res.success) showPopup("تم توليد الحساب بنجاح", "success"); else showPopup(res.error || "خطأ", "error"); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-[2px]">اسم العضو</label>
                <div className="relative"><User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="name" required placeholder="الاسم الرباعي..." className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-900 shadow-inner" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-[2px]">الدرجة الأكاديمية</label>
                <select name="academicTitle" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all font-black text-slate-700 shadow-inner appearance-none"><option>معيد</option><option>مدرس مساعد</option><option>دكتور</option><option>أستاذ مساعد</option><option>أستاذ دكتور</option></select>
              </div>
              <button disabled={loading} className="w-full bg-slate-950 text-white p-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98]">{loading ? "جاري المعالجة..." : "تفعيل الحساب الآن"}</button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="list-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-md p-3 px-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 max-w-md mr-auto focus-within:border-blue-400 transition-all">
              <Search className="text-slate-400" size={20} />
              <input type="text" placeholder="ابحث بالاسم أو الكود..." className="bg-transparent w-full outline-none font-bold text-slate-800 text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-white border-b border-white/10">
                    <th className="p-6 font-black text-[11px] uppercase tracking-[2px] opacity-70">بيانات العضو</th>
                    <th className="p-6 font-black text-[11px] uppercase tracking-[2px] opacity-70 text-center">كود الدخول</th>
                    <th className="p-6 font-black text-[11px] uppercase tracking-[2px] opacity-70 text-center">كلمة المرور</th>
                    <th className="p-6 font-black text-[11px] uppercase tracking-[2px] opacity-70 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="p-6">
                        {editingId === acc.id ? (
                          <div className="flex flex-col gap-2 max-w-xs animate-in slide-in-from-right-2">
                            <input className="w-full p-3 border-2 border-blue-500 rounded-xl font-bold bg-white text-slate-900 shadow-lg outline-none" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} autoFocus />
                            <select className="w-full p-3 border-2 border-slate-200 rounded-xl font-black text-xs bg-slate-50 text-slate-800" value={editForm.academicTitle} onChange={(e) => setEditForm({...editForm, academicTitle: e.target.value})} ><option value="معيد">معيد</option><option value="مدرس مساعد">مدرس مساعد</option><option value="دكتور">دكتور</option><option value="أستاذ مساعد">أستاذ مساعد</option><option value="أستاذ دكتور">أستاذ دكتور</option></select>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-tight">{acc.name}</span>
                            <div className="flex items-center gap-1.5 mt-2"><span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><GraduationCap size={12}/> {acc.academicTitle}</span></div>
                          </div>
                        )}
                      </td>
                      <td className="p-6 text-center"><code className="bg-slate-100 text-slate-900 px-4 py-2 rounded-xl font-mono font-black text-sm border border-slate-200">{acc.doctorCode}</code></td>
                      <td className="p-6 text-center"><code className="bg-blue-600 text-white px-4 py-2 rounded-xl font-mono font-black text-sm shadow-lg shadow-blue-600/30">{acc.tempPassword}</code></td>
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-2">
                          {editingId === acc.id ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveEdit(acc.id)} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600"><Check size={20}/></button>
                              <button onClick={() => setEditingId(null)} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600"><X size={20}/></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditClick(acc)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18}/></button>
                              <button onClick={() => { navigator.clipboard.writeText(`كود: ${acc.doctorCode}\nباسوورد: ${acc.tempPassword}`); showPopup("تم نسخ البيانات", "success"); }} className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black text-[11px] hover:bg-blue-600 transition-all flex items-center gap-2 shadow-md"><Copy size={14} /> نسخ</button>
                              <button onClick={() => setDeleteConfirm(acc.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="حذف"><Trash2 size={18}/></button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
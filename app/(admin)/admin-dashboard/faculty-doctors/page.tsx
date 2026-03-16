"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  getFacultyDoctors, 
  addFacultyDoctorAction, 
  updateFacultyDoctorAction,
  deleteFacultyDoctorAction
} from "./actions";
import { Edit, Trash2, GraduationCap, UserPlus, Award, UserCog, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FacultyDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({show: false, msg: '', type: 'success'});
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const academicTitles = ["معيد", "مدرس مساعد", "مدرس", "أستاذ مساعد", "أستاذ دكتور"];

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    const data = await getFacultyDoctors();
    setDoctors(data);
  };

  const showPopup = (msg: string, type: 'success' | 'error') => {
    setPopup({ show: true, msg, type });
    setTimeout(() => setPopup(p => ({...p, show: false})), 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    let res;

    if (editingDoc) {
      formData.append("id", editingDoc.id);
      res = await updateFacultyDoctorAction(formData);
    } else {
      res = await addFacultyDoctorAction(formData);
    }

    setLoading(false);

    if (res?.success) {
      showPopup(editingDoc ? "تم تحديث البيانات بنجاح" : "تمت إضافة العضو بنجاح", "success");
      setEditingDoc(null);
      formRef.current?.reset();
      loadDoctors();
    } else {
      showPopup(res?.error || "حدث خطأ ما", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const res = await deleteFacultyDoctorAction(deleteConfirm.id);
    if (res?.success) {
      showPopup("تم حذف العضو من السجلات", "success");
      loadDoctors();
    } else {
      showPopup(res?.error || "لا يمكن الحذف", "error");
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-right pb-20 p-4" dir="rtl">
      
      {/* 1. Notification Popup */}
      <AnimatePresence>
        {popup.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -50, x: "-50%" }} className="fixed top-5 left-1/2 z-[99999] min-w-[320px]">
            <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-4 backdrop-blur-xl ${popup.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-600/90 border-rose-400 text-white'}`}>
              <div className="bg-white/20 p-2 rounded-xl">{popup.type === 'success' ? <Check size={20}/> : <AlertCircle size={20}/>}</div>
              <p className="font-black text-sm flex-1">{popup.msg}</p>
              <button onClick={() => setPopup(p => ({ ...p, show: false }))}><X size={16}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center top-0 left-0 m-0 p-0 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 w-full h-full bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative z-10 bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-[90%] md:w-full text-center border border-slate-100 mx-auto">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2">تأكيد الحذف</h3>
              <p className="text-slate-500 font-bold text-sm mb-6 leading-relaxed">هل أنت متأكد من حذف <span className="text-rose-600">{deleteConfirm.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-2">
                <button onClick={confirmDelete} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-black hover:bg-rose-700 transition-all active:scale-95">حذف نهائي</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black active:scale-95 hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-5 border-b border-slate-200 pb-8 relative z-10">
        <div className="p-4 bg-slate-950 rounded-[1.5rem] text-white shadow-2xl shadow-slate-200">
          <UserCog size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">هيئة الإشراف والتدريس</h1>
          <p className="text-slate-500 font-bold mt-1">إدارة السجل الأكاديمي والدرجات العلمية</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
        {/* Form Column */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-100 sticky top-10">
            <h3 className={`font-black text-xl mb-8 flex items-center gap-3 ${editingDoc ? 'text-amber-600' : 'text-blue-600'}`}>
              {editingDoc ? <Edit size={24} /> : <UserPlus size={24} />}
              {editingDoc ? "تحديث البيانات" : "إضافة مشرف جديد"}
            </h3>
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-widest">الاسم الرباعي</label>
                <input 
                  name="name"
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner" 
                  placeholder="الاسم الكامل..." 
                  defaultValue={editingDoc?.name || ""}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-widest">الدرجة العلمية</label>
                <div className="relative">
                  <select 
                    name="academicTitle"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:border-blue-600 appearance-none cursor-pointer" 
                    defaultValue={editingDoc?.academicTitle || academicTitles[0]}
                  >
                    {academicTitles.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white p-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${editingDoc ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-slate-950 hover:bg-blue-600 shadow-slate-200'}`}
                >
                  {loading ? <Loader2 className="animate-spin" /> : (editingDoc ? "تأكيد التعديلات" : "حفظ في السجل")}
                </button>
                
                {editingDoc && (
                  <button 
                    type="button"
                    onClick={() => { setEditingDoc(null); formRef.current?.reset(); }}
                    className="w-full py-4 text-slate-400 font-black text-sm hover:text-slate-600 transition-colors"
                  >
                    إلغاء وإضافة عضو جديد
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-950 text-white font-black text-[11px] uppercase tracking-[4px] text-center border-b border-white/10">سجل المشرفين المعتمدين</div>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <tbody className="divide-y divide-slate-100">
                  {doctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="p-7">
                        <div className="flex flex-col">
                          <div className="font-black text-slate-900 text-xl group-hover:text-blue-600 transition-colors">{doc.name}</div>
                          <div className="mt-2 flex items-center gap-2">
                             <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-100 uppercase tracking-tighter">
                                {doc.academicTitle}
                             </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-7 text-left">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingDoc(doc);
                              if (formRef.current) {
                                (formRef.current.elements.namedItem('name') as HTMLInputElement).value = doc.name;
                                (formRef.current.elements.namedItem('academicTitle') as HTMLSelectElement).value = doc.academicTitle;
                              }
                            }}
                            className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all active:scale-95"
                            title="تعديل"
                          ><Edit size={20} /></button>
                          
                          <Link href="/admin-dashboard/promotions" className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-95" title="ترقية"><Award size={20} /></Link>

                          <button 
                            onClick={() => setDeleteConfirm({id: doc.id, name: doc.name})}
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-95"
                            title="حذف"
                          ><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {doctors.length === 0 && (
                    <tr><td className="p-24 text-center font-black text-slate-300 italic tracking-widest">لا يوجد بيانات مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
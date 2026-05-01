"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  FileSpreadsheet, 
  Plus, 
  ListOrdered,
  CheckCircle2,
  UploadCloud,
  Loader2,
  Check,
  X,
  AlertCircle,
  Search,
  Edit3,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThesisForm from "./thesis-form";
import { bulkAddThesesAction, getThesesAction, deleteThesisAction, updateThesisAction } from "./actions";

export default function ThesesPage() {
  const [activeTab, setActiveTab] = useState<"excel" | "add" | "list">("excel");
  const [theses, setTheses] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [externals, setExternals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadResults, setUploadResults] = useState<any>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", studentName: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [popup, setPopup] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false, message: "", type: "success",
  });

  const showPopup = (message: string, type: "success" | "error") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup(p => ({ ...p, show: false })), 3000);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "list") loadTheses();
  }, [activeTab]);

  const loadInitialData = async () => {
    try {
      const [doctorsData, externalsData] = await Promise.all([
        fetch("/api/doctors").then(res => res.json()).catch(() => []),
        fetch("/api/externals").then(res => res.json()).catch(() => [])
      ]);
      setDoctors(doctorsData);
      setExternals(externalsData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadTheses = async () => {
    const data = await getThesesAction();
    setTheses(data);
  };

  const handleEditClick = (thesis: any) => {
    setEditingId(thesis.id);
    setEditForm({ 
      title: thesis.title, 
      studentName: thesis.studentName,
      type: thesis.type 
    });
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    const res = await updateThesisAction(id, editForm);
    if (res.success) {
      setEditingId(null);
      await loadTheses();
      showPopup("تم تحديث البيانات بنجاح", "success");
    } else {
      showPopup(res.error || "فشل التحديث", "error");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const res = await deleteThesisAction(id);
    if (res.success) {
      setDeleteConfirm(null);
      await loadTheses();
      showPopup("تم حذف الرسالة بنجاح", "success");
    } else {
      showPopup(res.error || "حدث خطأ أثناء الحذف", "error");
    }
    setLoading(false);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      showPopup("الرجاء رفع ملف Excel فقط (.xlsx أو .xls)", "error");
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);
    setUploadMessage("");
    setUploadResults(null);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const XLSX = await import("xlsx");
        
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);

        const formattedData = excelData.map((row: any) => ({
          م: row["م"] || row["id"] || "",
          القسم: row["القسم"] || row["department"] || "",
          اسم_الباحث: String(row["اسم الباحث"] || row["studentName"] || "").trim(),
          عنوان_الرسالة: String(row["عنوان الرسالة"] || row["title"] || "").trim(),
          المشرف1: row["المشرف1"] || row["supervisor1"] || "",
          المشرف2: row["المشرف2"] || row["supervisor2"] || "",
          المشرف3: row["المشرف3"] || row["supervisor3"] || "",
          تاريخ_التسجيل: row["تاريخ التسجيل"] || row["registrationDate"] || "",
          تاريخ_المنح: row["تاريخ المنح"] || row["grantDate"] || "",
          حالة_القيد: row["حالة القيد"] || row["status"] || "PENDING",
          النوع: row["النوع"] || row["type"] || "MASTER",
          ملاحظات: row["ملاحظات"] || row["notes"] || "",
          نوع_البحث: row["نوع البحث"] || row["researchType"] || "",
        })).filter(row => row.اسم_الباحث && row.عنوان_الرسالة);

        if (formattedData.length === 0) {
          clearInterval(progressInterval);
          setUploadStatus("error");
          setUploadMessage("الملف فارغ أو لا يطابق الصيغة المطلوبة");
          showPopup("الملف فارغ أو الصيغة غير صحيحة", "error");
          setUploadProgress(0);
          return;
        }

        setUploadProgress(95);

        const res = await bulkAddThesesAction(formattedData);
        
        clearInterval(progressInterval);
        
        if (res.success) {
          setUploadProgress(100);
          setUploadStatus("success");
          setUploadResults(res);
          setUploadMessage(`✅ تم استيراد ${res.successCount} رسالة بنجاح!`);
          showPopup(`تم استيراد ${res.successCount} رسالة بنجاح!`, "success");
          e.target.value = '';
          
          setTimeout(() => {
            setActiveTab("list");
            setUploadStatus("idle");
            setUploadProgress(0);
            loadTheses();
          }, 1500);
        } else {
          setUploadStatus("error");
          setUploadMessage(res.error || "فشل الاستيراد");
          showPopup(res.error || "فشل الاستيراد", "error");
        }
      } catch (error) {
        console.error(error);
        clearInterval(progressInterval);
        setUploadStatus("error");
        setUploadMessage("حدث خطأ أثناء قراءة الملف");
        showPopup("حدث خطأ أثناء قراءة الملف", "error");
        setUploadProgress(0);
      }
    };

    reader.readAsBinaryString(file);
  };

  const filteredTheses = theses.filter(thesis => 
    thesis.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    thesis.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative" dir="rtl">
      
      <AnimatePresence>
        {popup.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -50, x: "-50%" }} className="fixed top-5 left-1/2 z-[9999] min-w-[320px]">
            <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-4 ${popup.type === "success" ? "bg-emerald-500/90 border-emerald-400 text-white" : "bg-rose-600/90 border-rose-400 text-white"}`}>
              <div className="bg-white/20 p-2 rounded-xl">{popup.type === "success" ? <Check size={20}/> : <AlertCircle size={20}/>}</div>
              <p className="font-black text-sm flex-1">{popup.message}</p>
              <button onClick={() => setPopup(p => ({ ...p, show: false }))}><X size={16}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center top-0 left-0 m-0 p-0 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 w-full h-full bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative z-10 bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-[90%] md:w-full text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertCircle size={40} /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2">تأكيد الحذف</h3>
              <p className="text-slate-500 font-bold text-sm mb-8">هل أنت متأكد من حذف هذه الرسالة نهائياً؟</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black">نعم، احذف</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-950 rounded-[1.5rem] text-white shadow-2xl shadow-slate-300">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">تسجيل رسالة علمية</h1>
            <p className="text-slate-500 font-bold mt-1">إضافة البيانات الأساسية وتعيين هيئة الإشراف والمناقشة</p>
          </div>
        </div>
      </div>

      <div className="flex bg-slate-950 p-1.5 rounded-2xl shadow-2xl relative w-full max-w-md border border-white/5">
        <button onClick={() => setActiveTab("excel")} className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all duration-300 ${activeTab === "excel" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}>
          <FileSpreadsheet size={18} /> رفع Excel
        </button>
        <button onClick={() => setActiveTab("add")} className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all duration-300 ${activeTab === "add" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}>
          <Plus size={18} /> إضافة فردية
        </button>
        <button onClick={() => setActiveTab("list")} className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all duration-300 ${activeTab === "list" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}>
          <ListOrdered size={18} /> سجل البيانات
        </button>
        
        <motion.div 
          layoutId="activeTabPill" 
          className="absolute bg-blue-600 rounded-xl h-[calc(100%-12px)] top-[6px] shadow-lg shadow-blue-600/40" 
          animate={{ x: activeTab === "excel" ? 0 : activeTab === "add" ? "-100%" : "-200%" }} 
          transition={{ type: "spring", stiffness: 350, damping: 30 }} 
          style={{ right: "6px", width: "calc(33.333% - 8px)" }} 
        />
      </div>

      <AnimatePresence mode="wait">
        
        {activeTab === "excel" && (
          <motion.div key="excel-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-2xl max-w-4xl mx-auto relative overflow-hidden z-10">
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-3 flex items-center justify-center gap-3">
                <FileSpreadsheet size={28} className="text-emerald-500"/> الإضافة الجماعية للرسائل عبر Excel
              </h2>
              <p className="text-slate-500 font-bold text-sm text-center">لضمان القراءة الصحيحة، يجب أن يحتوي الصف الأول في الملف على هذه العناوين:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 justify-center mt-4">
                <span className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-mono text-xs font-bold text-center">اسم الباحث</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-mono text-xs font-bold text-center">عنوان الرسالة</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-mono text-xs font-bold text-center">المشرف1</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-mono text-xs font-bold text-center">المشرف2</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-mono text-xs font-bold text-center">المشرف3</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-mono text-xs font-bold text-center">تاريخ التسجيل</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-mono text-xs font-bold text-center">النوع</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-mono text-xs font-bold text-center">القسم (اختياري)</span>
              </div>
            </div>

            <div className={`relative border-2 border-dashed ${uploadStatus === "uploading" ? "border-emerald-500 bg-emerald-50" : uploadStatus === "success" ? "border-green-500 bg-green-50" : uploadStatus === "error" ? "border-red-500 bg-red-50" : "border-slate-300 hover:bg-slate-50"} rounded-3xl p-8 transition-all group`}>
              
              {uploadStatus === "uploading" && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-emerald-600">جاري رفع الملف...</span>
                    <span className="text-emerald-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden">
                    <motion.div className="bg-emerald-500 h-3 rounded-full" initial={{ width: "0%" }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    {uploadProgress < 30 && "📄 جاري قراءة الملف..."}
                    {uploadProgress >= 30 && uploadProgress < 70 && "🔄 جاري معالجة البيانات..."}
                    {uploadProgress >= 70 && uploadProgress < 100 && "💾 جاري حفظ البيانات في قاعدة البيانات..."}
                    {uploadProgress === 100 && "✅ تم الانتهاء بنجاح!"}
                  </p>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="mb-6 p-4 bg-green-100 rounded-xl">
                  <p className="text-green-700 font-bold text-center">{uploadMessage}</p>
                  {uploadResults && (
                    <div className="mt-3 text-sm text-center">
                      <p className="text-green-600">✓ نجح: {uploadResults.successCount}</p>
                      <p className="text-red-600">✗ فشل: {uploadResults.errorCount}</p>
                    </div>
                  )}
                </div>
              )}
              
              {uploadStatus === "error" && (
                <div className="mb-6 p-3 bg-red-100 rounded-xl text-red-700 font-bold text-center">
                  ❌ {uploadMessage}
                </div>
              )}

              {uploadStatus !== "uploading" && (
                <>
                  <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="flex flex-col items-center gap-4 relative z-0">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-transform ${uploadStatus === "success" ? "bg-green-100 text-green-600" : uploadStatus === "error" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600 group-hover:scale-110"}`}>
                      {uploadStatus === "success" ? <CheckCircle2 size={48} /> : <UploadCloud size={48} />}
                    </div>
                    <h3 className="font-black text-xl text-slate-800 text-center">اضغط هنا لاختيار ملف Excel</h3>
                    <p className="text-slate-400 font-bold text-sm">صيغ الملفات المدعومة: .xlsx, .xls</p>
                  </div>
                </>
              )}

              {uploadStatus === "error" && (
                <button onClick={() => { setUploadStatus("idle"); setUploadProgress(0); setUploadMessage(""); }} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all mx-auto block">
                  محاولة مرة أخرى
                </button>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "add" && (
          <motion.div key="add-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ThesisForm doctors={doctors} externals={externals} />
          </motion.div>
        )}

        {activeTab === "list" && (
          <motion.div key="list-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md p-3 px-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 max-w-md mr-auto">
              <Search className="text-slate-400" size={20} />
              <input type="text" placeholder="ابحث بالعنوان أو اسم الطالب..." className="bg-transparent w-full outline-none font-bold text-slate-800 text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-white border-b border-white/10">
                      <th className="p-6 font-black text-[11px]">عنوان الرسالة</th>
                      <th className="p-6 font-black text-[11px] text-center">اسم الطالب</th>
                      <th className="p-6 font-black text-[11px] text-center">النوع</th>
                      <th className="p-6 font-black text-[11px] text-center">تاريخ التسجيل</th>
                      <th className="p-6 font-black text-[11px] text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTheses.map((thesis) => (
                      <tr key={thesis.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="p-6">
                          {editingId === thesis.id ? (
                            <input className="w-full p-3 border-2 border-blue-500 rounded-xl font-bold" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} />
                          ) : (
                            <span className="font-black text-slate-900">{thesis.title}</span>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {editingId === thesis.id ? (
                            <input className="w-full p-3 border-2 border-blue-500 rounded-xl font-bold" value={editForm.studentName} onChange={(e) => setEditForm({...editForm, studentName: e.target.value})} />
                          ) : (
                            <span>{thesis.studentName}</span>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {editingId === thesis.id ? (
                            <select className="p-3 border-2 border-blue-500 rounded-xl" value={editForm.type} onChange={(e) => setEditForm({...editForm, type: e.target.value})}>
                              <option value="MASTER">ماجستير</option>
                              <option value="PHD">دكتوراه</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${thesis.type === "PHD" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}>
                              {thesis.type === "PHD" ? "دكتوراه" : "ماجستير"}
                            </span>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {new Date(thesis.registrationDate).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-2">
                            {editingId === thesis.id ? (
                              <div className="flex gap-2">
                                <button onClick={() => handleSaveEdit(thesis.id)} className="p-3 bg-emerald-500 text-white rounded-xl"><Check size={20}/></button>
                                <button onClick={() => setEditingId(null)} className="p-3 bg-rose-500 text-white rounded-xl"><X size={20}/></button>
                              </div>
                            ) : (
                              <>
                                <button onClick={() => handleEditClick(thesis)} className="p-3 text-slate-400 hover:text-blue-600"><Edit3 size={18}/></button>
                                <button onClick={() => setDeleteConfirm(thesis.id)} className="p-3 text-slate-400 hover:text-rose-600"><Trash2 size={18}/></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTheses.length === 0 && (
                      <tr><td colSpan={5} className="p-24 text-center font-black text-slate-300 italic">لا يوجد رسائل مسجلة</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
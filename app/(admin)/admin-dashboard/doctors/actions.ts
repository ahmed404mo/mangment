"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function getDoctorAccounts() {
  try {
    const accounts = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      orderBy: { createdAt: "desc" },
    });
    return accounts;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
}

export async function addDoctorAction(formData: FormData) {
  const name = formData.get("name") as string;
  const academicTitle = formData.get("academicTitle") as string;
  
  if (!name || name.length < 3) return { error: "الاسم قصير جداً" };

  const doctorCode = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
  const plainPassword = "Pass@" + Math.floor(100 + Math.random() * 900); 
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        academicTitle,
        doctorCode,
        password: hashedPassword,
        tempPassword: plainPassword,
        role: "DOCTOR",
      },
    });

    revalidatePath("/admin-dashboard/doctors");
    return { 
      success: true, 
      doctorCode: newUser.doctorCode, 
      password: plainPassword 
    };
  } catch (error) {
    console.error("Error creating account:", error);
    return { error: "حدث خطأ أثناء الإنشاء، ربما الكود مكرر، حاول مرة أخرى" };
  }
}
export async function updateDoctorAction(id: string, data: { name: string, academicTitle: string }) {
  try {
    if (!data.name || data.name.length < 3) {
      return { error: "الاسم قصير جداً" };
    }

    await prisma.user.update({
      where: { id: id },
      data: {
        name: data.name,
        academicTitle: data.academicTitle,
      },
    });

    revalidatePath("/admin-dashboard/doctors");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor:", error);
    return { error: "فشل تحديث البيانات، حاول مرة أخرى" };
  }
}


export async function getThesesAction() {
  return await prisma.thesis.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function addThesisAction(formData: FormData) {
  const title = formData.get("title") as string;
  const studentName = formData.get("studentName") as string;
  const status = formData.get("status") as string; // "PENDING" or "COMPLETED"

  try {
    await prisma.thesis.create({
      data: { title, studentName, status },
    });
    revalidatePath("/admin-dashboard/theses");
    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ أثناء إضافة الرسالة" };
  }
}
export async function deleteDoctorAction(id: string) {
  try {
    await prisma.user.delete({
      where: { id: id },
    });
    revalidatePath("/admin-dashboard/doctors");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting doctor:", error);
    return { error: error.message || "حدث خطأ غير معروف أثناء الحذف" };
  }
}
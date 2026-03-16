"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFacultyDoctors() {
  try {
    return await prisma.facultyDoctor.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    return [];
  }
}

export async function addFacultyDoctorAction(formData: FormData) {
  const name = formData.get("name") as string;
  const academicTitle = formData.get("academicTitle") as string;

  if (!name || name.length < 3) return { error: "برجاء إدخال اسم صحيح" };

  try {
    await prisma.facultyDoctor.create({
      data: { name, academicTitle }
    });
    revalidatePath("/admin-dashboard/faculty-doctors");
    revalidatePath("/admin-dashboard/theses"); 
    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ أثناء إضافة المشرف" };
  }
}

export async function updateFacultyDoctorAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const academicTitle = formData.get("academicTitle") as string;

  if (!id || !name) return { error: "بيانات غير مكتملة" };

  try {
    await prisma.facultyDoctor.update({
      where: { id },
      data: { name, academicTitle }
    });
    revalidatePath("/admin-dashboard/faculty-doctors");
    revalidatePath("/admin-dashboard/theses");
    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ أثناء التحديث" };
  }
}

export async function deleteFacultyDoctorAction(id: string) {
  try {
    await prisma.facultyDoctor.delete({ where: { id } });
    revalidatePath("/admin-dashboard/faculty-doctors");
    return { success: true };
  } catch (error) {
    return { error: "لا يمكن الحذف. هذا المشرف مرتبط برسائل علمية." };
  }
}
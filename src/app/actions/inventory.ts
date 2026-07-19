"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import * as store from "@/lib/content/store";

async function guard(): Promise<void> {
  // 本機 dev 即個人 CMS，免登入；部署為伺服器時仍需管理員身分
  if (process.env.NODE_ENV === "development") return;
  if (!(await isAdmin())) throw new Error("未登入管理員");
}

function revalidateAll(): void {
  revalidatePath("/");
  revalidatePath("/admin/inventory");
}

// ---------- 系列 ----------
export async function createSeries(name: string, description: string) {
  await guard();
  await store.createSeries(name, description || null);
  revalidateAll();
}

export async function deleteSeries(id: string) {
  await guard();
  await store.deleteSeries(id);
  revalidateAll();
}

// ---------- 收藏櫃 ----------
export async function createCabinet(name: string, location: string) {
  await guard();
  await store.createCabinet(name, location || null);
  revalidateAll();
}

export async function deleteCabinet(id: string) {
  await guard();
  await store.deleteCabinet(id);
  revalidateAll();
}

// ---------- 娃娃 ----------
export async function createDoll(input: {
  name: string;
  description: string;
  seriesId: string | null;
  cabinetId: string | null;
}): Promise<string> {
  await guard();
  const id = await store.createDoll({
    name: input.name,
    description: input.description || null,
    seriesId: input.seriesId,
    cabinetId: input.cabinetId,
  });
  revalidateAll();
  return id;
}

export async function updateDoll(
  id: string,
  input: {
    name: string;
    description: string;
    seriesId: string | null;
    cabinetId: string | null;
  }
) {
  await guard();
  await store.updateDoll(id, {
    name: input.name,
    description: input.description || null,
    seriesId: input.seriesId,
    cabinetId: input.cabinetId,
  });
  revalidateAll();
  revalidatePath(`/admin/dolls/${id}`);
}

export async function deleteDoll(id: string) {
  await guard();
  await store.deleteDoll(id);
  revalidateAll();
}

// ---------- 造型（一對多） ----------
/** 儲存去背 PNG 到 public/collection/ 並建立造型記錄 */
export async function addVariant(formData: FormData) {
  await guard();
  const dollId = String(formData.get("dollId"));
  const name = String(formData.get("name") || "預設造型");
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("缺少圖片檔案");

  await store.addVariant(dollId, name, file);
  revalidateAll();
  revalidatePath(`/admin/dolls/${dollId}`);
}

export async function renameVariant(id: string, dollId: string, name: string) {
  await guard();
  await store.renameVariant(id, name);
  revalidateAll();
  revalidatePath(`/admin/dolls/${dollId}`);
}

export async function deleteVariant(id: string, dollId: string) {
  await guard();
  await store.deleteVariant(id);
  revalidateAll();
  revalidatePath(`/admin/dolls/${dollId}`);
}

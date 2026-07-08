"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

const BUCKET = "doll-images";

async function guard(): Promise<void> {
  if (!(await isAdmin())) throw new Error("未登入管理員");
}

function revalidateAll(): void {
  revalidatePath("/");
  revalidatePath("/admin/inventory");
}

// ---------- 系列 ----------
export async function createSeries(name: string, description: string) {
  await guard();
  const { error } = await supabaseAdmin()
    .from("series")
    .insert({ name, description: description || null });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteSeries(id: string) {
  await guard();
  const { error } = await supabaseAdmin().from("series").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

// ---------- 收藏櫃 ----------
export async function createCabinet(name: string, location: string) {
  await guard();
  const { error } = await supabaseAdmin()
    .from("cabinets")
    .insert({ name, location: location || null });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteCabinet(id: string) {
  await guard();
  const { error } = await supabaseAdmin().from("cabinets").delete().eq("id", id);
  if (error) throw new Error(error.message);
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
  const { data, error } = await supabaseAdmin()
    .from("dolls")
    .insert({
      name: input.name,
      description: input.description || null,
      series_id: input.seriesId,
      cabinet_id: input.cabinetId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidateAll();
  return data.id as string;
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
  const { error } = await supabaseAdmin()
    .from("dolls")
    .update({
      name: input.name,
      description: input.description || null,
      series_id: input.seriesId,
      cabinet_id: input.cabinetId,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  revalidatePath(`/admin/dolls/${id}`);
}

export async function deleteDoll(id: string) {
  await guard();
  const { error } = await supabaseAdmin().from("dolls").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

// ---------- 造型（一對多） ----------
/** 上傳去背 PNG 並建立造型記錄 */
export async function addVariant(formData: FormData) {
  await guard();
  const dollId = String(formData.get("dollId"));
  const name = String(formData.get("name") || "預設造型");
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("缺少圖片檔案");

  const sb = supabaseAdmin();
  const path = `variants/${dollId}/${Date.now()}.png`;
  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { contentType: "image/png", upsert: false });
  if (upErr) throw new Error(`上傳失敗：${upErr.message}`);

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);

  const { count } = await sb
    .from("doll_variants")
    .select("id", { count: "exact", head: true })
    .eq("doll_id", dollId);

  const { error } = await sb.from("doll_variants").insert({
    doll_id: dollId,
    name,
    image_url: pub.publicUrl,
    sort_order: count ?? 0,
  });
  if (error) throw new Error(error.message);
  revalidateAll();
  revalidatePath(`/admin/dolls/${dollId}`);
}

export async function renameVariant(id: string, dollId: string, name: string) {
  await guard();
  const { error } = await supabaseAdmin()
    .from("doll_variants")
    .update({ name })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  revalidatePath(`/admin/dolls/${dollId}`);
}

export async function deleteVariant(id: string, dollId: string) {
  await guard();
  const { error } = await supabaseAdmin()
    .from("doll_variants")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  revalidatePath(`/admin/dolls/${dollId}`);
}

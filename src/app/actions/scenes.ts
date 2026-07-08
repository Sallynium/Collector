"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { SceneItem } from "@/lib/types";

const BUCKET = "doll-images";

async function guard(): Promise<void> {
  if (!(await isAdmin())) throw new Error("未登入管理員");
}

function revalidateScenes(id?: string): void {
  revalidatePath("/scenes");
  revalidatePath("/admin/scenes");
  if (id) {
    revalidatePath(`/scenes/${id}`);
    revalidatePath(`/admin/scenes/${id}`);
  }
}

export async function createScene(name: string): Promise<string> {
  await guard();
  const { data, error } = await supabaseAdmin()
    .from("scenes")
    .insert({ name })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidateScenes();
  return data.id as string;
}

export async function deleteScene(id: string) {
  await guard();
  const { error } = await supabaseAdmin().from("scenes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateScenes(id);
}

/** 上傳場景背景圖 */
export async function uploadSceneBackground(formData: FormData) {
  await guard();
  const sceneId = String(formData.get("sceneId"));
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("缺少圖片檔案");

  const sb = supabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `backgrounds/${sceneId}/${Date.now()}.${ext}`;
  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw new Error(`上傳失敗：${upErr.message}`);

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
  const { error } = await sb
    .from("scenes")
    .update({ background_url: pub.publicUrl, updated_at: new Date().toISOString() })
    .eq("id", sceneId);
  if (error) throw new Error(error.message);
  revalidateScenes(sceneId);
  return pub.publicUrl;
}

/** 儲存畫布佈局（陣列順序即圖層 z-index） */
export async function saveSceneLayout(id: string, layout: SceneItem[]) {
  await guard();
  const { error } = await supabaseAdmin()
    .from("scenes")
    .update({ layout, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateScenes(id);
}

export async function setScenePublished(id: string, published: boolean) {
  await guard();
  const { error } = await supabaseAdmin()
    .from("scenes")
    .update({ is_published: published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateScenes(id);
}

export async function renameScene(id: string, name: string) {
  await guard();
  const { error } = await supabaseAdmin()
    .from("scenes")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateScenes(id);
}

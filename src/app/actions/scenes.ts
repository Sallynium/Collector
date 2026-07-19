"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import * as store from "@/lib/content/store";
import type { SceneItem } from "@/lib/types";

async function guard(): Promise<void> {
  // 本機 dev 即個人 CMS，免登入；部署為伺服器時仍需管理員身分
  if (process.env.NODE_ENV === "development") return;
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
  const id = await store.createScene(name);
  revalidateScenes();
  return id;
}

export async function deleteScene(id: string) {
  await guard();
  await store.deleteScene(id);
  revalidateScenes(id);
}

/** 儲存場景背景圖到 public/collection/scenes/ */
export async function uploadSceneBackground(formData: FormData) {
  await guard();
  const sceneId = String(formData.get("sceneId"));
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("缺少圖片檔案");

  const url = await store.saveSceneBackground(sceneId, file);
  revalidateScenes(sceneId);
  return url;
}

/** 儲存畫布佈局（陣列順序即圖層 z-index） */
export async function saveSceneLayout(id: string, layout: SceneItem[]) {
  await guard();
  await store.saveSceneLayout(id, layout);
  revalidateScenes(id);
}

export async function setScenePublished(id: string, published: boolean) {
  await guard();
  await store.setScenePublished(id, published);
  revalidateScenes(id);
}

export async function renameScene(id: string, name: string) {
  await guard();
  await store.renameScene(id, name);
  revalidateScenes(id);
}

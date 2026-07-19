import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  Cabinet,
  Doll,
  DollVariant,
  Scene,
  SceneItem,
  Series,
} from "@/lib/types";

/**
 * Repo 內容模式的資料層：所有資料存 content/data.json，
 * 圖片存 public/collection/，git push 即發布。
 */

export interface ContentData {
  series: Series[];
  cabinets: Cabinet[];
  dolls: Doll[];
  doll_variants: DollVariant[];
  scenes: Scene[];
}

const DATA_PATH = path.join(process.cwd(), "content", "data.json");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const DOLL_IMG_URL = "/collection/dolls";
const SCENE_IMG_URL = "/collection/scenes";

const EMPTY: ContentData = {
  series: [],
  cabinets: [],
  dolls: [],
  doll_variants: [],
  scenes: [],
};

export async function readData(): Promise<ContentData> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<ContentData>) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { ...EMPTY };
    throw e;
  }
}

async function writeData(data: ContentData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/** 只刪 public/collection/ 底下的檔案；其他來源（如舊 Supabase 網址）略過 */
async function deleteImageFile(url: string | null): Promise<void> {
  if (!url || !url.startsWith("/collection/")) return;
  try {
    await fs.unlink(path.join(PUBLIC_DIR, url));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}

async function saveImageFile(urlDir: string, ext: string, file: File): Promise<string> {
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(PUBLIC_DIR, urlDir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `${urlDir}/${filename}`;
}

const byName = <T extends { name: string }>(a: T, b: T) =>
  a.name.localeCompare(b.name, "zh-Hant");
const byNewest = <T extends { created_at: string }>(a: T, b: T) =>
  b.created_at.localeCompare(a.created_at);

// ---------- 讀取 ----------

export async function listSeries(): Promise<Series[]> {
  return (await readData()).series.sort(byName);
}

export async function listCabinets(): Promise<Cabinet[]> {
  return (await readData()).cabinets.sort(byName);
}

/** 娃娃列表（新→舊），附掛各自的造型（sort_order 排序） */
export async function listDollsWithVariants(): Promise<Doll[]> {
  const data = await readData();
  return data.dolls.sort(byNewest).map((d) => ({
    ...d,
    doll_variants: data.doll_variants
      .filter((v) => v.doll_id === d.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function getDoll(id: string): Promise<Doll | null> {
  return (await readData()).dolls.find((d) => d.id === id) ?? null;
}

export async function listVariants(dollId: string): Promise<DollVariant[]> {
  return (await readData()).doll_variants
    .filter((v) => v.doll_id === dollId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function listAllScenes(): Promise<Scene[]> {
  return (await readData()).scenes.sort(byNewest);
}

export async function listPublishedScenes(): Promise<Scene[]> {
  return (await readData()).scenes.filter((s) => s.is_published).sort(byNewest);
}

export async function getScene(id: string): Promise<Scene | null> {
  return (await readData()).scenes.find((s) => s.id === id) ?? null;
}

export async function getPublishedScene(id: string): Promise<Scene | null> {
  const scene = await getScene(id);
  return scene?.is_published ? scene : null;
}

// ---------- 系列 ----------

export async function createSeries(name: string, description: string | null): Promise<void> {
  const data = await readData();
  data.series.push({
    id: randomUUID(),
    name,
    description,
    created_at: new Date().toISOString(),
  });
  await writeData(data);
}

export async function deleteSeries(id: string): Promise<void> {
  const data = await readData();
  data.series = data.series.filter((s) => s.id !== id);
  for (const d of data.dolls) if (d.series_id === id) d.series_id = null;
  await writeData(data);
}

// ---------- 收藏櫃 ----------

export async function createCabinet(name: string, location: string | null): Promise<void> {
  const data = await readData();
  data.cabinets.push({
    id: randomUUID(),
    name,
    location,
    created_at: new Date().toISOString(),
  });
  await writeData(data);
}

export async function deleteCabinet(id: string): Promise<void> {
  const data = await readData();
  data.cabinets = data.cabinets.filter((c) => c.id !== id);
  for (const d of data.dolls) if (d.cabinet_id === id) d.cabinet_id = null;
  await writeData(data);
}

// ---------- 娃娃 ----------

export async function createDoll(input: {
  name: string;
  description: string | null;
  seriesId: string | null;
  cabinetId: string | null;
}): Promise<string> {
  const data = await readData();
  const id = randomUUID();
  data.dolls.push({
    id,
    name: input.name,
    description: input.description,
    series_id: input.seriesId,
    cabinet_id: input.cabinetId,
    created_at: new Date().toISOString(),
  });
  await writeData(data);
  return id;
}

export async function updateDoll(
  id: string,
  input: {
    name: string;
    description: string | null;
    seriesId: string | null;
    cabinetId: string | null;
  }
): Promise<void> {
  const data = await readData();
  const doll = data.dolls.find((d) => d.id === id);
  if (!doll) throw new Error("找不到娃娃");
  doll.name = input.name;
  doll.description = input.description;
  doll.series_id = input.seriesId;
  doll.cabinet_id = input.cabinetId;
  await writeData(data);
}

export async function deleteDoll(id: string): Promise<void> {
  const data = await readData();
  const removed = data.doll_variants.filter((v) => v.doll_id === id);
  data.dolls = data.dolls.filter((d) => d.id !== id);
  data.doll_variants = data.doll_variants.filter((v) => v.doll_id !== id);
  await writeData(data);
  for (const v of removed) await deleteImageFile(v.image_url);
}

// ---------- 造型 ----------

export async function addVariant(
  dollId: string,
  name: string,
  file: File
): Promise<void> {
  const imageUrl = await saveImageFile(DOLL_IMG_URL, "png", file);
  const data = await readData();
  const count = data.doll_variants.filter((v) => v.doll_id === dollId).length;
  data.doll_variants.push({
    id: randomUUID(),
    doll_id: dollId,
    name,
    image_url: imageUrl,
    sort_order: count,
    created_at: new Date().toISOString(),
  });
  await writeData(data);
}

export async function renameVariant(id: string, name: string): Promise<void> {
  const data = await readData();
  const variant = data.doll_variants.find((v) => v.id === id);
  if (!variant) throw new Error("找不到造型");
  variant.name = name;
  await writeData(data);
}

export async function deleteVariant(id: string): Promise<void> {
  const data = await readData();
  const removed = data.doll_variants.find((v) => v.id === id);
  data.doll_variants = data.doll_variants.filter((v) => v.id !== id);
  await writeData(data);
  if (removed) await deleteImageFile(removed.image_url);
}

// ---------- 場景 ----------

export async function createScene(name: string): Promise<string> {
  const data = await readData();
  const id = randomUUID();
  const now = new Date().toISOString();
  data.scenes.push({
    id,
    name,
    background_url: null,
    layout: [],
    is_published: false,
    created_at: now,
    updated_at: now,
  });
  await writeData(data);
  return id;
}

export async function deleteScene(id: string): Promise<void> {
  const data = await readData();
  const removed = data.scenes.find((s) => s.id === id);
  data.scenes = data.scenes.filter((s) => s.id !== id);
  await writeData(data);
  if (removed) await deleteImageFile(removed.background_url);
}

function mustGetScene(data: ContentData, id: string): Scene {
  const scene = data.scenes.find((s) => s.id === id);
  if (!scene) throw new Error("找不到場景");
  return scene;
}

export async function saveSceneBackground(sceneId: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const imageUrl = await saveImageFile(SCENE_IMG_URL, ext, file);
  const data = await readData();
  const scene = mustGetScene(data, sceneId);
  const oldUrl = scene.background_url;
  scene.background_url = imageUrl;
  scene.updated_at = new Date().toISOString();
  await writeData(data);
  await deleteImageFile(oldUrl);
  return imageUrl;
}

export async function saveSceneLayout(id: string, layout: SceneItem[]): Promise<void> {
  const data = await readData();
  const scene = mustGetScene(data, id);
  scene.layout = layout;
  scene.updated_at = new Date().toISOString();
  await writeData(data);
}

export async function setScenePublished(id: string, published: boolean): Promise<void> {
  const data = await readData();
  const scene = mustGetScene(data, id);
  scene.is_published = published;
  scene.updated_at = new Date().toISOString();
  await writeData(data);
}

export async function renameScene(id: string, name: string): Promise<void> {
  const data = await readData();
  const scene = mustGetScene(data, id);
  scene.name = name;
  scene.updated_at = new Date().toISOString();
  await writeData(data);
}

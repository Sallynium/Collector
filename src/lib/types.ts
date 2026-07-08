export interface Series {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Cabinet {
  id: string;
  name: string;
  location: string | null;
  created_at: string;
}

export interface DollVariant {
  id: string;
  doll_id: string;
  name: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Doll {
  id: string;
  name: string;
  description: string | null;
  series_id: string | null;
  cabinet_id: string | null;
  created_at: string;
  doll_variants?: DollVariant[];
  series?: Series | null;
  cabinets?: Cabinet | null;
}

/** 場景畫布上一個已擺放的娃娃 */
export interface SceneItem {
  doll_id: string;
  variant_id: string;
  image_url: string;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  flipX?: boolean;
}

export interface Scene {
  id: string;
  name: string;
  background_url: string | null;
  layout: SceneItem[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

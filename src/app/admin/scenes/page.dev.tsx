import { listAllScenes } from "@/lib/content/store";
import { ScenesManager } from "@/components/admin/scenes-manager";

export const dynamic = "force-dynamic";

export default async function AdminScenesPage() {
  const scenes = await listAllScenes();
  return <ScenesManager scenes={scenes} />;
}

import { listCabinets, listDollsWithVariants, listSeries } from "@/lib/content/store";
import { InventoryManager } from "@/components/admin/inventory-manager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [dolls, series, cabinets] = await Promise.all([
    listDollsWithVariants(),
    listSeries(),
    listCabinets(),
  ]);

  return (
    <InventoryManager dolls={dolls} series={series} cabinets={cabinets} />
  );
}

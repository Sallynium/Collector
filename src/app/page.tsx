import { listCabinets, listDollsWithVariants, listSeries } from "@/lib/content/store";
import { Gallery } from "@/components/gallery";

export default async function HomePage() {
  const [dolls, series, cabinets] = await Promise.all([
    listDollsWithVariants(),
    listSeries(),
    listCabinets(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏆 我的電競娃娃收藏</h1>
        <p className="mt-1 text-muted-foreground">
          點擊娃娃可切換欣賞不同造型
        </p>
      </div>
      <Gallery dolls={dolls} series={series} cabinets={cabinets} />
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getDoll, listVariants } from "@/lib/content/store";
import { VariantManager } from "@/components/admin/variant-manager";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doll = await getDoll(id);
  if (!doll) notFound();

  const variants = await listVariants(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/inventory"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← 回庫存管理
          </Link>
          <h1 className="text-2xl font-bold">{doll.name}</h1>
        </div>
        <Link href={`/admin/dolls/${id}/new`}>
          <Button>新增造型</Button>
        </Link>
      </div>
      <VariantManager dollId={id} variants={variants} />
    </div>
  );
}

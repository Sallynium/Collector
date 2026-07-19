import Link from "next/link";
import { BgRemovalEditor } from "@/components/admin/bg-removal-editor";

export default async function NewVariantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <Link
        href={`/admin/dolls/${id}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← 回娃娃詳細頁
      </Link>
      <h1 className="text-2xl font-bold">新增造型 — AI 去背編輯器</h1>
      <BgRemovalEditor dollId={id} />
    </div>
  );
}

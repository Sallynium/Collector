import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link href="/admin/inventory">
        <Card className="transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle>📦 庫存管理</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            管理系列、收藏櫃、娃娃檔案與造型照片（AI 去背 + 魔術筆）
          </CardContent>
        </Card>
      </Link>
      <Link href="/admin/scenes">
        <Card className="transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle>🖼️ 虛擬收藏室</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            建立場景、上傳背景圖，拖移娃娃拼出你的展示櫃
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 尚未完成初始設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>歡迎使用電競娃娃虛擬收藏室！請完成以下步驟：</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            到 <span className="font-mono text-foreground">supabase.com</span>{" "}
            建立免費專案
          </li>
          <li>
            在 Supabase SQL Editor 執行專案內的{" "}
            <span className="font-mono text-foreground">supabase/schema.sql</span>
          </li>
          <li>
            複製 <span className="font-mono text-foreground">.env.example</span>{" "}
            為 <span className="font-mono text-foreground">.env.local</span>{" "}
            並填入 Supabase URL、金鑰與管理員密碼
          </li>
          <li>重新啟動開發伺服器（或在 Vercel 重新部署）</li>
        </ol>
        <p>詳細教學請見專案 README。</p>
      </CardContent>
    </Card>
  );
}

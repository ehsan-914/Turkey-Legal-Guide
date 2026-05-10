import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background" dir="rtl">
      <Card className="w-full max-w-md mx-4 border-0 shadow-lg">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="size-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
              <AlertCircle className="size-8" />
            </div>
            <h1 className="text-6xl font-bold font-serif text-primary">۴۰۴</h1>
            <h2 className="text-xl font-bold text-foreground">صفحه مورد نظر یافت نشد</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
          </p>

          <Link href="/">
            <Button className="gap-2">
              <Home className="size-4" />
              بازگشت به صفحه اصلی
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

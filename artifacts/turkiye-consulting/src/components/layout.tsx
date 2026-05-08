import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-8 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-xl leading-none">T</span>
              </div>
              <span className="font-serif font-bold text-lg hidden sm:inline-block">Türkiye Danışmanlık</span>
            </Link>
            
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">خانه</Link>
              <Link href="/services" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">خدمات</Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">تماس با ما</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hidden sm:inline-flex">
              <Button>درخواست مشاوره</Button>
            </Link>
            <Link href="/admin/login" className="text-xs text-muted-foreground hover:text-foreground">
              ورود مدیر
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card text-card-foreground">
        <div className="container mx-auto py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-sm bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-bold text-xl leading-none">T</span>
                </div>
                <span className="font-serif font-bold text-lg">Türkiye Danışmanlık</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                همراه مورد اعتماد شما در ترکیه برای امور مهاجرت، تحصیل و حقوقی.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 font-serif">خدمات</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/services?category=education" className="hover:text-foreground transition-colors">تحصیلی</Link></li>
                <li><Link href="/services?category=residency" className="hover:text-foreground transition-colors">اقامت</Link></li>
                <li><Link href="/services?category=legal" className="hover:text-foreground transition-colors">حقوقی</Link></li>
                <li><Link href="/services?category=work" className="hover:text-foreground transition-colors">کاری</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 font-serif">لینک‌های سریع</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground transition-colors">خانه</Link></li>
                <li><Link href="/services" className="hover:text-foreground transition-colors">همه خدمات</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">تماس با ما</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 font-serif">تماس</h3>
              <address className="not-italic space-y-2 text-sm text-muted-foreground">
                <p>استانبول، شیشلی</p>
                <p>تلفن: +90 555 123 4567</p>
                <p>ایمیل: info@turkiyedanismanlik.com</p>
              </address>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Türkiye Danışmanlık. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

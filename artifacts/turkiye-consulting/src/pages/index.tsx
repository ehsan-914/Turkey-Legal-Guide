import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout";
import { ChevronLeft, Shield, GraduationCap, Building, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary to-transparent" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 leading-tight max-w-4xl mx-auto">
            مسیری مطمئن برای آینده شما در ترکیه
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-primary-foreground/80 leading-relaxed">
            Türkiye Danışmanlık با سال‌ها تجربه، همراه مورد اعتماد شما در امور مهاجرت، تحصیل، ثبت شرکت و خدمات حقوقی در ترکیه است.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base h-12 px-8 w-full sm:w-auto">
                درخواست مشاوره رایگان
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base h-12 px-8 w-full sm:w-auto">
                آشنایی با خدمات ما
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4 text-foreground">خدمات تخصصی ما</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              تیم مجرب ما با آگاهی کامل از قوانین ترکیه، راهکارهای جامعی را برای نیازهای مختلف شما ارائه می‌دهد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard 
              icon={<GraduationCap className="size-8 text-secondary" />}
              title="مشاوره تحصیلی"
              desc="اخذ پذیرش از بهترین دانشگاه‌های ترکیه، بورسیه تحصیلی و معادل‌سازی مدارک."
              link="/services?category=education"
            />
            <ServiceCard 
              icon={<Building className="size-8 text-secondary" />}
              title="اقامت و شهروندی"
              desc="دریافت انواع اقامت ترکیه، خرید ملک و پروسه اخذ شهروندی و پاسپورت."
              link="/services?category=residency"
            />
            <ServiceCard 
              icon={<Shield className="size-8 text-secondary" />}
              title="خدمات حقوقی"
              desc="پشتیبانی حقوقی در قراردادها، دعاوی مدنی و امور ثبتی توسط وکلای رسمی."
              link="/services?category=legal"
            />
            <ServiceCard 
              icon={<Briefcase className="size-8 text-secondary" />}
              title="ثبت شرکت و کار"
              desc="تاسیس شرکت، اخذ مجوز کار (چالیشما ایزین) و خدمات حسابداری و مالیاتی."
              link="/services?category=work"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/50 border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-6 text-foreground">چرا Türkiye Danışmanlık را انتخاب کنید؟</h2>
              <div className="w-16 h-1 bg-secondary mb-8"></div>
              
              <div className="space-y-6">
                <FeatureItem 
                  title="تیم وکلای رسمی ترک"
                  desc="تمامی امور حقوقی و ثبتی شما مستقیماً توسط وکلای پایه یک دادگستری ترکیه انجام می‌پذیرد."
                />
                <FeatureItem 
                  title="شفافیت مالی و زمانی"
                  desc="ارائه گزارش‌های دقیق از پیشرفت پرونده و هزینه‌های مصوب بدون هیچ هزینه پنهان."
                />
                <FeatureItem 
                  title="آشنایی با فرهنگ ایرانی"
                  desc="تیم ما متشکل از مشاوران مسلط به زبان فارسی و آشنا با نیازها و دغدغه‌های ایرانیان است."
                />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-primary/5 rounded-2xl border flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="text-center p-8 bg-background/80 backdrop-blur rounded-xl border shadow-lg max-w-sm relative z-10">
                  <Shield className="size-16 text-secondary mx-auto mb-4" />
                  <h3 className="font-serif font-bold text-2xl mb-2">تضمین کیفیت</h3>
                  <p className="text-muted-foreground text-sm">ما با افتخار در کنار شما هستیم تا مسیر موفقیت در ترکیه را با اطمینان طی کنید.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">آماده شروع هستید؟</h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            برای دریافت مشاوره اولیه رایگان با کارشناسان ما تماس بگیرید. پرونده شما با دقت بررسی شده و بهترین راهکار ارائه خواهد شد.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-14 px-10 text-lg">
              ارتباط با ما
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

function ServiceCard({ icon, title, desc, link }: { icon: React.ReactNode, title: string, desc: string, link: string }) {
  return (
    <Card className="border transition-all hover:shadow-lg hover:border-secondary/50 h-full flex flex-col group">
      <CardContent className="p-8 flex-1 flex flex-col items-center text-center">
        <div className="mb-6 p-4 rounded-full bg-muted group-hover:bg-secondary/10 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold font-serif mb-4 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{desc}</p>
        <Link href={link} className="text-secondary font-medium flex items-center gap-1 hover:underline mt-auto">
          اطلاعات بیشتر <ChevronLeft className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 mt-1">
        <div className="size-6 rounded-full bg-secondary/20 flex items-center justify-center">
          <div className="size-2 rounded-full bg-secondary"></div>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout";
import { useGetSiteContent } from "@workspace/api-client-react";
import {
  ChevronLeft, Shield, GraduationCap, Building, Briefcase,
  CheckCircle2, Users, Award, Clock, Star, ArrowLeft
} from "lucide-react";

const DEFAULTS: Record<string, string> = {
  "hero.title": "مسیری مطمئن برای آینده شما در ترکیه",
  "hero.subtitle": "Türkiye Danışmanlık با سال‌ها تجربه، همراه مورد اعتماد شما در امور مهاجرت، تحصیل، ثبت شرکت و خدمات حقوقی در ترکیه است.",
  "hero.cta_primary": "درخواست مشاوره رایگان",
  "hero.cta_secondary": "آشنایی با خدمات ما",
  "stats.clients": "۵۰۰+",
  "stats.clients_label": "مشتری موفق",
  "stats.years": "۸+",
  "stats.years_label": "سال تجربه",
  "stats.success_rate": "۹۸٪",
  "stats.success_rate_label": "نرخ موفقیت",
  "stats.lawyers": "۱۵+",
  "stats.lawyers_label": "وکیل رسمی",
  "about.title": "چرا Türkiye Danışmanlık را انتخاب کنید؟",
  "about.feature1_title": "تیم وکلای رسمی ترک",
  "about.feature1_desc": "تمامی امور حقوقی و ثبتی شما مستقیماً توسط وکلای پایه یک دادگستری ترکیه انجام می‌پذیرد.",
  "about.feature2_title": "شفافیت مالی و زمانی",
  "about.feature2_desc": "ارائه گزارش‌های دقیق از پیشرفت پرونده و هزینه‌های مصوب بدون هیچ هزینه پنهان.",
  "about.feature3_title": "آشنایی با فرهنگ ایرانی",
  "about.feature3_desc": "تیم ما متشکل از مشاوران مسلط به زبان فارسی و آشنا با نیازها و دغدغه‌های ایرانیان است.",
  "cta.title": "آماده شروع هستید؟",
  "cta.subtitle": "برای دریافت مشاوره اولیه رایگان با کارشناسان ما تماس بگیرید. پرونده شما با دقت بررسی شده و بهترین راهکار ارائه خواهد شد.",
  "cta.button": "ارتباط با ما",
};

function c(content: Record<string, string> | undefined, key: string) {
  return content?.[key] || DEFAULTS[key] || "";
}

export default function Home() {
  const { data: content } = useGetSiteContent();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-background"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        <div className="container mx-auto px-4 md:px-6 py-28 md:py-36 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 text-secondary-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Star className="size-3.5 fill-current" />
            خدمات تخصصی برای ایرانیان در ترکیه
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 leading-tight max-w-4xl mx-auto">
            {c(content, "hero.title")}
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-primary-foreground/75 leading-relaxed">
            {c(content, "hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base h-13 px-8 w-full sm:w-auto shadow-lg shadow-secondary/20">
                {c(content, "hero.cta_primary")}
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 text-base h-13 px-8 w-full sm:w-auto">
                {c(content, "hero.cta_secondary")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-14 bg-background border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem value={c(content, "stats.clients")} label={c(content, "stats.clients_label")} icon={<Users className="size-5" />} />
            <StatItem value={c(content, "stats.years")} label={c(content, "stats.years_label")} icon={<Clock className="size-5" />} />
            <StatItem value={c(content, "stats.success_rate")} label={c(content, "stats.success_rate_label")} icon={<Award className="size-5" />} />
            <StatItem value={c(content, "stats.lawyers")} label={c(content, "stats.lawyers_label")} icon={<Shield className="size-5" />} />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4 text-foreground">خدمات تخصصی ما</h2>
            <div className="w-12 h-1 bg-secondary mx-auto mb-5 rounded-full" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              تیم مجرب ما با آگاهی کامل از قوانین ترکیه، راهکارهای جامعی را برای نیازهای مختلف شما ارائه می‌دهد.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard icon={<GraduationCap className="size-7" />} title="مشاوره تحصیلی" desc="اخذ پذیرش از بهترین دانشگاه‌های ترکیه، بورسیه تحصیلی و معادل‌سازی مدارک." link="/services?category=education" color="blue" />
            <ServiceCard icon={<Building className="size-7" />} title="اقامت و شهروندی" desc="دریافت انواع اقامت ترکیه، خرید ملک و پروسه اخذ شهروندی و پاسپورت." link="/services?category=residency" color="emerald" />
            <ServiceCard icon={<Shield className="size-7" />} title="خدمات حقوقی" desc="پشتیبانی حقوقی در قراردادها، دعاوی مدنی و امور ثبتی توسط وکلای رسمی." link="/services?category=legal" color="violet" />
            <ServiceCard icon={<Briefcase className="size-7" />} title="ثبت شرکت و کار" desc="تاسیس شرکت، اخذ مجوز کار (چالیشما ایزین) و خدمات حسابداری و مالیاتی." link="/services?category=work" color="amber" />
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 bg-muted/40 border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4">فرآیند کار با ما</h2>
            <div className="w-12 h-1 bg-secondary mx-auto mb-5 rounded-full" />
            <p className="text-muted-foreground max-w-xl mx-auto">از اولین تماس تا نتیجه نهایی، همراه شما هستیم.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-border" />
            <ProcessStep num="۱" title="تماس اولیه" desc="فرم درخواست مشاوره رایگان را پر کنید یا با ما چت کنید." />
            <ProcessStep num="۲" title="بررسی پرونده" desc="کارشناسان ما شرایط شما را بررسی و بهترین مسیر را پیشنهاد می‌دهند." />
            <ProcessStep num="۳" title="ارائه مدارک" desc="راهنمایی کامل برای آماده‌سازی و ارائه مدارک لازم." />
            <ProcessStep num="۴" title="نتیجه موفق" desc="پیگیری تا دریافت نتیجه نهایی و پاسپورت یا اقامت شما." />
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-4">{c(content, "about.title")}</h2>
              <div className="w-12 h-1 bg-secondary mb-10 rounded-full" />
              <div className="space-y-7">
                <FeatureItem title={c(content, "about.feature1_title")} desc={c(content, "about.feature1_desc")} />
                <FeatureItem title={c(content, "about.feature2_title")} desc={c(content, "about.feature2_desc")} />
                <FeatureItem title={c(content, "about.feature3_title")} desc={c(content, "about.feature3_desc")} />
              </div>
              <div className="mt-10">
                <Link href="/contact">
                  <Button className="gap-2">
                    شروع کنید <ArrowLeft className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TrustCard icon={<Shield className="size-8 text-primary" />} title="وکلای رسمی" desc="دارای پروانه وکالت رسمی ترکیه" />
              <TrustCard icon={<Award className="size-8 text-secondary" />} title="تضمین کیفیت" desc="بازپرداخت در صورت عدم موفقیت" className="mt-8" />
              <TrustCard icon={<Clock className="size-8 text-emerald-600" />} title="پیگیری مستمر" desc="گزارش هفتگی پیشرفت پرونده" />
              <TrustCard icon={<Users className="size-8 text-violet-600" />} title="تیم فارسی‌زبان" desc="مشاوران مسلط به زبان فارسی" className="mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-5">{c(content, "cta.title")}</h2>
          <p className="text-lg text-primary-foreground/75 mb-10 max-w-2xl mx-auto leading-relaxed">
            {c(content, "cta.subtitle")}
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-14 px-10 text-lg shadow-xl shadow-black/20">
              {c(content, "cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

function StatItem({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-secondary mb-1">{icon}</div>
      <div className="text-3xl font-bold font-serif text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

const SERVICE_COLORS: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
  violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
};

function ServiceCard({ icon, title, desc, link, color }: { icon: React.ReactNode; title: string; desc: string; link: string; color: string }) {
  return (
    <Card className="border group hover:shadow-lg hover:border-secondary/30 transition-all duration-300 h-full flex flex-col">
      <CardContent className="p-7 flex-1 flex flex-col">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${SERVICE_COLORS[color]}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold font-serif mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-5">{desc}</p>
        <Link href={link} className="inline-flex items-center gap-1 text-secondary text-sm font-semibold hover:gap-2 transition-all">
          اطلاعات بیشتر <ChevronLeft className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function ProcessStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center relative z-10">
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold font-serif mb-5 shadow-lg shadow-primary/20">
        {num}
      </div>
      <h3 className="font-bold text-lg mb-2 font-serif">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 mt-1">
        <CheckCircle2 className="size-5 text-secondary" />
      </div>
      <div>
        <h3 className="font-bold text-base mb-1 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TrustCard({ icon, title, desc, className = "" }: { icon: React.ReactNode; title: string; desc: string; className?: string }) {
  return (
    <Card className={`border bg-card ${className}`}>
      <CardContent className="p-5 flex flex-col gap-3">
        {icon}
        <div>
          <div className="font-bold text-sm mb-1">{title}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
        </div>
      </CardContent>
    </Card>
  );
}

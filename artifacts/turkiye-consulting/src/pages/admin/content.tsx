import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useGetSiteContent, useUpdateSiteContent, getGetSiteContentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  "contact.office_address": "ترکیه، استانبول، شیشلی، محله مجیدیه کوی، خیابان بویوک دره، پلاک ۱۲۳، طبقه ۵",
  "contact.phone_office": "+90 212 555 1234",
  "contact.phone_whatsapp": "+90 555 123 4567",
  "contact.email": "info@turkiyedanismanlik.com",
  "contact.working_hours": "دوشنبه تا جمعه: ۹ صبح تا ۶ عصر",
};

type ContentMap = Record<string, string>;

const SECTIONS = [
  {
    id: "hero",
    label: "Hero (بنر اصلی)",
    fields: [
      { key: "hero.title", label: "عنوان اصلی", multiline: true },
      { key: "hero.subtitle", label: "زیرعنوان", multiline: true },
      { key: "hero.cta_primary", label: "دکمه اول" },
      { key: "hero.cta_secondary", label: "دکمه دوم" },
    ],
  },
  {
    id: "stats",
    label: "آمار",
    fields: [
      { key: "stats.clients", label: "تعداد مشتریان" },
      { key: "stats.clients_label", label: "برچسب مشتریان" },
      { key: "stats.years", label: "سال‌های تجربه" },
      { key: "stats.years_label", label: "برچسب تجربه" },
      { key: "stats.success_rate", label: "نرخ موفقیت" },
      { key: "stats.success_rate_label", label: "برچسب موفقیت" },
      { key: "stats.lawyers", label: "تعداد وکلا" },
      { key: "stats.lawyers_label", label: "برچسب وکلا" },
    ],
  },
  {
    id: "about",
    label: "درباره ما",
    fields: [
      { key: "about.title", label: "عنوان بخش" },
      { key: "about.feature1_title", label: "ویژگی ۱ - عنوان" },
      { key: "about.feature1_desc", label: "ویژگی ۱ - توضیح", multiline: true },
      { key: "about.feature2_title", label: "ویژگی ۲ - عنوان" },
      { key: "about.feature2_desc", label: "ویژگی ۲ - توضیح", multiline: true },
      { key: "about.feature3_title", label: "ویژگی ۳ - عنوان" },
      { key: "about.feature3_desc", label: "ویژگی ۳ - توضیح", multiline: true },
    ],
  },
  {
    id: "cta",
    label: "Call to Action",
    fields: [
      { key: "cta.title", label: "عنوان" },
      { key: "cta.subtitle", label: "توضیح", multiline: true },
      { key: "cta.button", label: "متن دکمه" },
    ],
  },
  {
    id: "contact",
    label: "اطلاعات تماس",
    fields: [
      { key: "contact.office_address", label: "آدرس دفتر", multiline: true },
      { key: "contact.phone_office", label: "تلفن دفتر" },
      { key: "contact.phone_whatsapp", label: "واتس‌اپ" },
      { key: "contact.email", label: "ایمیل" },
      { key: "contact.working_hours", label: "ساعات کاری" },
    ],
  },
];

export default function AdminContent() {
  const { data: remoteContent, isLoading } = useGetSiteContent();
  const updateMutation = useUpdateSiteContent();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [localContent, setLocalContent] = useState<ContentMap>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (remoteContent) {
      setLocalContent({ ...DEFAULTS, ...remoteContent });
      setDirty(false);
    }
  }, [remoteContent]);

  const getValue = (key: string) => localContent[key] ?? DEFAULTS[key] ?? "";

  const setValue = (key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    updateMutation.mutate(
      { data: { updates: localContent } },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetSiteContentQueryKey(), updated);
          setDirty(false);
          toast({ title: "محتوای سایت با موفقیت ذخیره شد." });
        },
        onError: () => toast({ title: "خطا در ذخیره‌سازی", variant: "destructive" }),
      }
    );
  };

  const handleReset = (sectionId: string) => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;
    const reset: ContentMap = { ...localContent };
    section.fields.forEach(f => { reset[f.key] = DEFAULTS[f.key] ?? ""; });
    setLocalContent(reset);
    setDirty(true);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Site Content</h1>
            <p className="text-muted-foreground mt-1">Edit all text content displayed on the public website.</p>
          </div>
          <Button onClick={handleSave} disabled={!dirty || updateMutation.isPending} className="gap-2">
            {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {dirty ? "Save Changes" : "Saved"}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="hero">
            <TabsList className="flex-wrap h-auto gap-1 mb-2">
              {SECTIONS.map(s => (
                <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>
              ))}
            </TabsList>

            {SECTIONS.map(section => (
              <TabsContent key={section.id} value={section.id}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>{section.label}</CardTitle>
                      <CardDescription>ویرایش متون این بخش از سایت</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => handleReset(section.id)}>
                      <RotateCcw className="size-3.5" />
                      بازگشت به پیش‌فرض
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-5">
                      {section.fields.map(field => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-sm font-medium text-foreground" dir="rtl">{field.label}</label>
                          {field.multiline ? (
                            <Textarea
                              dir="rtl"
                              value={getValue(field.key)}
                              onChange={e => setValue(field.key, e.target.value)}
                              className="resize-none min-h-[80px] text-right"
                            />
                          ) : (
                            <Input
                              dir="rtl"
                              value={getValue(field.key)}
                              onChange={e => setValue(field.key, e.target.value)}
                              className="text-right"
                            />
                          )}
                          <p className="text-[10px] text-muted-foreground font-mono">{field.key}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}

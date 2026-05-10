import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PublicLayout } from "@/components/layout";
import { useCreateConsultation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  fullName: z.string().min(2, "نام کامل الزامی است"),
  email: z.string().email("ایمیل نامعتبر است"),
  phone: z.string().min(5, "شماره تماس الزامی است"),
  serviceType: z.string().min(1, "انتخاب نوع خدمت الزامی است"),
  message: z.string().min(10, "پیام باید حداقل ۱۰ حرف باشد"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const preselectedService = searchParams.get("service") || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      serviceType: preselectedService || "general",
      message: "",
    },
  });

  const createConsultation = useCreateConsultation();

  const onSubmit = (data: FormValues) => {
    createConsultation.mutate(
      { data },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
        onError: () => {
          form.setError("root", { message: "متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید." });
        },
      }
    );
  };

  return (
    <PublicLayout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold font-serif mb-4">تماس با ما</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            برای مشاوره و بررسی شرایط خود، فرم زیر را پر کنید تا کارشناسان ما در اسرع وقت با شما تماس بگیرند.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="text-2xl font-bold font-serif mb-6 text-foreground">اطلاعات تماس</h3>
              <p className="text-muted-foreground mb-8">
                دفتر مرکزی ما در استانبول پذیرای شماست. برای مراجعه حضوری حتما از قبل وقت قبلی دریافت نمایید.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                  <MapPin className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">آدرس دفتر مرکزی</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ترکیه، استانبول، شیشلی، محله مجیدیه کوی، خیابان بویوک دره، پلاک ۱۲۳، طبقه ۵
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                  <Phone className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">تلفن‌های تماس</h4>
                  <p className="text-sm text-muted-foreground flex flex-col gap-1" dir="ltr">
                    <span>+90 212 555 1234 (دفتر)</span>
                    <span>+90 555 123 4567 (واتس‌اپ)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                  <Mail className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">ایمیل</h4>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    info@turkiyedanismanlik.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-card">
              <CardContent className="p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-2xl font-bold font-serif mb-2">درخواست شما ثبت شد</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      کارشناسان ما درخواست شما را بررسی کرده و در اولین فرصت با شما تماس خواهند گرفت.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">
                      ثبت درخواست جدید
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نام و نام خانوادگی</FormLabel>
                              <FormControl>
                                <Input placeholder="علی محمدی" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>شماره تماس (ترجیحا دارای واتس‌اپ)</FormLabel>
                              <FormControl>
                                <Input placeholder="0912..." dir="ltr" className="text-right" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ایمیل</FormLabel>
                              <FormControl>
                                <Input placeholder="ali@example.com" dir="ltr" className="text-right" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>موضوع مشاوره</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger dir="rtl">
                                    <SelectValue placeholder="انتخاب کنید" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent dir="rtl">
                                  <SelectItem value="general">مشاوره عمومی</SelectItem>
                                  <SelectItem value="education">تحصیلی و دانشگاه</SelectItem>
                                  <SelectItem value="residency">اقامت و شهروندی</SelectItem>
                                  <SelectItem value="legal">امور حقوقی و وکالت</SelectItem>
                                  <SelectItem value="work">ثبت شرکت و کار</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>توضیحات درخواست</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="لطفا شرایط و نیاز خود را به صورت خلاصه بیان کنید..." 
                                className="min-h-[120px] resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.formState.errors.root && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                          {form.formState.errors.root.message}
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 text-lg"
                        disabled={createConsultation.isPending}
                      >
                        {createConsultation.isPending ? "در حال ثبت..." : "ارسال درخواست مشاوره"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

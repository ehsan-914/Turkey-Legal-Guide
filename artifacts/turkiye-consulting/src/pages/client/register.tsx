import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  username: z.string().min(3, "نام کاربری حداقل ۳ کاراکتر"),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر"),
  name: z.string().min(2, "نام و نام خانوادگی الزامی است"),
  email: z.string().email("ایمیل معتبر وارد کنید"),
  phone: z.string().min(10, "شماره تلفن معتبر وارد کنید"),
});

export default function ClientRegister() {
  const { register: registerFn, user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/client/dashboard");
      }
    }
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerFn({ data: values }, {
      onError: (err: any) => {
        toast({
          title: "خطا در ثبت‌نام",
          description: err?.error || "مشکلی در ثبت‌نام پیش آمد. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4" dir="rtl">
      <div className="mb-8 flex flex-col items-center">
        <div className="size-16 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg">
          <span className="text-primary-foreground font-serif font-bold text-4xl leading-none">T</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Türkiye Danışmanlık</h1>
        <p className="text-muted-foreground">پنل مشتریان</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold">ثبت‌نام</CardTitle>
          <CardDescription>
            حساب کاربری جدید ایجاد کنید تا به پنل مشتریان دسترسی پیدا کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: علی احمدی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کاربری</FormLabel>
                    <FormControl>
                      <Input placeholder="نام کاربری" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" dir="ltr" {...field} />
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
                    <FormLabel>شماره تلفن</FormLabel>
                    <FormControl>
                      <Input placeholder="+90 555 123 4567" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="حداقل ۶ کاراکتر" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-6" disabled={form.formState.isSubmitting}>
                <UserPlus className="size-4 ml-2" />
                ثبت‌نام
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/client/login" className="text-primary hover:underline font-medium">
              ورود به حساب
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

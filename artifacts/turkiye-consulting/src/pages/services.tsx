import { useState } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout";
import { useListServices } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, Building, Shield, Briefcase, ChevronLeft } from "lucide-react";
type ServiceCategory = "education" | "residency" | "legal" | "work";

const CATEGORY_MAP: Record<string, { label: string; icon: any }> = {
  education: { label: "تحصیلی", icon: GraduationCap },
  residency: { label: "اقامت و شهروندی", icon: Building },
  legal: { label: "خدمات حقوقی", icon: Shield },
  work: { label: "شرکت و کار", icon: Briefcase },
};

export default function ServicesPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.includes("?") ? location.slice(location.indexOf("?")) : "");
  const initialCategory = searchParams.get("category") || "all";
  const [activeTab, setActiveTab] = useState<string>(initialCategory);

  const { data: services, isLoading } = useListServices();

  const filteredServices = services?.filter(
    (s) => s.isActive && (activeTab === "all" || s.category === activeTab)
  ).sort((a, b) => a.sortOrder - b.sortOrder) || [];

  return (
    <PublicLayout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold font-serif mb-4">خدمات ما</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            مجموعه کاملی از خدمات تخصصی برای ایرانیان عزیز در کشور ترکیه
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            className={activeTab === "all" ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""}
          >
            همه خدمات
          </Button>
          {Object.entries(CATEGORY_MAP).map(([key, { label }]) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "outline"}
              onClick={() => setActiveTab(key)}
              className={activeTab === key ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border rounded-lg bg-muted/20">
            خدمتی در این دسته‌بندی یافت نشد.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => {
              const Icon = CATEGORY_MAP[service.category as string]?.icon || Shield;
              
              return (
                <Card key={service.id} className="flex flex-col h-full hover:shadow-md transition-shadow border-muted">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="size-12 rounded-lg bg-primary/5 flex items-center justify-center mb-6 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold font-serif mb-3 text-foreground">{service.titleFa}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-6">
                      {service.descriptionFa}
                    </p>
                    <Button variant="outline" className="w-full mt-auto justify-between group" asChild>
                      <a href={`/contact?service=${service.id}`}>
                        درخواست این خدمت
                        <ChevronLeft className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

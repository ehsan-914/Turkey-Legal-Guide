import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { 
  useListServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService,
  getListServicesQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleFa: z.string().min(1, "Persian title is required"),
  description: z.string().min(1, "Description is required"),
  descriptionFa: z.string().min(1, "Persian description is required"),
  category: z.enum(["education", "residency", "legal", "work"]),
  icon: z.string().default("Shield"),
  sortOrder: z.number().default(0),
});

export default function AdminServices() {
  const { data: services, isLoading } = useListServices();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const sortedServices = [...(services || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground mt-1">Manage the services displayed on the public website.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4 mr-2" />
            Add Service
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-16 bg-muted/50" />
                <CardContent className="p-6 h-32" />
              </Card>
            ))
          ) : sortedServices.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-card">
              No services defined yet.
            </div>
          ) : (
            sortedServices.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onEdit={() => setEditingService(service)}
              />
            ))
          )}
        </div>
      </div>

      <ServiceDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      
      {editingService && (
        <ServiceDialog 
          open={!!editingService} 
          onOpenChange={(open) => !open && setEditingService(null)}
          service={editingService}
          isEditing
        />
      )}
    </AdminLayout>
  );
}

function ServiceCard({ service, onEdit }: { service: any, onEdit: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const toggleActive = () => {
    updateMutation.mutate(
      { id: service.id, data: { isActive: !service.isActive } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
          toast({ title: `Service ${service.isActive ? 'disabled' : 'enabled'}` });
        }
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: service.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
          toast({ title: "Service deleted" });
        }
      }
    );
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${!service.isActive ? 'opacity-60' : 'hover:shadow-md'}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${service.isActive ? 'bg-primary' : 'bg-muted'}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {service.category}
            </div>
            <CardTitle className="text-lg font-serif">{service.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1" dir="rtl">{service.titleFa}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Switch checked={service.isActive} onCheckedChange={toggleActive} disabled={updateMutation.isPending} />
            <div className="flex items-center gap-1 mt-2">
              <Button variant="ghost" size="icon" className="size-7 h-7" onClick={onEdit}>
                <Edit2 className="size-3.5 text-muted-foreground" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 h-7 hover:bg-destructive/10 hover:text-destructive" disabled={deleteMutation.isPending}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Service</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{service.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function ServiceDialog({ open, onOpenChange, service, isEditing = false }: any) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? {
      title: service.title,
      titleFa: service.titleFa,
      description: service.description,
      descriptionFa: service.descriptionFa,
      category: service.category,
      icon: service.icon,
      sortOrder: service.sortOrder,
    } : {
      title: "",
      titleFa: "",
      description: "",
      descriptionFa: "",
      category: "education",
      icon: "Shield",
      sortOrder: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof serviceSchema>) => {
    if (isEditing && service) {
      updateMutation.mutate(
        { id: service.id, data: values },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
            toast({ title: "Service updated" });
            onOpenChange(false);
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: values },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
            toast({ title: "Service created" });
            form.reset();
            onOpenChange(false);
          }
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (English)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="titleFa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Persian)</FormLabel>
                  <FormControl><Input {...field} dir="rtl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="residency">Residency</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="work">Work/Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sortOrder" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description (English)</FormLabel>
                <FormControl><Textarea className="resize-none h-20" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="descriptionFa" render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Persian)</FormLabel>
                <FormControl><Textarea className="resize-none h-24" dir="rtl" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                {isEditing ? 'Save Changes' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

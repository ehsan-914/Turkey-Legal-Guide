import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useListConsultations, useUpdateConsultation, getListConsultationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
type ConsultationStatus = "pending" | "reviewed" | "converted" | "rejected";
type UpdateConsultationBodyStatus = "pending" | "reviewed" | "converted" | "rejected";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminConsultations() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const queryParams = statusFilter !== "all" ? { status: statusFilter as any } : undefined;
  const { data: consultations, isLoading } = useListConsultations(queryParams);
  
  const filteredData = consultations?.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Consultations</h1>
            <p className="text-muted-foreground mt-1">Manage and respond to consultation requests.</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <CardTitle>Requests</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, phone..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : !filteredData || filteredData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No consultations found.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Details</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell>
                          <div className="font-medium">{consultation.fullName}</div>
                          <div className="text-xs text-muted-foreground">{consultation.email}</div>
                          <div className="text-xs text-muted-foreground">{consultation.phone}</div>
                        </TableCell>
                        <TableCell className="capitalize">{consultation.serviceType.replace('_', ' ')}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(consultation.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={consultation.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(consultation)}>
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedItem && (
        <ConsultationDialog 
          consultation={selectedItem} 
          open={!!selectedItem} 
          onOpenChange={(open) => !open && setSelectedItem(null)} 
          statusFilter={statusFilter}
        />
      )}
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending': return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    case 'reviewed': return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Reviewed</Badge>;
    case 'converted': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Converted</Badge>;
    case 'rejected': return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Rejected</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function ConsultationDialog({ consultation, open, onOpenChange, statusFilter }: any) {
  const [notes, setNotes] = useState(consultation.adminNotes || "");
  const [status, setStatus] = useState<UpdateConsultationBodyStatus>(consultation.status as UpdateConsultationBodyStatus);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateMutation = useUpdateConsultation();

  const handleSave = () => {
    updateMutation.mutate(
      { id: consultation.id, data: { status, adminNotes: notes } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey(statusFilter !== 'all' ? { status: statusFilter as any } : undefined) });
          toast({ title: "Consultation updated successfully" });
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Failed to update consultation", variant: "destructive" });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Consultation Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Client Name</p>
              <p>{consultation.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Service Type</p>
              <p className="capitalize">{consultation.serviceType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
              <p>{consultation.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
              <p>{consultation.phone}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
              {consultation.message}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="converted">Converted to Case</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes (Internal)</label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private notes about this consultation..."
                className="resize-none"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

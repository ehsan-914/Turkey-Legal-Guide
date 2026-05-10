import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { useListClients, getListClientsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, FileText, Eye } from "lucide-react";

export default function AdminClients() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin/login");
    }
    if (!isLoading && user && user.role !== "admin") {
      setLocation("/client/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const { data: clients = [] } = useListClients({ query: { queryKey: getListClientsQueryKey(), enabled: !!user && user?.role === "admin" } });

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="ltr">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <div className="size-8 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-xl leading-none">T</span>
              </div>
            </Link>
            <h1 className="font-serif font-bold text-lg">Client Management</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/admin/consultations" className="text-muted-foreground hover:text-foreground">Consultations</Link>
            <Link href="/admin/cases" className="text-muted-foreground hover:text-foreground">Cases</Link>
            <Link href="/admin/clients" className="text-foreground font-medium">Clients</Link>
            <Link href="/admin/services" className="text-muted-foreground hover:text-foreground">Services</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif">Clients</h2>
            <p className="text-muted-foreground">{clients.length} registered clients</p>
          </div>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No clients registered yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <Link href={`/admin/clients/${client.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="size-4 mr-1" />
                        View Folder
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Username:</span>{" "}
                      <span className="font-medium">{client.username}</span>
                    </div>
                    {client.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        <span className="font-medium">{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FolderOpen className="size-4 text-muted-foreground" />
                      <span>{client.casesCount} cases</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="size-4 text-muted-foreground" />
                      <span>{client.documentsCount} documents</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registered:</span>{" "}
                      <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

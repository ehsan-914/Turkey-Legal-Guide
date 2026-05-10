import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/index";
import ServicesPage from "@/pages/services";
import ContactPage from "@/pages/contact";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminConsultations from "@/pages/admin/consultations";
import AdminCases from "@/pages/admin/cases";
import AdminCaseDetail from "@/pages/admin/case-detail";
import AdminServices from "@/pages/admin/services";
import AdminClients from "@/pages/admin/clients";
import AdminClientDetail from "@/pages/admin/client-detail";
import ClientRegister from "@/pages/client/register";
import ClientLogin from "@/pages/client/login";
import ClientDashboard from "@/pages/client/dashboard";
import ClientDocuments from "@/pages/client/documents";
import ClientCaseDetail from "@/pages/client/case-detail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/contact" component={ContactPage} />

      {/* Client Routes */}
      <Route path="/client/register" component={ClientRegister} />
      <Route path="/client/login" component={ClientLogin} />
      <Route path="/client/dashboard" component={ClientDashboard} />
      <Route path="/client/documents" component={ClientDocuments} />
      <Route path="/client/cases/:id" component={ClientCaseDetail} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/consultations" component={AdminConsultations} />
      <Route path="/admin/cases" component={AdminCases} />
      <Route path="/admin/cases/:id" component={AdminCaseDetail} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/clients" component={AdminClients} />
      <Route path="/admin/clients/:id" component={AdminClientDetail} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

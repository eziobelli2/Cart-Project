import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Home } from "@/pages/Home";
import { Tours } from "@/pages/Tours";
import { Book } from "@/pages/Book";
import { BookingConfirmation } from "@/pages/BookingConfirmation";
import { Admin } from "@/pages/Admin";
import { Legal } from "@/pages/Legal";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tours" component={Tours} />
      <Route path="/book" component={Book} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/admin" component={Admin} />
      
      <Route path="/privacy-policy">
        <Legal title="Privacy Policy" content="We take your privacy seriously. We only collect the information necessary to provide you with the best touring experience." />
      </Route>
      <Route path="/cookie-policy">
        <Legal title="Cookie Policy" content="We use cookies to improve your browsing experience and analyze site traffic." />
      </Route>
      <Route path="/terms">
        <Legal title="Terms of Service" content="By booking a tour with us, you agree to our terms and conditions." />
      </Route>
      <Route path="/cancellation-policy">
        <Legal title="Cancellation Policy" content="Cancellations made 48 hours before the scheduled tour will receive a full refund. Cancellations made within 48 hours are subject to a fee." />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

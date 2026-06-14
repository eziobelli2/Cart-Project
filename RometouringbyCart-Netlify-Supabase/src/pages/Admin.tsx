import { useState, useEffect, Fragment } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";
import { 
  Lock, 
  LogOut, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  Users, 
  Inbox,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageSquare
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Head } from "@/components/Head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

import { 
  useGetBookingsSummary, getGetBookingsSummaryQueryKey,
  useListAdminBookings, getListAdminBookingsQueryKey,
  useUpdateAdminBooking,
  useCreateAdminBooking,
  useGetAvailabilityCalendar, getGetAvailabilityCalendarQueryKey,
  useCreateAvailabilitySlot,
  useDeleteAvailabilitySlot,
  useListTours
} from "@/lib/api-client-react";

// Types derived from backend data model
type BookingStatus = "request" | "pending_payment" | "paid" | "confirmed" | "cancelled";
type BookingSource = "direct_website" | "airbnb" | "getyourguide" | "whatsapp" | "manual";
type PaymentStatus = "not_required" | "payment_link_sent" | "paid" | "refunded";

const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(6, "Phone number is required"),
  whatsapp: z.string().optional(),
  tourSlug: z.string().min(1, "Tour is required"),
  tourDate: z.string().min(1, "Date is required"),
  tourTime: z.string().min(1, "Time is required"),
  guests: z.coerce.number().min(1).max(8),
  bookingSource: z.enum(["airbnb", "getyourguide", "whatsapp", "manual"]),
  status: z.enum(["request", "pending_payment", "paid", "confirmed", "cancelled"]),
  paymentStatus: z.enum(["not_required", "payment_link_sent", "paid", "refunded"]),
  totalAmount: z.coerce.number().optional(),
  pickupLocation: z.string().optional(),
  notes: z.string().optional(),
  adminNotes: z.string().optional()
});

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  
  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "admin123") {
      localStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid PIN");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPin("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
        <Head title="Admin Login | RometouringbyCart" />
        <Card className="w-full max-w-md rounded-none border-border shadow-2xl">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-serif text-3xl text-primary">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Enter PIN" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="h-14 text-center text-2xl tracking-widest rounded-none border-border focus-visible:ring-primary"
                  autoFocus
                />
                {authError && <p className="text-destructive text-sm text-center font-medium">{authError}</p>}
              </div>
              <Button type="submit" className="w-full h-14 font-serif uppercase tracking-widest bg-primary hover:bg-primary/90 rounded-none">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 font-sans flex flex-col">
      <Head title="Admin Dashboard | RometouringbyCart" />
      
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold text-primary">RometouringbyCart Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-foreground/70 hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 rounded-none h-12">
            <TabsTrigger value="bookings" className="rounded-none uppercase text-xs tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bookings</TabsTrigger>
            <TabsTrigger value="add" className="rounded-none uppercase text-xs tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Add Booking</TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-none uppercase text-xs tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings" className="space-y-8 m-0 focus-visible:outline-none">
            <BookingsView />
          </TabsContent>

          <TabsContent value="add" className="m-0 focus-visible:outline-none">
            <AddBookingView onBookingAdded={() => setActiveTab("bookings")} />
          </TabsContent>

          <TabsContent value="calendar" className="m-0 focus-visible:outline-none">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// -----------------------------------------
// Bookings View
// -----------------------------------------
function BookingsView() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  const { data: summary } = useGetBookingsSummary({
    query: { queryKey: getGetBookingsSummaryQueryKey() }
  });

  const queryParams = statusFilter !== "all" ? { status: statusFilter } : undefined;
  
  const { data: bookings, isLoading: bookingsLoading } = useListAdminBookings(queryParams, {
    query: { queryKey: getListAdminBookingsQueryKey(queryParams) }
  });

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'direct_website': return <Badge variant="outline" className="border-primary text-primary bg-primary/5 rounded-none text-[10px]">Website</Badge>;
      case 'airbnb': return <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 dark:bg-red-500/10 rounded-none text-[10px]">Airbnb</Badge>;
      case 'getyourguide': return <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-500/10 rounded-none text-[10px]">GYG</Badge>;
      case 'whatsapp': return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10 rounded-none text-[10px]">WhatsApp</Badge>;
      case 'manual': return <Badge variant="outline" className="border-gray-500 text-gray-600 bg-gray-50 dark:bg-gray-500/10 rounded-none text-[10px]">Manual</Badge>;
      default: return <Badge variant="outline" className="rounded-none text-[10px]">{source}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'not_required': return <Badge variant="outline" className="border-gray-300 text-gray-500 bg-gray-50 rounded-none text-[10px]">—</Badge>;
      case 'payment_link_sent': return <Badge variant="outline" className="border-blue-400 text-blue-600 bg-blue-50 rounded-none text-[10px]">Link Sent</Badge>;
      case 'paid': return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 rounded-none text-[10px]">Paid</Badge>;
      case 'refunded': return <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 rounded-none text-[10px]">Refunded</Badge>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'request': return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 rounded-none uppercase tracking-wider text-[10px]">Request</Badge>;
      case 'pending_payment': return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 rounded-none uppercase tracking-wider text-[10px]">Pending Pmt</Badge>;
      case 'paid': return <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 rounded-none uppercase tracking-wider text-[10px]">Paid</Badge>;
      case 'confirmed': return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 rounded-none uppercase tracking-wider text-[10px]">Confirmed</Badge>;
      case 'cancelled': return <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 rounded-none uppercase tracking-wider text-[10px]">Cancelled</Badge>;
      default: return <Badge className="rounded-none">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-none border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-serif mb-1">Total Bookings</p>
                <h3 className="text-3xl font-bold text-foreground">{summary?.total || 0}</h3>
              </div>
              <div className="p-2 bg-primary/10">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-serif mb-1">Requests</p>
                <h3 className="text-3xl font-bold text-amber-600">{summary?.request || 0}</h3>
              </div>
              <div className="p-2 bg-amber-500/10">
                <Inbox className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-serif mb-1">Confirmed</p>
                <h3 className="text-3xl font-bold text-green-600">{summary?.confirmed || 0}</h3>
              </div>
              <div className="p-2 bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-serif mb-1">Today's Tours</p>
                <h3 className="text-3xl font-bold text-blue-600">{summary?.todayBookings || 0}</h3>
              </div>
              <div className="p-2 bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-border shadow-sm p-0 md:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 md:p-0 mb-6 gap-4">
          <h2 className="font-serif text-2xl text-foreground">Booking List</h2>
          
          <Tabs defaultValue="all" onValueChange={setStatusFilter} className="w-full lg:w-auto overflow-x-auto">
            <TabsList className="grid w-[600px] lg:w-auto grid-cols-6 rounded-none p-1 h-auto shrink-0">
              <TabsTrigger value="all" className="rounded-none text-xs uppercase">All</TabsTrigger>
              <TabsTrigger value="request" className="rounded-none text-xs uppercase">Req</TabsTrigger>
              <TabsTrigger value="pending_payment" className="rounded-none text-xs uppercase">Pnd Pmt</TabsTrigger>
              <TabsTrigger value="paid" className="rounded-none text-xs uppercase">Paid</TabsTrigger>
              <TabsTrigger value="confirmed" className="rounded-none text-xs uppercase">Conf</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-none text-xs uppercase">Canc</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="border-t border-border overflow-x-auto">
          <Table className="w-[800px] md:w-full">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-serif uppercase tracking-wider text-xs w-[60px]">ID</TableHead>
                <TableHead className="font-serif uppercase tracking-wider text-xs min-w-[200px]">Customer</TableHead>
                <TableHead className="font-serif uppercase tracking-wider text-xs min-w-[150px]">Tour & Time</TableHead>
                <TableHead className="font-serif uppercase tracking-wider text-xs text-center w-[80px]">Guests</TableHead>
                <TableHead className="font-serif uppercase tracking-wider text-xs w-[120px]">Source</TableHead>
                <TableHead className="font-serif uppercase tracking-wider text-xs w-[120px]">Payment</TableHead>
                <TableHead className="font-serif uppercase tracking-wider text-xs w-[120px]">Status</TableHead>
                <TableHead className="font-serif uppercase tracking-wider text-xs w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : bookings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings?.map((booking) => (
                  <Fragment key={booking.id}>
                    <TableRow 
                      className={`group cursor-pointer ${expandedRow === booking.id ? 'bg-muted/30' : ''}`}
                      onClick={() => setExpandedRow(expandedRow === booking.id ? null : booking.id)}
                    >
                      <TableCell className="font-medium text-foreground/70">#{booking.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.fullName}</div>
                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                        <div className="text-xs text-muted-foreground">{booking.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm truncate max-w-[200px]" title={booking.tourName || booking.tourSlug}>
                          {booking.tourName || booking.tourSlug}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(booking.tourDate), "MMM d, yyyy")} • {booking.tourTime}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{booking.guests}</TableCell>
                      <TableCell>{getSourceBadge(booking.bookingSource)}</TableCell>
                      <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                          {expandedRow === booking.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {expandedRow === booking.id && (
                      <TableRow className="bg-muted/10">
                        <TableCell colSpan={8} className="p-0 border-b">
                          <BookingDetailPanel booking={booking} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

function BookingDetailPanel({ booking }: { booking: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateBooking = useUpdateAdminBooking();
  
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || "");
  const [status, setStatus] = useState<string>(booking.status);
  const [paymentStatus, setPaymentStatus] = useState<string>(booking.paymentStatus);
  const [totalAmount, setTotalAmount] = useState<string>(booking.totalAmount ? String(booking.totalAmount) : "");

  const handleSave = () => {
    updateBooking.mutate(
      { 
        id: booking.id, 
        data: { 
          status: status as any,
          paymentStatus: paymentStatus as any,
          adminNotes: adminNotes,
          totalAmount: totalAmount ? Number(totalAmount) : undefined
        } 
      },
      {
        onSuccess: () => {
          toast({ title: "Booking updated" });
          queryClient.invalidateQueries({ queryKey: getListAdminBookingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBookingsSummaryQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to update booking", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-x border-border shadow-inner">
      <div className="space-y-6">
        <div>
          <h4 className="font-serif text-sm uppercase tracking-wider text-muted-foreground mb-3">Update Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="request">Request</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Payment Status</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="not_required">Not Required</SelectItem>
                  <SelectItem value="payment_link_sent">Link Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Total Amount (€)</label>
            <Input 
              type="number" 
              className="rounded-none" 
              placeholder="e.g. 150" 
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-3 h-3" /> Admin Notes
          </label>
          <Textarea 
            className="rounded-none min-h-[100px] resize-none" 
            placeholder="Internal notes (not visible to customer)..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={updateBooking.isPending} className="rounded-none flex-1">
            {updateBooking.isPending ? "Saving..." : "Save Changes"}
          </Button>
          
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button variant="outline" disabled className="rounded-none px-4 bg-muted/50 border-dashed">
                    <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                    Payment Link
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent className="rounded-none text-xs">
                <p>Stripe integration coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-6 bg-background/50 p-4 border border-border/50">
        <div>
          <h4 className="font-serif text-sm uppercase tracking-wider text-muted-foreground mb-4">Customer Info</h4>
          
          {booking.pickupLocation && (
            <div className="mb-4">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" /> Pickup Location / Hotel
              </span>
              <p className="text-sm bg-background p-2 border border-border">{booking.pickupLocation}</p>
            </div>
          )}

          {booking.notes && (
            <div className="mb-4">
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Customer Notes</span>
              <p className="text-sm bg-background p-3 border border-border whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}
          
          {booking.whatsapp && (
            <div className="mb-4">
              <span className="text-xs font-medium text-muted-foreground mb-1 block">WhatsApp</span>
              <p className="text-sm">{booking.whatsapp}</p>
            </div>
          )}
          
          {!booking.pickupLocation && !booking.notes && !booking.whatsapp && (
            <p className="text-sm text-muted-foreground italic">No additional customer information provided.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------
// Add Booking View
// -----------------------------------------
function AddBookingView({ onBookingAdded }: { onBookingAdded: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tours } = useListTours({
    query: { queryKey: ["/api/tours"] }
  });
  
  const createBooking = useCreateAdminBooking();

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      whatsapp: "",
      tourSlug: "",
      tourDate: "",
      tourTime: "",
      guests: 2,
      bookingSource: "manual",
      status: "confirmed",
      paymentStatus: "not_required",
      totalAmount: undefined,
      pickupLocation: "",
      notes: "",
      adminNotes: ""
    }
  });

  const onSubmit = (data: z.infer<typeof bookingFormSchema>) => {
    createBooking.mutate(
      { data: data as any },
      {
        onSuccess: () => {
          toast({ title: "Booking created successfully" });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListAdminBookingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBookingsSummaryQueryKey() });
          onBookingAdded();
        },
        onError: () => {
          toast({ title: "Error creating booking", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="bg-card border border-border shadow-sm max-w-4xl mx-auto">
      <div className="p-6 border-b border-border">
        <h2 className="font-serif text-2xl text-foreground">Add Manual Booking</h2>
        <p className="text-muted-foreground text-sm mt-1">Log external bookings from Airbnb, GetYourGuide, or direct contact.</p>
      </div>
      
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Source & Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/20 border border-border/50">
              <FormField
                control={form.control}
                name="bookingSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-none bg-background">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none">
                        <SelectItem value="airbnb">Airbnb</SelectItem>
                        <SelectItem value="getyourguide">GetYourGuide</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="manual">Manual / Phone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-none bg-background">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none">
                        <SelectItem value="request">Request</SelectItem>
                        <SelectItem value="pending_payment">Pending Payment</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-none bg-background">
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none">
                        <SelectItem value="not_required">Not Required</SelectItem>
                        <SelectItem value="payment_link_sent">Link Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tour Details */}
              <div className="space-y-6">
                <h3 className="font-serif text-lg border-b pb-2">Tour Details</h3>
                
                <FormField
                  control={form.control}
                  name="tourSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tour *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Select a tour" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none">
                          {tours?.map((tour) => (
                            <SelectItem key={tour.slug} value={tour.slug}>{tour.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tourDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date *</FormLabel>
                        <FormControl>
                          <Input type="date" className="rounded-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tourTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-none">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-none">
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="15:00">15:00</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                            <SelectItem value="17:00">17:00</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guests *</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={8} className="rounded-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount (€)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" className="rounded-none" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-6">
                <h3 className="font-serif text-lg border-b pb-2">Customer Info</h3>
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input className="rounded-none" {...field} />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" className="rounded-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input type="tel" className="rounded-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Optional" className="rounded-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Location / Hotel</FormLabel>
                      <FormControl>
                        <Input className="rounded-none" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Notes</FormLabel>
                    <FormControl>
                      <Textarea className="rounded-none resize-none min-h-[100px]" placeholder="Any specific requests from customer..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Notes</FormLabel>
                    <FormControl>
                      <Textarea className="rounded-none resize-none min-h-[100px]" placeholder="Internal reference only..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto px-8 h-12 rounded-none font-serif tracking-widest uppercase" disabled={createBooking.isPending}>
              {createBooking.isPending ? "Creating..." : "Create Booking"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

// -----------------------------------------
// Calendar View
// -----------------------------------------
function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const monthString = format(currentDate, "yyyy-MM");
  
  const { data: calendarData, isLoading } = useGetAvailabilityCalendar(
    { month: monthString }, 
    { query: { queryKey: getGetAvailabilityCalendarQueryKey({ month: monthString }) } }
  );

  const createSlot = useCreateAvailabilitySlot();
  const deleteSlot = useDeleteAvailabilitySlot();

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1)); // start on Monday
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (7 - endDate.getDay() === 7 ? 0 : 7 - endDate.getDay())); // end on Sunday

  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayData = (dateStr: string) => {
    return calendarData?.find(d => d.date === dateStr);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
    setSheetOpen(true);
  };

  const selectedDayData = selectedDay ? getDayData(selectedDay) : null;
  const isSelectedDayFullyBlocked = selectedDayData?.slots.every(s => s.isBlocked) ?? false;
  const isSelectedDayFullyAvailable = selectedDayData?.slots.length === 0;

  const handleBlockSlot = (tourSlug: string, slotTime: string) => {
    if (!selectedDay) return;
    createSlot.mutate(
      { data: { tourSlug, slotDate: selectedDay, slotTime, isBlocked: true } },
      {
        onSuccess: () => {
          toast({ title: "Slot blocked" });
          queryClient.invalidateQueries({ queryKey: getGetAvailabilityCalendarQueryKey({ month: monthString }) });
        }
      }
    );
  };

  const handleUnblockSlot = (slotId: number) => {
    if (!selectedDay) return;
    deleteSlot.mutate(
      { id: slotId },
      {
        onSuccess: () => {
          toast({ title: "Slot unblocked" });
          queryClient.invalidateQueries({ queryKey: getGetAvailabilityCalendarQueryKey({ month: monthString }) });
        }
      }
    );
  };

  return (
    <div className="bg-card border border-border shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      {/* Calendar Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10 shrink-0">
        <h2 className="font-serif text-2xl text-foreground">Availability Calendar</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-none h-8 w-8" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-lg w-32 text-center uppercase tracking-wide text-sm">{format(currentDate, "MMMM yyyy")}</span>
          <Button variant="outline" size="icon" className="rounded-none h-8 w-8" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 shrink-0">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-serif uppercase tracking-widest text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-border gap-[1px]">
          {isLoading ? (
            <div className="col-span-7 flex items-center justify-center bg-card">
              <span className="text-muted-foreground">Loading calendar...</span>
            </div>
          ) : (
            daysInGrid.map((day, i) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isCurrentMonth = isSameMonth(day, currentDate);
              const dayData = getDayData(dateStr);
              
              const hasBookings = dayData && dayData.slots.some(s => s.bookedCount > 0);
              const allBlocked = dayData && dayData.slots.length > 0 && dayData.slots.every(s => s.isBlocked);
              
              let bgClass = "bg-card hover:bg-muted/30";
              if (!isCurrentMonth) bgClass = "bg-muted/20 text-muted-foreground/50";
              else if (allBlocked) bgClass = "bg-muted/80 relative overflow-hidden";
              else if (hasBookings) bgClass = "bg-primary/5 hover:bg-primary/10 border-primary/20";
              
              return (
                <div 
                  key={i} 
                  className={`p-2 relative flex flex-col cursor-pointer transition-colors ${bgClass} ${isToday(day) ? 'ring-2 ring-inset ring-amber-500 z-10' : ''}`}
                  onClick={() => handleDayClick(dateStr)}
                >
                  {allBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                      <span className="text-[100px] font-bold">X</span>
                    </div>
                  )}
                  
                  <span className={`text-sm font-medium ${isToday(day) ? 'text-amber-600' : ''} ${!isCurrentMonth ? 'opacity-50' : ''}`}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="flex-1 mt-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {dayData?.slots.filter(s => s.bookedCount > 0).map((slot, idx) => (
                      <div key={idx} className="text-[10px] leading-tight p-1 bg-background border border-primary/20 rounded truncate flex justify-between items-center">
                        <span className="truncate">{slot.tourName}</span>
                        <span className="font-mono bg-primary/10 px-1 rounded-sm ml-1 shrink-0">{slot.bookedCount}/{slot.maxCapacity}</span>
                      </div>
                    ))}
                    {dayData?.slots.filter(s => s.isBlocked).map((slot, idx) => (
                      <div key={`b-${idx}`} className="text-[10px] leading-tight p-1 bg-muted text-muted-foreground border border-border rounded truncate flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {slot.time} Blocked
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Day Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col border-l border-border rounded-none sm:max-w-none">
          <SheetHeader className="p-6 border-b border-border bg-muted/10 shrink-0 text-left">
            <SheetTitle className="font-serif text-2xl">
              {selectedDay ? format(parseISO(selectedDay), "EEEE, MMMM d, yyyy") : ""}
            </SheetTitle>
            <SheetDescription>
              Manage availability and view bookings for this day.
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-6">
            {!selectedDayData || selectedDayData.slots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
                <p>No bookings or blocked slots for this day.</p>
                <p className="text-sm mt-2">Slots become visible when booked or manually blocked.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedDayData.slots.map((slot, idx) => (
                  <div key={idx} className={`border ${slot.isBlocked ? 'border-border bg-muted/50' : 'border-primary/20'} rounded-none overflow-hidden`}>
                    <div className={`p-3 border-b flex justify-between items-center ${slot.isBlocked ? 'bg-muted/80' : 'bg-primary/5'}`}>
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          {slot.time} - {slot.tourName}
                          {slot.isBlocked && <Badge variant="secondary" className="rounded-none text-[10px]"><Lock className="w-3 h-3 mr-1"/> Blocked</Badge>}
                        </h4>
                        {!slot.isBlocked && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span>Capacity:</span>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${Math.min(100, (slot.bookedCount / slot.maxCapacity) * 100)}%` }}
                              />
                            </div>
                            <span>{slot.bookedCount} / {slot.maxCapacity}</span>
                          </div>
                        )}
                      </div>
                      
                      {slot.isBlocked ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-none h-8 text-xs"
                          onClick={() => slot.slotId && handleUnblockSlot(slot.slotId)}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-none h-8 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleBlockSlot(slot.tourSlug, slot.time)}
                        >
                          Block Slot
                        </Button>
                      )}
                    </div>
                    
                    {!slot.isBlocked && slot.bookings.length > 0 && (
                      <div className="divide-y divide-border/50 bg-background">
                        {slot.bookings.map(b => (
                          <div key={b.id} className="p-3 text-sm flex justify-between items-center">
                            <div>
                              <div className="font-medium">{b.fullName}</div>
                              <div className="text-xs text-muted-foreground">{b.guests} guests</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="rounded-none text-[10px] uppercase">{b.bookingSource}</Badge>
                              <Badge variant="outline" className={`rounded-none text-[10px] uppercase ${
                                b.status === 'confirmed' ? 'border-green-500 text-green-600 bg-green-50' : 
                                b.status === 'request' ? 'border-amber-500 text-amber-600 bg-amber-50' : ''
                              }`}>
                                {b.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-12 border-t border-border pt-6">
              <h4 className="font-serif text-lg mb-4">Quick Actions</h4>
              <div className="bg-muted/30 p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-4">Need to block a specific time entirely? (e.g. guide is unavailable)</p>
                
                {/* Simplified quick block - ideally would have a tour & time selector here */}
                <p className="text-xs italic text-muted-foreground">Select a time slot above to block it, or create a slot to block it from the full list.</p>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
    </div>
  );
}

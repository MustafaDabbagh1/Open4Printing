import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import Product from "@/pages/Product";
import Cart from "@/pages/Cart";
import Upload from "@/pages/Upload";
import Help from "@/pages/Help";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Quote from "@/pages/Quote";
import WebDesignServices from "@/pages/WebDesignServices";
import SocialMediaMarketingServices from "@/pages/SocialMediaMarketingServices";
import PaymentProcessingPos from "@/pages/PaymentProcessingPos";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminOrderDetail from "@/pages/admin/AdminOrderDetail";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminQuotes from "@/pages/admin/AdminQuotes";
import AdminQuoteDetail from "@/pages/admin/AdminQuoteDetail";
import CustomerLogin from "@/pages/account/CustomerLogin";
import CustomerRegister from "@/pages/account/CustomerRegister";
import CustomerOrders from "@/pages/account/CustomerOrders";
import CustomerAddresses from "@/pages/account/CustomerAddresses";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/orders/:id" component={AdminOrderDetail} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/quotes" component={AdminQuotes} />
      <Route path="/admin/quotes/:id" component={AdminQuoteDetail} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/category/:slug" component={Category} />
            <Route path="/product/:slug" component={Product} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/order-confirmation/:orderNumber" component={OrderConfirmation} />
            <Route path="/quote" component={Quote} />
            <Route path="/web-design-services" component={WebDesignServices} />
            <Route path="/social-media-marketing-services" component={SocialMediaMarketingServices} />
            <Route path="/payment-processing-pos" component={PaymentProcessingPos} />
            <Route path="/upload" component={Upload} />
            <Route path="/help" component={Help} />
            <Route path="/account/login" component={CustomerLogin} />
            <Route path="/account/register" component={CustomerRegister} />
            <Route path="/account/orders" component={CustomerOrders} />
            <Route path="/account/addresses" component={CustomerAddresses} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
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

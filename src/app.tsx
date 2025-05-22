import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import JournalListPage from "./pages/JournalListPage";
import JournalDetailPage from "./pages/JournalDetailPage";
import DiscordConnect from "./pages/DiscordConnect";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NewBlogPost from "./pages/NewBlogPost";
import EditBlogPost from "./pages/EditBlogPost";
import { ChatPage } from "./pages/ChatPage";
import { ChannelPage } from "./pages/ChannelPage";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Use Layout for pages with Header and Footer */}
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Index />} /> {/* Use index to render Index at the root */}
              <Route path="discord-connect" element={<DiscordConnect />} />

              {/* Move Chat Routes inside the Layout route */}
              <Route path="chat" element={<ChatPage />} />
              <Route path="chat/:channelId" element={<ChannelPage />} />

              {/* Authenticated Routes (wrap in a potential layout later) */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="notes" element={<Notes />} />
              <Route path="journals" element={<JournalListPage />} />
              <Route path="journals/:id" element={<JournalDetailPage />} />
              <Route path="blog/new" element={<NewBlogPost />} />
              <Route path="blog/edit/:id" element={<EditBlogPost />} />
              <Route path="blog/:id" element={<BlogPost />} />
              <Route path="blog" element={<Blog />} />

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

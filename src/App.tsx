import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MediaProvider } from "@/contexts/MediaContext";
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext";
import Index from "./pages/Index";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import MyList from "./pages/MyList";
import ForYou from "./pages/ForYou";
import Genre from "./pages/Genre";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MediaProvider>
        <VideoPlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/tv" element={<TVShows />} />
                <Route path="/new" element={<Index />} />
                <Route path="/mylist" element={<MyList />} />
                <Route path="/foryou" element={<ForYou />} />
                <Route path="/genre/:id" element={<Genre />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </VideoPlayerProvider>
      </MediaProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;

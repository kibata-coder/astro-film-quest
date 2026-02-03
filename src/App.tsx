import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/auth";
import { MediaProvider } from "@/features/shared";
import { VideoPlayerProvider } from "@/features/player";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const MyList = lazy(() => import("./pages/MyList"));
const ForYou = lazy(() => import("./pages/ForYou"));
const NewPopular = lazy(() => import("./pages/NewPopular"));
const Genre = lazy(() => import("./pages/Genre"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default staleTime
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Full-page loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MediaProvider>
        <VideoPlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/tv" element={<TVShows />} />
                    <Route path="/new" element={<NewPopular />} />
                    <Route path="/mylist" element={<MyList />} />
                    <Route path="/foryou" element={<ForYou />} />
                    <Route path="/genre/:id" element={<Genre />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </VideoPlayerProvider>
      </MediaProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

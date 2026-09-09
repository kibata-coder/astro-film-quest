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
import MaintenanceGate from "@/components/MaintenanceGate";
import { useTvNavigation } from "@/hooks/useTvNavigation";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const MyList = lazy(() => import("./pages/MyList"));
const ForYou = lazy(() => import("./pages/ForYou"));

const Genre = lazy(() => import("./pages/Genre"));
const Profile = lazy(() => import("./pages/Profile"));
const Anime = lazy(() => import("./pages/Anime"));
const AnimeSeasonal = lazy(() => import("./pages/AnimeSeasonal"));
const AnimePopular = lazy(() => import("./pages/AnimePopular"));
const AnimeNew = lazy(() => import("./pages/AnimeNew"));
const SoudanimeDetails = lazy(() => import("./pages/SoudanimeDetails"));
const Person = lazy(() => import("./pages/Person"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Brands = lazy(() => import("./pages/Brands"));
const BrandPage = lazy(() => import("./pages/BrandPage"));
const Timelines = lazy(() => import("./pages/Timelines"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,        // 30 min TMDB content rarely changes
      gcTime: 1000 * 60 * 60 * 2,       // 2h in memory cache
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      networkMode: 'offlineFirst',
    },
  },
});

// Full-page loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

const TvNavigation = () => {
  useTvNavigation();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>

    <AuthProvider>
      <MediaProvider>
        <VideoPlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <TvNavigation />
            <ErrorBoundary>
              <BrowserRouter>
                <MaintenanceGate>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/movies" element={<Movies />} />
                      <Route path="/tv" element={<TVShows />} />
                      <Route path="/anime" element={<Anime />} />
                      <Route path="/anime/seasonal" element={<AnimeSeasonal />} />
                      <Route path="/anime/popular" element={<AnimePopular />} />
                      <Route path="/anime/new" element={<AnimeNew />} />
                      <Route path="/anime/:id" element={<SoudanimeDetails />} />

                      <Route path="/mylist" element={<MyList />} />
                      <Route path="/foryou" element={<ForYou />} />
                      <Route path="/genre/:id" element={<Genre />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/person/:id" element={<Person />} />
                      <Route path="/brands" element={<Brands />} />
                      <Route path="/brand/:id" element={<BrandPage />} />
                      <Route path="/timelines" element={<Timelines />} />
                      <Route path="/timeline/:id" element={<TimelinePage />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </MaintenanceGate>
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </VideoPlayerProvider>
      </MediaProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

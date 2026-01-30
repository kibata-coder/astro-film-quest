// src/App.tsx
import { useEffect, Suspense, lazy } from "react";
// ... existing imports ...
import { isLowEndDevice } from "@/lib/device"; // Import the helper

// ... lazy loads ...

const App = () => {
  // Add this useEffect at the top of the App component
  useEffect(() => {
    if (isLowEndDevice()) {
      document.body.classList.add('low-end-device');
      console.log('Lite Mode Enabled: Optimizing for performance');
    }
  }, []);

  return (
    // ... existing JSX ...
    <QueryClientProvider client={queryClient}>
       {/* ... same as before ... */}
    </QueryClientProvider>
  );
};

export default App;

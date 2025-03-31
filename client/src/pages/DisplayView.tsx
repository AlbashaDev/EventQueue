import { useEffect, useState } from "react";
import { useQueue } from "@/hooks/useQueue";
import QueueStatusDisplay from "@/components/QueueStatus";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

export default function DisplayView() {
  const { queueStatus, isLoading } = useQueue();
  const [lastCalledTimestamp, setLastCalledTimestamp] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  
  // We don't need an interval for auto-refresh because we're using WebSockets for real-time updates
  
  // Show flash animation when number changes
  useEffect(() => {
    if (!queueStatus || !queueStatus.lastCalledAt) return;
    
    // Only flash when the lastCalledAt timestamp changes
    if (queueStatus.lastCalledAt !== lastCalledTimestamp) {
      setLastCalledTimestamp(queueStatus.lastCalledAt);
      
      // Trigger flash animation
      setShowFlash(true);
      const timeoutId = setTimeout(() => {
        setShowFlash(false);
      }, 5000); // Animation lasts 5 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [queueStatus, lastCalledTimestamp]);

  return (
    <>
      {/* Flash overlay when number changes */}
      {showFlash && (
        <div className="fixed inset-0 bg-primary bg-opacity-20 pointer-events-none z-50 animate-pulse" />
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="absolute top-4 right-4 flex items-center text-gray-500">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          <span className="text-sm">Uppdateras live</span>
        </div>
        
        {/* Always render both states, but with opacity transitions */}
        <div className="relative">
          {/* Loading state with fade */}
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-[500px] w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-[500px] w-full rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-[250px] w-full mt-8 rounded-lg" />
          </div>
          
          {/* Content with fade */}
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <QueueStatusDisplay queueStatus={queueStatus} />
            <QRCodeDisplay />
          </div>
        </div>
      </main>
    </>
  );
}

import { useEffect, useState } from "react";
import { useQueue } from "@/hooks/useQueue";
import QueueStatusDisplay from "@/components/QueueStatus";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

export default function DisplayView() {
  const { queueStatus, isLoading } = useQueue();
  
  // Remove all animation states and effects
  // No animations or transitions at all to prevent blinking

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="absolute top-4 right-4 flex items-center text-gray-500">
          <RefreshCw className="h-4 w-4 mr-2" /> {/* Removed animate-spin */}
          <span className="text-sm">Uppdateras live</span>
        </div>
        
        {isLoading ? (
          // Simple loading state without transitions
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
          </div>
        ) : (
          // Static display without animations or transitions
          <div>
            <QueueStatusDisplay queueStatus={queueStatus} />
            <QRCodeDisplay />
          </div>
        )}
      </main>
    </>
  );
}

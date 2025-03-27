import { useEffect } from "react";
import { useQueue } from "@/hooks/useQueue";
import QueueStatusDisplay from "@/components/QueueStatus";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Skeleton } from "@/components/ui/skeleton";

export default function DisplayView() {
  const { queueStatus, isLoading } = useQueue();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        // Loading state
        <div>
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
      ) : (
        <>
          <QueueStatusDisplay queueStatus={queueStatus} />
          <QRCodeDisplay />
        </>
      )}
    </main>
  );
}

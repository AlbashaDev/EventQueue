import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Define the queue status type to match the API response
interface QueueStatus {
  currentNumber: number;
  nextNumbers: number[];
  waitingCount: number;
  queueItems: {
    number: number;
    status: string;
    issuedAt: string;
  }[];
  lastCalledAt?: string;
}

export default function ScanView() {
  const { number } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get queue status
  const { 
    data: queueStatus, 
    isLoading,
    refetch
  } = useQuery<QueueStatus>({ 
    queryKey: ['/api/queue/status'],
  });

  // Add new number mutation
  const addToQueueMutation = useMutation({
    mutationFn: async () => {
      // Clear any previous localStorage flags to ensure we can generate a new number
      localStorage.removeItem('has_generated_qr_number');
      localStorage.removeItem('queue_number_timestamp');
      
      const res = await apiRequest({
        method: 'POST',
        url: '/api/queue/new'
      });
      return res;
    },
    onSuccess: (data) => {
      toast({
        title: "Framgång",
        description: `Du har tilldelats nummer ${data.number}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/status'] });
      
      // Save timestamp to prevent multiple quick scans
      const timestamp = new Date().getTime();
      localStorage.setItem('queue_number_timestamp', timestamp.toString());
      localStorage.setItem('current_queue_number', data.number.toString());
      
      // Check if the number is "qr" or starts with "qr/"
      const isQrScan = number === "qr" || (typeof number === "string" && number.startsWith("qr/"));
      
      if (isQrScan) {
        // Use window.location.replace which doesn't add to browser history
        window.location.replace(`/scan/${data.number}`);
      } else if (!number) {
        // Only redirect if we're on a default /scan route without number
        setLocation(`/scan/${data.number}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Fel",
        description: "Ett fel uppstod. Försök igen.",
        variant: "destructive",
      });
      console.error("Failed to add to queue:", error);
    }
  });

  // Check if this is a QR scan or existing number view
  useEffect(() => {
    // Check if the number is either "qr" or starts with "qr/"
    const isQrScan = number === "qr" || (typeof number === "string" && number.startsWith("qr/"));
    
    // If it's a valid number (not a QR scan path), don't generate a new one
    if (number && !isQrScan && !isNaN(parseInt(number as string))) {
      console.log("Viewing existing queue number:", number);
      return;
    }
    
    // Check for timestamp to prevent repeated scans in quick succession
    const timestampStr = localStorage.getItem('queue_number_timestamp');
    if (timestampStr) {
      const timestamp = parseInt(timestampStr);
      const now = new Date().getTime();
      
      // If less than 5 seconds since last scan, don't generate a new number
      if (now - timestamp < 5000) {
        const currentNumber = localStorage.getItem('current_queue_number');
        console.log("Recent scan detected, reusing number:", currentNumber);
        
        if (isQrScan && currentNumber) {
          window.location.replace(`/scan/${currentNumber}`);
          return;
        }
        return;
      }
    }
    
    // Generate a new number for QR scans or direct /scan access
    if ((isQrScan || !number) && !addToQueueMutation.isPending) {
      console.log("Generating a new queue number...");
      addToQueueMutation.mutate();
    }
    
    // Component cleanup
    return () => {
      // We'll keep timestamps to prevent frequent re-requests
      // but remove the 'has_generated_qr_number' flag
      localStorage.removeItem('has_generated_qr_number');
    };
  }, [number, addToQueueMutation]);

  // Calculate effective number to use (either from URL or from mutation response)
  const getEffectiveNumber = () => {
    // Check if the number is either "qr" or starts with "qr/"
    const isQrScan = number === "qr" || (typeof number === "string" && number.startsWith("qr/"));
    
    if (isQrScan || !number || isNaN(parseInt(number || ""))) {
      return addToQueueMutation.data?.number;
    }
    return parseInt(number as string);
  };

  // If we have a number and queue status, calculate queue position and wait time
  const queuePosition = () => {
    if (!queueStatus) return { peopleAhead: 0, estimatedWaitTime: '0 minuter' };
    
    const effectiveNumber = getEffectiveNumber();
    if (!effectiveNumber) return { peopleAhead: 0, estimatedWaitTime: '0 minuter' };
    
    const currentNumber = queueStatus.currentNumber || 0;
    
    // Count how many numbers are ahead in the queue
    const peopleAhead = (queueStatus.nextNumbers || [])
      .filter((n: number) => n < effectiveNumber)
      .length;
    
    // Estimate wait time based on people ahead (assuming 2 minutes per person)
    const waitTimeMinutes = peopleAhead * 2;
    let estimatedWaitTime = '';
    
    if (waitTimeMinutes === 0) {
      estimatedWaitTime = 'Du är näst på tur!';
    } else if (waitTimeMinutes === 1) {
      estimatedWaitTime = '~1 minut';
    } else if (waitTimeMinutes < 60) {
      estimatedWaitTime = `~${waitTimeMinutes} minuter`;
    } else {
      const hours = Math.floor(waitTimeMinutes / 60);
      const minutes = waitTimeMinutes % 60;
      estimatedWaitTime = `~${hours} timm${hours !== 1 ? 'ar' : 'e'}${minutes > 0 ? ` ${minutes} min` : ''}`;
    }
    
    return { peopleAhead, estimatedWaitTime };
  };

  const { peopleAhead, estimatedWaitTime } = queuePosition();

  // Determine if the current user's number is being called
  const effectiveNumber = getEffectiveNumber();
  const isMyNumberCalled = effectiveNumber === queueStatus?.currentNumber;
  
  // No need for interval-based refresh as WebSockets provide real-time updates
  
  // Show notification if my number is called
  useEffect(() => {
    if (isMyNumberCalled) {
      toast({
        title: "Din tur!",
        description: "Ditt nummer har kallats. Vänligen gå till receptionen.",
        duration: 10000, // Show for 10 seconds
      });
    }
  }, [isMyNumberCalled, toast]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto">
        {isLoading || addToQueueMutation.isPending ? (
          <Skeleton className="h-[500px] w-full rounded-lg" />
        ) : (
          <Card className="shadow-lg overflow-hidden">
            <div className={`${isMyNumberCalled ? 'bg-green-600' : 'bg-primary'} p-6 text-center transition-colors duration-500`}>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isMyNumberCalled ? 'Din tur nu!' : 'Ditt könummer'}
              </h2>
              <div className={`${isMyNumberCalled ? 'bg-green-100 border-green-300 border-2' : 'bg-white'} rounded-lg p-6 mb-4 transition-all duration-500`}>
                <div className={`text-6xl leading-none font-bold ${isMyNumberCalled ? 'text-green-600' : 'text-primary'}`}>
                  {effectiveNumber || "..."}
                </div>
              </div>
              <p className="text-white font-medium">
                {isMyNumberCalled 
                  ? 'Vänligen gå till receptionen' 
                  : 'Ha detta nummer tillgängligt'}
              </p>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-dark mb-2">Köstatus</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${queueStatus?.currentNumber === effectiveNumber ? 'bg-green-100' : 'bg-gray-100'} rounded-lg p-4 text-center transition-colors duration-300`}>
                    <p className="text-sm text-gray-500 mb-1">Aktuellt nummer</p>
                    <p className={`text-2xl font-bold ${queueStatus?.currentNumber === effectiveNumber ? 'text-green-600' : 'text-primary'}`}>
                      {queueStatus?.currentNumber || '—'}
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Personer före dig</p>
                    <p className="text-2xl font-bold text-primary">{peopleAhead}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-dark mb-2">Uppskattad väntetid</h3>
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                  <Clock className="text-primary mr-2 h-5 w-5" />
                  <span className="text-xl font-bold text-primary">{estimatedWaitTime}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center text-gray-600 mb-4">
                  <CheckCircle className="text-secondary mr-2 h-5 w-5" />
                  <span>Uppdateras automatiskt - inget behov att uppdatera</span>
                </div>
                
                {isMyNumberCalled && (
                  <div className="bg-green-100 p-4 rounded-lg mb-4 border border-green-300">
                    <div className="flex items-center text-green-800">
                      <CheckCircle className="text-green-600 mr-2 h-5 w-5" />
                      <span className="font-medium">Din tur! Gå till receptionen nu.</span>
                    </div>
                  </div>
                )}
                
                {/* Adding a live update indicator instead of refresh button */}
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  <span>Uppdateras live</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

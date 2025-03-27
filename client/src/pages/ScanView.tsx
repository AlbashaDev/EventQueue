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
      const res = await apiRequest({
        method: 'POST',
        url: '/api/queue/new'
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Framgång",
        description: `Du har tilldelats nummer ${data.number}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/status'] });
      
      // Use direct window.location.href instead of wouter's setLocation
      // for better compatibility, especially with QR code scanning
      
      // Check if the number is "qr" or starts with "qr/"
      const isQrScan = number === "qr" || (typeof number === "string" && number.startsWith("qr/"));
      
      if (isQrScan) {
        // Use window.location.href for better compatibility with QR code scanning
        window.location.href = `/scan/${data.number}`;
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
    }
  });

  // Check if this is a QR scan or existing number view
  useEffect(() => {
    // Check if the number is either "qr" or starts with "qr/"
    const isQrScan = number === "qr" || (typeof number === "string" && number.startsWith("qr/"));
    
    // Handle QR code scans - generate a new number once without auto-refreshing
    if (isQrScan && !addToQueueMutation.isPending) {
      console.log("QR Code scan detected, generating a new queue number...");
      addToQueueMutation.mutate();
    } 
    // If no number at all is provided, still generate a new one (for direct /scan access)
    else if (!number && !addToQueueMutation.isPending) {
      console.log("No number provided, generating a new queue number...");
      addToQueueMutation.mutate();
    }
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto">
        {isLoading || addToQueueMutation.isPending ? (
          <Skeleton className="h-[500px] w-full rounded-lg" />
        ) : (
          <Card className="shadow-lg overflow-hidden">
            <div className="bg-primary p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Ditt könummer</h2>
              <div className="bg-white rounded-lg p-6 mb-4">
                <div className="text-6xl leading-none font-bold text-primary">
                  {getEffectiveNumber() || "..."}
                </div>
              </div>
              <p className="text-white font-medium">Ha detta nummer tillgängligt</p>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-dark mb-2">Köstatus</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Aktuellt nummer</p>
                    <p className="text-2xl font-bold text-primary">
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
                  <span>Vi meddelar dig när ditt nummer snart blir uppropat</span>
                </div>
                <Button 
                  className="w-full flex items-center justify-center"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Uppdatera status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

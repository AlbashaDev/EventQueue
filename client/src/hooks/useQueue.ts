import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { QueueStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useQueue() {
  const { toast } = useToast();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVisualsEnabled, setIsVisualsEnabled] = useState(true);

  // Get queue status
  const { 
    data: queueStatus, 
    isLoading,
    error,
    refetch
  } = useQuery<QueueStatus>({ 
    queryKey: ['/api/queue/status'],
    refetchInterval: 5000, // Add a fallback refetch every 5 seconds
    staleTime: 1000, // Consider data stale after 1 second
  });
  
  // Set up listener for WebSocket updates
  useEffect(() => {
    // Listen for custom event triggered by App component when WebSocket updates are received
    const handleWebSocketUpdate = () => {
      console.log("WebSocket update detected in useQueue hook, refetching...");
      refetch();
    };
    
    window.addEventListener('queue-ws-update', handleWebSocketUpdate);
    
    return () => {
      window.removeEventListener('queue-ws-update', handleWebSocketUpdate);
    };
  }, [refetch]);

  // Add new number to queue
  const addToQueueMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest({
        method: 'POST',
        url: '/api/queue/new'
      });
      return res;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Queue number ${data.number} created`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create queue number.",
        variant: "destructive",
      });
      console.error("Add to queue error:", error);
    }
  });

  // Call next number
  const callNextMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest({
        method: 'POST',
        url: '/api/queue/next'
      });
      return res;
    },
    onSuccess: (data) => {
      if (data.currentNumber) {
        toast({
          title: "Success",
          description: `Number ${data.currentNumber} called successfully!`,
        });
        // Play notification sound
        if (isAudioEnabled) {
          const audio = document.getElementById('notification-sound') as HTMLAudioElement;
          if (audio) {
            audio.play().catch(e => console.log("Audio play was prevented:", e));
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/queue/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to call next number.",
        variant: "destructive",
      });
      console.error("Call next error:", error);
    }
  });

  // Call specific number
  const callSpecificMutation = useMutation({
    mutationFn: async (number: number) => {
      const res = await apiRequest({
        method: 'POST',
        url: `/api/queue/call/${number}`
      });
      return res;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Number ${data.currentNumber} called successfully!`,
      });
      // Play notification sound
      if (isAudioEnabled) {
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        if (audio) {
          audio.play().catch(e => console.log("Audio play was prevented:", e));
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/queue/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to call specific number.",
        variant: "destructive",
      });
      console.error("Call specific error:", error);
    }
  });

  // Mark number as complete
  const completeNumberMutation = useMutation({
    mutationFn: async (number: number) => {
      const res = await apiRequest({
        method: 'POST',
        url: `/api/queue/complete/${number}`
      });
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Number marked as completed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to mark number as completed.",
        variant: "destructive",
      });
      console.error("Complete number error:", error);
    }
  });

  // Remove number from queue
  const removeNumberMutation = useMutation({
    mutationFn: async (number: number) => {
      const res = await apiRequest({
        method: 'DELETE',
        url: `/api/queue/item/${number}`
      });
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Number removed from queue",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to remove number from queue.",
        variant: "destructive",
      });
      console.error("Remove number error:", error);
    }
  });

  // Reset queue
  const resetQueueMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest({
        method: 'POST',
        url: '/api/queue/reset'
      });
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Queue has been reset",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to reset queue. Please try again.",
        variant: "destructive",
      });
      console.error("Reset queue error:", error);
    }
  });

  // Toggle sound
  const toggleSoundMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest({
        method: 'POST',
        url: '/api/settings/sound',
        data: { enabled }
      });
      return res;
    },
    onSuccess: (_, variables) => {
      setIsAudioEnabled(variables);
      toast({
        title: "Success",
        description: `Sound notifications ${variables ? 'enabled' : 'disabled'}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update sound settings. Please try again.",
        variant: "destructive",
      });
      console.error("Toggle sound error:", error);
    }
  });

  // Toggle visual alerts
  const toggleVisualAlertsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest({
        method: 'POST',
        url: '/api/settings/visual-alerts',
        data: { enabled }
      });
      return res;
    },
    onSuccess: (_, variables) => {
      setIsVisualsEnabled(variables);
      toast({
        title: "Success",
        description: `Visual alerts ${variables ? 'enabled' : 'disabled'}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update visual alert settings. Please try again.",
        variant: "destructive",
      });
      console.error("Toggle visual alerts error:", error);
    }
  });

  return {
    queueStatus: queueStatus || {
      currentNumber: 0,
      nextNumbers: [],
      waitingCount: 0,
      queueItems: []
    },
    isLoading,
    error,
    isAudioEnabled,
    isVisualsEnabled,
    addToQueue: addToQueueMutation.mutate,
    callNext: callNextMutation.mutate,
    callSpecific: callSpecificMutation.mutate,
    completeNumber: completeNumberMutation.mutate,
    removeNumber: removeNumberMutation.mutate,
    resetQueue: resetQueueMutation.mutate,
    toggleSound: toggleSoundMutation.mutate,
    toggleVisualAlerts: toggleVisualAlertsMutation.mutate,
    isPending: 
      addToQueueMutation.isPending ||
      callNextMutation.isPending ||
      callSpecificMutation.isPending ||
      completeNumberMutation.isPending ||
      removeNumberMutation.isPending ||
      resetQueueMutation.isPending ||
      toggleSoundMutation.isPending ||
      toggleVisualAlertsMutation.isPending
  };
}

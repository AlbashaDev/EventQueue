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
    error 
  } = useQuery<QueueStatus>({ 
    queryKey: ['/api/queue/status'],
  });

  // Add new number to queue
  const addToQueueMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/queue/new', null);
      return await res.json();
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
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Call next number
  const callNextMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/queue/next', null);
      return await res.json();
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
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Call specific number
  const callSpecificMutation = useMutation({
    mutationFn: async (number: number) => {
      const res = await apiRequest('POST', `/api/queue/call/${number}`, null);
      return await res.json();
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
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mark number as complete
  const completeNumberMutation = useMutation({
    mutationFn: async (number: number) => {
      const res = await apiRequest('POST', `/api/queue/complete/${number}`, null);
      return await res.json();
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
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Remove number from queue
  const removeNumberMutation = useMutation({
    mutationFn: async (number: number) => {
      const res = await apiRequest('DELETE', `/api/queue/item/${number}`, null);
      return await res.json();
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
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Reset queue
  const resetQueueMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/queue/reset', null);
      return await res.json();
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
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle sound
  const toggleSoundMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest('POST', '/api/settings/sound', { enabled });
      return await res.json();
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
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle visual alerts
  const toggleVisualAlertsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest('POST', '/api/settings/visual-alerts', { enabled });
      return await res.json();
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
        description: error.message,
        variant: "destructive",
      });
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

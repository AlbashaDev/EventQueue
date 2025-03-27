import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DisplayView from "@/pages/DisplayView";
import AdminView from "@/pages/AdminView";
import ScanView from "@/pages/ScanView";
import LoginView from "@/pages/LoginView";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import ToastNotification from "@/components/ToastNotification";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const [previousNumber, setPreviousNumber] = useState<number | null>(null);
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [toast, setToast] = useState<{ visible: boolean, message: string, type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  // WebSocket connection
  useEffect(() => {
    // Use the correct path for WebSocket connection
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws`; // Using the specific /ws path
    
    console.log(`Attempting to connect WebSocket to: ${wsUrl}`);
    
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectInterval = 3000; // 3 seconds
    
    function connectWebSocket() {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("WebSocket connection established successfully!");
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        showToast("Connected to queue system", "success");
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("WebSocket message received:", message);
          
          if (message.type === "QUEUE_UPDATE") {
            // Check if the current number has changed
            if (currentNumber !== 0 && currentNumber !== message.data.currentNumber) {
              setPreviousNumber(currentNumber);
            }
            
            setCurrentNumber(message.data.currentNumber);
            
            // If there's a new number called and it's not the first load
            if (currentNumber !== 0 && currentNumber !== message.data.currentNumber && message.data.currentNumber !== 0) {
              // Play notification sound if on display page
              if (location === '/') {
                const audio = document.getElementById('notification-sound') as HTMLAudioElement;
                if (audio) {
                  audio.play().catch(e => console.log("Audio play was prevented:", e));
                }
              }
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket connection error:", error);
        showToast("Connection error. Trying to reconnect...", "error");
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = reconnectInterval * Math.pow(1.5, reconnectAttempts - 1); // Exponential backoff
          console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${delay/1000} seconds...`);
          
          setTimeout(() => {
            console.log("Reconnecting...");
            connectWebSocket();
          }, delay);
        } else {
          console.log("Maximum reconnection attempts reached. Please refresh the page manually.");
          showToast("Connection lost. Please refresh the page.", "error");
        }
      };
      
      return ws;
    }
    
    const ws = connectWebSocket();
    
    // Clean up function
    return () => {
      console.log("Closing WebSocket connection...");
      ws.close();
    };
  }, [location, currentNumber]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={DisplayView} />
        <Route path="/login" component={LoginView} />
        <Route path="/admin">
          {isAuthenticated ? <AdminView /> : <Redirect to="/login" />}
        </Route>
        <Route path="/scan/:number?" component={ScanView} />
        <Route component={NotFound} />
      </Switch>
      
      {toast.visible && (
        <ToastNotification 
          message={toast.message} 
          type={toast.type} 
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

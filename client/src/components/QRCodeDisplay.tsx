import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Info, RefreshCw } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";

interface QRCodeDisplayProps {
  className?: string;
}

export default function QRCodeDisplay({ className = "" }: QRCodeDisplayProps) {
  const [timestamp, setTimestamp] = useState(() => Date.now());

  // Function to refresh the QR code by updating the timestamp
  const refreshQRCode = () => {
    setTimestamp(Date.now());
  };

  // Auto-refresh QR code every 15 minutes to prevent stale QR codes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshQRCode();
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  // Generate URL for QR code that will lead to the scan page with timestamp
  const getQRCodeUrl = () => {
    // If on localhost, use localhost
    // Otherwise use the host from window.location
    const host = window.location.hostname === 'localhost' 
      ? `${window.location.protocol}//${window.location.host}`
      : window.location.origin;
    
    return `${host}/scan?t=${timestamp}`;
  };

  return (
    <Card className={`mt-8 shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-2xl font-bold text-neutral-dark mb-3">Join the Queue</h2>
            <p className="text-lg text-gray-600 mb-4">
              Scan the QR code with your phone to get your queue number. You'll be able to track your position in line.
            </p>
            <div className="flex items-center text-primary">
              <Info className="mr-2 h-5 w-5" />
              <span className="text-sm">
                The QR code will direct you to a page where you'll receive a unique queue number.
              </span>
            </div>
          </div>
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="bg-white border-2 border-primary p-3 rounded-lg mb-3">
              <div className="w-48 h-48 bg-white flex justify-center items-center">
                <QRCode 
                  value={getQRCodeUrl()}
                  size={200}
                  level="H"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs flex items-center"
              onClick={refreshQRCode}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh QR Code
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

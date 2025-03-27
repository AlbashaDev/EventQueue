import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Info, RefreshCw } from "lucide-react";
import QRCode from "react-qr-code";

interface QRCodeDisplayProps {
  className?: string;
}

export default function QRCodeDisplay({ className = "" }: QRCodeDisplayProps) {
  const [timestamp, setTimestamp] = useState(() => Date.now());
  const [refreshCount, setRefreshCount] = useState(0);

  // Function to refresh the QR code by updating the timestamp
  const refreshQRCode = () => {
    setTimestamp(Date.now());
    setRefreshCount(prev => prev + 1);
  };

  // Auto-refresh QR code every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshQRCode();
    }, 10 * 1000); // 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Generate URL for QR code that will lead to the scan page with a direct QR code flag
  const getQRCodeUrl = () => {
    // If on localhost, use localhost
    // Otherwise use the host from window.location
    const host = window.location.hostname === 'localhost' 
      ? `${window.location.protocol}//${window.location.host}`
      : window.location.origin;
    
    // Use a special route for QR code scans that bypasses auto-generation logic
    return `${host}/scan/qr`;
  };

  return (
    <Card className={`mt-8 shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-2xl font-bold text-neutral-dark mb-3">Gå med i kön</h2>
            <p className="text-lg text-gray-600 mb-4">
              Skanna QR-koden med din telefon för att få ditt könummer. Du kommer att kunna se din position i kön.
            </p>
            <div className="flex items-center text-primary">
              <Info className="mr-2 h-5 w-5" />
              <span className="text-sm">
                QR-koden tar dig till en sida där du får ett unikt könummer.
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-4">
              <RefreshCw className="h-3 w-3 inline mr-1" />
              QR-koden uppdateras automatiskt var 10:e sekund. Senaste uppdatering: {refreshCount}
            </div>
          </div>
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="bg-white border-2 border-primary p-3 rounded-lg">
              <div className="w-48 h-48 bg-white flex justify-center items-center">
                <QRCode 
                  value={getQRCodeUrl()}
                  size={200}
                  level="H"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { QRCodeSVG } from "react-qr-code";

interface QRCodeDisplayProps {
  className?: string;
}

export default function QRCodeDisplay({ className = "" }: QRCodeDisplayProps) {
  // Generate URL for QR code that will lead to the scan page
  const getQRCodeUrl = () => {
    // If on localhost, use localhost
    // Otherwise use the host from window.location
    const host = window.location.hostname === 'localhost' 
      ? `${window.location.protocol}//${window.location.host}`
      : window.location.origin;
    
    return `${host}/scan`;
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
          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white border-2 border-primary p-3 rounded-lg">
              <div className="w-48 h-48 bg-white flex justify-center items-center">
                <QRCodeSVG 
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

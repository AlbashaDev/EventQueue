import { Card, CardContent } from "@/components/ui/card";
import { Bell, Clock } from "lucide-react";
import { QueueStatus as QueueStatusType } from "@shared/schema";

interface QueueStatusDisplayProps {
  queueStatus: QueueStatusType;
  className?: string;
}

export default function QueueStatusDisplay({ queueStatus, className = "" }: QueueStatusDisplayProps) {
  const { currentNumber, nextNumbers, waitingCount, lastCalledAt } = queueStatus;
  
  // Calculate how long ago the number was called
  const getTimeAgo = (timeString?: string) => {
    if (!timeString) return "just now";
    
    const calledTime = new Date();
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    
    let hourValue = parseInt(hours);
    if (period === "PM" && hourValue < 12) hourValue += 12;
    if (period === "AM" && hourValue === 12) hourValue = 0;
    
    calledTime.setHours(hourValue);
    calledTime.setMinutes(parseInt(minutes));
    
    const now = new Date();
    const diffMs = now.getTime() - calledTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 minute ago";
    return `${diffMins} minutes ago`;
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Number */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-neutral-dark mb-2">Now Serving</h2>
                <div className="flex justify-center items-center h-60 w-full bg-primary rounded-lg mb-4">
                  <span className="text-6xl leading-none font-bold text-white">
                    {currentNumber > 0 ? currentNumber : "—"}
                  </span>
                </div>
                {lastCalledAt && (
                  <div className="flex items-center text-secondary">
                    <Bell className="mr-2 h-5 w-5" />
                    <span className="text-lg font-semibold">Last called: {getTimeAgo(lastCalledAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Queue Status */}
        <div>
          <Card className="shadow-lg h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-neutral-dark mb-4">Queue Status</h2>
              <div className="mb-6 flex-grow">
                <h3 className="text-lg font-semibold text-neutral-dark mb-2">Coming Up Next</h3>
                <div className="space-y-3">
                  {nextNumbers.slice(0, 3).map((number, index) => (
                    <div 
                      key={number} 
                      className="bg-gray-100 rounded-lg p-4 flex justify-between items-center transition-all duration-300 hover:shadow-md"
                    >
                      <span className="text-2xl font-bold text-primary">{number}</span>
                      <span className="text-sm text-gray-500">
                        {index === 0 ? "Up next" : `${getOrdinal(index + 1)} in line`}
                      </span>
                    </div>
                  ))}
                  {nextNumbers.length === 0 && (
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <span className="text-gray-500">No numbers in the queue</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg mt-auto">
                <p className="text-lg font-medium text-neutral-dark">Total Waiting</p>
                <p className="text-3xl font-bold text-primary">{waitingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

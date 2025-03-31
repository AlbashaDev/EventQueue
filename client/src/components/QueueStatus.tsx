import { Card, CardContent } from "@/components/ui/card";
import { Bell, Clock, AlertCircle } from "lucide-react";
import { QueueStatus as QueueStatusType } from "@shared/schema";
import { useEffect, useState } from "react";

interface QueueStatusDisplayProps {
  queueStatus: QueueStatusType;
  className?: string;
}

export default function QueueStatusDisplay({ queueStatus, className = "" }: QueueStatusDisplayProps) {
  const { currentNumber, nextNumbers, waitingCount, lastCalledAt } = queueStatus;
  
  // Remove all animation states and effects to prevent blinking
  const animateNumber = false;
  
  // Calculate how long ago the number was called
  const getTimeAgo = (timeString?: string) => {
    if (!timeString) return "just nu";
    
    try {
      const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
      const calledTime = new Date();
      calledTime.setHours(hours);
      calledTime.setMinutes(minutes);
      
      const now = new Date();
      const diffMs = now.getTime() - calledTime.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 1) return "just nu";
      if (diffMins === 1) return "1 minut sedan";
      return `${diffMins} minuter sedan`;
    } catch (e) {
      return "just nu";
    }
  };

  // Get Swedish ordinal text
  const getOrdinalSwedish = (index: number) => {
    switch(index) {
      case 0: return "Nästa";
      case 1: return "Andra i kö";
      case 2: return "Tredje i kö";
      default: return `${index + 1}:e i kö`;
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Number */}
        <div className="lg:col-span-2">
          <Card className={`shadow-lg transition-all duration-300 ${animateNumber ? 'ring-4 ring-primary' : ''}`}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-neutral-dark mb-2">Betjänar nu</h2>
                <div 
                  className={`flex justify-center items-center h-60 w-full bg-primary rounded-lg mb-4 transition-all duration-500 
                  ${animateNumber ? 'scale-105 bg-gradient-to-r from-primary to-blue-500' : ''}`}
                >
                  <span className={`text-9xl leading-none font-bold text-white transition-all duration-500 
                  ${animateNumber ? 'scale-110 animate-bounce' : ''}`}>
                    {currentNumber > 0 ? currentNumber : "—"}
                  </span>
                </div>
                {lastCalledAt && (
                  <div className="flex items-center text-secondary">
                    <Bell className={`mr-2 h-5 w-5 ${animateNumber ? 'animate-ping' : ''}`} />
                    <span className="text-lg font-semibold">Uppropat: {getTimeAgo(lastCalledAt)}</span>
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
              <h2 className="text-2xl font-bold text-neutral-dark mb-4">Köstatus</h2>
              <div className="mb-6 flex-grow">
                <h3 className="text-lg font-semibold text-neutral-dark mb-2">Kommande nummer</h3>
                <div className="space-y-3">
                  {nextNumbers.slice(0, 3).map((number, index) => (
                    <div 
                      key={number} 
                      className={`bg-gray-100 rounded-lg p-4 flex justify-between items-center 
                      transition-all duration-300 hover:shadow-md 
                      ${index === 0 ? 'border-l-4 border-primary' : ''}`}
                    >
                      <span className="text-2xl font-bold text-primary">{number}</span>
                      <span className={`text-sm ${index === 0 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        {getOrdinalSwedish(index)}
                      </span>
                    </div>
                  ))}
                  {nextNumbers.length === 0 && (
                    <div className="bg-gray-100 rounded-lg p-4 text-center flex flex-col items-center">
                      <AlertCircle className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-gray-500">Inga nummer i kö</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg mt-auto">
                <p className="text-lg font-medium text-neutral-dark">Totalt väntande</p>
                <p className="text-3xl font-bold text-primary">{waitingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

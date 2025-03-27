import { useState } from "react";
import { useQueue } from "@/hooks/useQueue";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Search, 
  RotateCcw, 
  Volume2,
  Eye,
  QrCode,
  UsersRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import UserManagement from "@/components/UserManagement";

export default function AdminView() {
  const { 
    queueStatus, 
    isLoading, 
    callNext, 
    callSpecific, 
    completeNumber, 
    removeNumber, 
    resetQueue, 
    toggleSound, 
    toggleVisualAlerts, 
    isAudioEnabled, 
    isVisualsEnabled, 
    isPending 
  } = useQueue();
  
  const [specificNumber, setSpecificNumber] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleCallNext = () => {
    callNext();
  };

  const handleCallPrevious = () => {
    // Find the previous number (completed status) and call it
    const completedItems = queueStatus.queueItems.filter(item => 
      item.status === "completed" && item.number < queueStatus.currentNumber
    );
    
    if (completedItems.length > 0) {
      // Get the most recent completed item
      const previousItem = completedItems.reduce((prev, current) => 
        (current.number > prev.number) ? current : prev
      );
      callSpecific(previousItem.number);
    }
  };

  const handleCallSpecific = () => {
    const number = parseInt(specificNumber);
    if (!isNaN(number)) {
      callSpecific(number);
      setSpecificNumber("");
    }
  };

  const handleToggleSound = (checked: boolean) => {
    toggleSound(checked);
  };

  const handleToggleVisualAlerts = (checked: boolean) => {
    toggleVisualAlerts(checked);
  };

  // Filter and search queue items
  const filteredItems = queueStatus.queueItems
    .filter(item => {
      // Filter by status
      if (filterType === "waiting" && item.status !== "waiting") return false;
      if (filterType === "serving" && item.status !== "serving") return false;
      if (filterType === "completed" && item.status !== "completed") return false;
      
      // Filter by search query
      if (searchQuery && !item.number.toString().includes(searchQuery)) return false;
      
      return true;
    })
    .sort((a, b) => b.number - a.number); // Sort by number descending

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Adminpanel</h1>
      
      <Tabs defaultValue="queue" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="queue" className="flex items-center">
            <QrCode className="mr-2 h-4 w-4" />
            Köhantering
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <UsersRound className="mr-2 h-4 w-4" />
            Användarhantering
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
                <Skeleton className="h-[200px] w-full rounded-lg" />
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-[620px] w-full rounded-lg" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Controls Section */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg mb-8">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-neutral-dark mb-4">Queue Controls</h2>
                    <div className="space-y-4">
                      <Button 
                        className="w-full py-3 px-4 flex items-center justify-center"
                        onClick={handleCallNext}
                        disabled={isPending || queueStatus.nextNumbers.length === 0}
                      >
                        <ArrowRight className="mr-2 h-5 w-5" />
                        Call Next Number
                      </Button>
                      
                      <Button 
                        variant="secondary"
                        className="w-full py-3 px-4 flex items-center justify-center"
                        onClick={handleCallPrevious}
                        disabled={isPending || queueStatus.currentNumber <= 1}
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Recall Previous
                      </Button>
                      
                      <div className="relative">
                        <Input 
                          type="number" 
                          id="specific-number" 
                          className="w-full py-3 px-4" 
                          placeholder="Enter specific number"
                          value={specificNumber}
                          onChange={(e) => setSpecificNumber(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCallSpecific()}
                        />
                        <Button 
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={handleCallSpecific}
                          disabled={isPending || !specificNumber}
                          size="sm"
                        >
                          Call
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-gray-100 rounded-lg">
                        <p className="font-medium text-neutral-dark">Currently Serving</p>
                        <p className="text-3xl font-bold text-primary">
                          {queueStatus.currentNumber > 0 ? queueStatus.currentNumber : "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-neutral-dark mb-4">System Settings</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sound-toggle" className="text-neutral-dark">Sound Notifications</Label>
                        <Switch 
                          id="sound-toggle" 
                          checked={isAudioEnabled}
                          onCheckedChange={handleToggleSound} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="alerts-toggle" className="text-neutral-dark">Visual Alerts</Label>
                        <Switch 
                          id="alerts-toggle" 
                          checked={isVisualsEnabled}
                          onCheckedChange={handleToggleVisualAlerts}
                        />
                      </div>
                      
                      <hr className="my-3 border-gray-200" />
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            className="w-full py-3 px-4 flex items-center justify-center"
                          >
                            <RotateCcw className="mr-2 h-5 w-5" />
                            Reset Queue
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Queue</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will clear all numbers in the queue. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => resetQueue()}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Reset
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Queue Management Section */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-neutral-dark mb-4">Queue Management</h2>
                    
                    <div className="flex justify-between mb-4 flex-col sm:flex-row space-y-2 sm:space-y-0">
                      <div className="flex items-center">
                        <Users className="text-primary mr-2 h-5 w-5" />
                        <span className="font-medium text-neutral-dark">
                          Total in queue: {queueStatus.queueItems.length}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="relative w-full sm:w-auto">
                          <Input 
                            type="text" 
                            placeholder="Search" 
                            className="pl-8 pr-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <Search className="text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="All Numbers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Numbers</SelectItem>
                            <SelectItem value="waiting">Waiting</SelectItem>
                            <SelectItem value="serving">Serving</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Issued At
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedItems.map((item) => (
                            <tr 
                              key={item.number} 
                              className={`hover:bg-gray-50 ${
                                item.status === 'serving' ? 'bg-gray-100' : ''
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-lg font-bold ${
                                  item.status === 'completed' ? 'text-gray-500' : 'text-primary'
                                }`}>
                                  {item.number}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.status === 'waiting' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : item.status === 'serving' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.issuedAt}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {item.status === 'waiting' && (
                                  <Button 
                                    variant="link" 
                                    className="text-primary hover:text-blue-700 mr-3 p-0 h-auto"
                                    onClick={() => callSpecific(item.number)}
                                    disabled={isPending}
                                  >
                                    Call
                                  </Button>
                                )}
                                {item.status === 'serving' && (
                                  <Button 
                                    variant="link" 
                                    className="text-green-600 hover:text-green-700 mr-3 p-0 h-auto"
                                    onClick={() => completeNumber(item.number)}
                                    disabled={isPending}
                                  >
                                    Complete
                                  </Button>
                                )}
                                {item.status === 'completed' && (
                                  <Button 
                                    variant="link" 
                                    className="text-primary hover:text-blue-700 mr-3 p-0 h-auto"
                                    onClick={() => callSpecific(item.number)}
                                    disabled={isPending}
                                  >
                                    Recall
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="link" 
                                      className="text-red-600 hover:text-red-700 p-0 h-auto"
                                    >
                                      Remove
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Number</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove number {item.number} from the queue?
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => removeNumber(item.number)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </td>
                            </tr>
                          ))}
                          {paginatedItems.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                No items found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {filteredItems.length > 0 && (
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Showing {paginatedItems.length} of {filteredItems.length} items
                        </div>
                        {totalPages > 1 && (
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => goToPage(Math.max(currentPage - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <Button 
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => goToPage(page)}
                              >
                                {page}
                              </Button>
                            ))}
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
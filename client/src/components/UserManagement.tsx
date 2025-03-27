import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Edit, Trash, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define user type based on the schema
type User = {
  id: number;
  username: string;
  isAdmin: boolean;
  isApproved: boolean;
  createdAt: string;
};

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch users
  const { data, isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/users'],
    staleTime: 10000,
  });
  
  const users = data || [];

  // Add user mutation
  const addUser = useMutation({
    mutationFn: async (userData: { username: string; password: string; isAdmin: boolean }) => {
      return apiRequest(
        'POST',
        '/api/users',
        userData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setNewUsername("");
      setNewPassword("");
      setNewIsAdmin(false);
      setAddDialogOpen(false);
      toast({
        title: "Användare tillagd",
        description: "Användaren har lagts till och väntar på godkännande.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel vid skapande av användare",
        description: error.message || "Kunde inte skapa användaren.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { isApproved?: boolean; isAdmin?: boolean };
    }) => {
      return apiRequest(
        'PATCH',
        `/api/users/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Användare uppdaterad",
        description: "Användarens status har uppdaterats.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel vid uppdatering",
        description: error.message || "Kunde inte uppdatera användaren.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(
        'DELETE',
        `/api/users/${id}`,
        undefined
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Användare borttagen",
        description: "Användaren har tagits bort.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel vid borttagning",
        description: error.message || "Kunde inte ta bort användaren.",
        variant: "destructive",
      });
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast({
        title: "Ofullständig information",
        description: "Både användarnamn och lösenord krävs.",
        variant: "destructive",
      });
      return;
    }
    
    addUser.mutate({
      username: newUsername,
      password: newPassword,
      isAdmin: newIsAdmin,
    });
  };

  const handleToggleApproval = (user: User) => {
    updateUser.mutate({
      id: user.id,
      data: { isApproved: !user.isApproved },
    });
  };

  const handleToggleAdmin = (user: User) => {
    updateUser.mutate({
      id: user.id,
      data: { isAdmin: !user.isAdmin },
    });
  };

  const handleDeleteUser = (id: number) => {
    deleteUser.mutate(id);
  };

  if (isLoading) return <div>Laddar användare...</div>;
  if (error) return <div>Fel vid hämtning av användare: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Användarhantering</h2>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2 items-center">
              <UserPlus size={16} /> 
              Lägg till användare
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lägg till användare</DialogTitle>
              <DialogDescription>
                Skapa en ny användare som kan hantera kösystemet.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddUser} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Användarnamn</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ange användarnamn"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Lösenord</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ange lösenord"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={newIsAdmin}
                  onCheckedChange={(checked) => 
                    setNewIsAdmin(checked === true)
                  }
                />
                <Label htmlFor="isAdmin">Administratörsrättigheter</Label>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={addUser.isPending}
                >
                  {addUser.isPending ? "Lägger till..." : "Lägg till användare"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Table>
        <TableCaption>Lista över alla användare i systemet</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Användarnamn</TableHead>
            <TableHead>Skapad</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Godkänd</TableHead>
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString('sv-SE')}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAdmin(user)}
                    title={user.isAdmin ? "Ta bort administratörsrättigheter" : "Ge administratörsrättigheter"}
                  >
                    {user.isAdmin ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <XCircle className="h-5 w-5 text-gray-300" />
                    }
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleApproval(user)}
                    title={user.isApproved ? "Avslå användare" : "Godkänn användare"}
                  >
                    {user.isApproved ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <XCircle className="h-5 w-5 text-red-500" />
                    }
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Detta tar bort användaren {user.username} permanent. Åtgärden kan inte ångras.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Ta bort
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Inga användare hittades
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
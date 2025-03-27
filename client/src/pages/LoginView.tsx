import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import logoPath from "@assets/StockholmsStad_logotypeStandardA4_300ppi_svart.jpg";

// Define form validation schema
const formSchema = z.object({
  username: z.string().min(1, "Användarnamn krävs"),
  password: z.string().min(1, "Lösenord krävs"),
});

export default function LoginView() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        toast({
          title: "Inloggning lyckades",
          description: "Omdirigerar till administratörspanelen...",
        });
        
        // Add a small delay before redirection to ensure auth state is updated
        setTimeout(() => {
          setLocation("/admin");
        }, 500);
      } else {
        toast({
          title: "Inloggning misslyckades",
          description: "Ogiltigt användarnamn eller lösenord",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Inloggning misslyckades",
        description: "Ett fel inträffade vid inloggning. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={logoPath}
              alt="Stockholms stad" 
              className="h-16" 
            />
          </div>
          <CardTitle className="text-2xl font-bold">Administratörsinloggning</CardTitle>
          <CardDescription>
            Ange dina inloggningsuppgifter för att få tillgång till administratörspanelen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Användarnamn</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ange användarnamn" 
                        {...field} 
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lösenord</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Ange lösenord" 
                        {...field} 
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Loggar in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="mr-2 h-4 w-4" />
                    Logga in
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>Säker åtkomst endast för Jobbtorg Stockholms personal</p>
        </CardFooter>
      </Card>
    </main>
  );
}
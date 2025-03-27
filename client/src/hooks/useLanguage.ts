import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type Language = "en" | "sv";
type Translations = Record<string, Record<Language, string>>;

// Common text translations used throughout the app
export const translations: Translations = {
  queueDisplay: {
    en: "Queue Display",
    sv: "Kövisning"
  },
  adminPanel: {
    en: "Admin Panel",
    sv: "Adminpanel"
  },
  logout: {
    en: "Logout",
    sv: "Logga ut"
  },
  joinQueue: {
    en: "Join the Queue",
    sv: "Ställ dig i kön"
  },
  scanQrInfo: {
    en: "Scan the QR code with your phone to get your queue number. You'll be able to track your position in line.",
    sv: "Skanna QR-koden med din telefon för att få ditt könummer. Du kommer att kunna följa din plats i kön."
  },
  qrCodeHelp: {
    en: "The QR code will direct you to a page where you'll receive a unique queue number.",
    sv: "QR-koden leder dig till en sida där du får ett unikt könummer."
  },
  refreshQr: {
    en: "Refresh QR Code",
    sv: "Uppdatera QR-kod"
  },
  yourNumber: {
    en: "Your Number",
    sv: "Ditt nummer"
  },
  waitingInLine: {
    en: "Waiting in line",
    sv: "Väntar i kön"
  },
  currentlyServing: {
    en: "Currently Serving",
    sv: "Betjänar för närvarande"
  },
  next: {
    en: "Next",
    sv: "Nästa"
  },
  queueControls: {
    en: "Queue Controls",
    sv: "Köinställningar"
  },
  callNextNumber: {
    en: "Call Next Number",
    sv: "Ropa nästa nummer"
  },
  recallPrevious: {
    en: "Recall Previous",
    sv: "Återkalla föregående"
  },
  enterSpecificNumber: {
    en: "Enter specific number",
    sv: "Ange specifikt nummer"
  },
  call: {
    en: "Call",
    sv: "Ropa"
  },
  systemSettings: {
    en: "System Settings",
    sv: "Systeminställningar"
  },
  soundNotifications: {
    en: "Sound Notifications",
    sv: "Ljudaviseringar"
  },
  visualAlerts: {
    en: "Visual Alerts",
    sv: "Visuella aviseringar"
  },
  resetQueue: {
    en: "Reset Queue",
    sv: "Återställ kö"
  },
  queueManagement: {
    en: "Queue Management",
    sv: "Köhantering"
  },
  totalInQueue: {
    en: "Total in queue",
    sv: "Totalt i kön"
  },
  search: {
    en: "Search",
    sv: "Sök"
  },
  allNumbers: {
    en: "All Numbers",
    sv: "Alla nummer"
  },
  waiting: {
    en: "Waiting",
    sv: "Väntar"
  },
  serving: {
    en: "Serving",
    sv: "Betjänar"
  },
  completed: {
    en: "Completed",
    sv: "Avslutad"
  },
  number: {
    en: "Number",
    sv: "Nummer"
  },
  status: {
    en: "Status",
    sv: "Status"
  },
  issuedAt: {
    en: "Issued At",
    sv: "Utfärdad vid"
  },
  actions: {
    en: "Actions",
    sv: "Åtgärder"
  },
  remove: {
    en: "Remove",
    sv: "Ta bort"
  },
  recall: {
    en: "Recall",
    sv: "Återkalla"
  },
  complete: {
    en: "Complete",
    sv: "Avsluta"
  },
  adminLogin: {
    en: "Admin Login",
    sv: "Admin Inloggning"
  },
  loginCredentials: {
    en: "Enter your credentials to access the admin panel",
    sv: "Ange dina inloggningsuppgifter för att komma åt adminpanelen"
  },
  username: {
    en: "Username",
    sv: "Användarnamn"
  },
  password: {
    en: "Password",
    sv: "Lösenord"
  },
  enterUsername: {
    en: "Enter username",
    sv: "Ange användarnamn"
  },
  enterPassword: {
    en: "Enter password",
    sv: "Ange lösenord"
  },
  login: {
    en: "Login",
    sv: "Logga in"
  },
  loggingIn: {
    en: "Logging in...",
    sv: "Loggar in..."
  },
  secureAccess: {
    en: "Secure access for Jobbtorg Stockholm staff only",
    sv: "Säker åtkomst endast för Jobbtorg Stockholms personal"
  },
  english: {
    en: "English",
    sv: "Engelska"
  },
  swedish: {
    en: "Swedish",
    sv: "Svenska"
  },
  language: {
    en: "Language",
    sv: "Språk"
  }
};

// Create a context for the language
export type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const defaultContextValue: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  t: () => "",
};

export const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage && (savedLanguage === "en" || savedLanguage === "sv") 
      ? savedLanguage 
      : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider 
      value={{
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
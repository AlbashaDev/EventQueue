import { Check, AlertCircle } from "lucide-react";

interface ToastNotificationProps {
  message: string;
  type?: "success" | "error";
}

export default function ToastNotification({ message, type = "success" }: ToastNotificationProps) {
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center z-50 ${
      type === "success" ? "bg-secondary" : "bg-error"
    } text-white`}>
      {type === "success" ? (
        <Check className="mr-2 h-5 w-5" />
      ) : (
        <AlertCircle className="mr-2 h-5 w-5" />
      )}
      <span>{message}</span>
    </div>
  );
}

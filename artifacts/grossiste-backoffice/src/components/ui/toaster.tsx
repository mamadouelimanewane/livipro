import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-center" 
      richColors 
      theme="light" 
      className="font-sans"
      toastOptions={{
        style: { borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }
      }}
    />
  );
}

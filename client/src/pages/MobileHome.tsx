import ResponsiveLayout from "@/components/ResponsiveLayout";

export default function MobileHome() {
  return (
    <ResponsiveLayout 
      onLogin={() => window.location.href = "/api/login"}
    />
  );
}
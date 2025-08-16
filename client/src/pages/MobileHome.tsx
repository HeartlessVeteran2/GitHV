import AndroidStudioLayout from "@/components/AndroidStudioLayout";

export default function MobileHome() {
  return (
    <AndroidStudioLayout 
      onLogin={() => window.location.href = "/api/login"}
    />
  );
}
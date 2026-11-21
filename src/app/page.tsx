import { AuthGuard } from "@/components/auth/AuthGuard";
import { ChatApp } from "@/components/chat/ChatApp";

export default function Home() {
  return (
    <AuthGuard>
      <ChatApp />
    </AuthGuard>
  );
}

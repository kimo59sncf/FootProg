
import { useTranslation } from "react-i18next";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");

  const { data: match } = useQuery({
    queryKey: ["/api/matches", id],
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/matches", id, "messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(`/api/matches/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Failed to send message");
    },
    onSuccess: () => {
      setMessage("");
      refetchMessages();
    },
  });

  const isParticipant = match?.participants?.some(p => p.userId === user?.id);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="p-6">
          <div className="h-[600px] flex flex-col">
            <div className="flex-grow overflow-y-auto mb-4 space-y-4">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`rounded-lg px-4 py-2 max-w-[70%] ${
                    msg.userId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <div className="text-sm font-medium">{msg.user.username}</div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (message.trim()) {
                sendMessageMutation.mutate(message);
              }
            }}>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("match.yourMessage")}
                  disabled={!user || !isParticipant}
                />
                <Button 
                  type="submit"
                  disabled={!message.trim() || !user || !isParticipant || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

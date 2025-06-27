import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import hrResponses from "./hrResponses.json";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "error";
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your HR Assistant. I can help you with employee queries, leave requests, payroll information, and company policies. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
      status: "delivered",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    "Check my leave balance",
    "Submit expense report",
    "View company holidays",
    "Update personal information",
    "IT support request",
    "Payroll inquiry",
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Update message status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 500);

    // Simulate API call to HR backend
    try {
      const response = await simulateHRApiCall(newMessage);

      setTimeout(() => {
        setIsTyping(false);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "bot",
          timestamp: new Date(),
          status: "delivered",
        };
        setMessages((prev) => [...prev, botMessage]);

        // Update user message to delivered
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg
          )
        );
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "error" } : msg
        )
      );
      toast({
        title: "Connection Error",
        description: "Failed to connect to HR system. Please try again.",
        variant: "destructive",
      });
    }
  };

  const simulateHRApiCall = async (message: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();

    // Find the first response where any keyword matches
    const matchedResponse = hrResponses.responses.find((response) =>
      response.keywords.some((keyword) => lowerMessage.includes(keyword))
    );

    if (matchedResponse) {
      return matchedResponse.response;
    }

    // Use the default response if no match found
    return hrResponses.defaultResponse.replace("{message}", message);
  };

  const handleQuickAction = (action: string) => {
    setNewMessage(action);
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-gray-400" />;
      case "sent":
        return <CheckCircle2 className="w-3 h-3 text-gray-500" />;
      case "delivered":
        return <CheckCircle2 className="w-3 h-3 text-blue-500" />;
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                HR Assistant
              </h1>
              <p className="text-sm text-gray-600">
                Your intelligent HR support companion
              </p>
            </div>
            <div className="ml-auto">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Connected to HR API
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="h-[600px] flex flex-col shadow-lg">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === "user"
                          ? "bg-blue-600"
                          : "bg-gradient-to-r from-teal-500 to-blue-500"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs ${
                            message.sender === "user"
                              ? "text-blue-100"
                              : "text-gray-800"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.sender === "user" && (
                          <div className="ml-2">
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 hover:bg-gray-50"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your HR question here..."
                className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className="shrink-0 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Features Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            🔒 Secure HR API Integration • 🤖 AI-Powered Responses • 📱 Mobile
            Friendly
          </p>
          {/* <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>Employee Services</span>
            <span>•</span>
            <span>Leave Management</span>
            <span>•</span>
            <span>Payroll Support</span>
            <span>•</span>
            <span>IT Helpdesk</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Index;

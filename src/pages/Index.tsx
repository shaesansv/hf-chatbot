import React, { useState, useRef, useEffect } from "react";
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
  const [irrelevantCount, setIrrelevantCount] = useState(0);
const [awaitingSupportConfirmation, setAwaitingSupportConfirmation] = useState(false);


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

  // If awaiting support confirmation, handle yes/no here
  if (awaitingSupportConfirmation) {
    const userReply = newMessage.trim().toLowerCase();
    if (userReply === "yes") {
      // Redirect or trigger support connection here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Connecting you to our support team...",
          sender: "bot",
          timestamp: new Date(),
          status: "delivered",
        },
      ]);
      // Reset irrelevant count and awaiting state
      setIrrelevantCount(0);
      setAwaitingSupportConfirmation(false);

      // TODO: Replace below with your actual redirect or support connection logic
      console.log("Redirecting to support team...");
    } else if (userReply === "no") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Okay, please continue asking your HR questions.",
          sender: "bot",
          timestamp: new Date(),
          status: "delivered",
        },
      ]);
      setIrrelevantCount(0);
      setAwaitingSupportConfirmation(false);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: 'Please answer "yes" or "no". Would you like to connect to our support team?',
          sender: "bot",
          timestamp: new Date(),
          status: "delivered",
        },
      ]);
    }

    setNewMessage("");
    return;
  }

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

  setTimeout(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
      )
    );
  }, 500);

  try {
    const { text: response, irrelevant } = await simulateHRApiCall(newMessage);

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

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );

      if (irrelevant) {
        setIrrelevantCount((count) => count + 1);
      } else {
        setIrrelevantCount(0);
      }

      // After 3 irrelevant responses, prompt user
      if (irrelevantCount + 1 >= 3) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            content: "I can't understand. Would you like to connect to our support team? (yes/no)",
            sender: "bot",
            timestamp: new Date(),
            status: "delivered",
          },
        ]);
        setAwaitingSupportConfirmation(true);
        setIrrelevantCount(0); // reset count after prompt
      }
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


  const simulateHRApiCall = async (message: string): Promise<{ text: string; irrelevant: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    const lowerMessage = message.toLowerCase();
  
    const matchedResponse = hrResponses.responses.find((response) =>
      response.keywords.some((keyword) => lowerMessage.includes(keyword))
    );
  
    if (matchedResponse) {
      return { text: matchedResponse.response, irrelevant: false };
    }
  
    const defaultText = hrResponses.defaultResponse.replace("{message}", message);
    return { text: defaultText, irrelevant: true };
  };
  

  const handleQuickAction = (action: string) => {
    setNewMessage(action);
    
    setTimeout(() => {
      handleSendMessageDirect(action);
    }, 100); 
  };

  const handleSendMessageDirect = async (messageContent: string) => {
  if (!messageContent.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    content: messageContent,
    sender: "user",
    timestamp: new Date(),
    status: "sending",
  };

  setMessages((prev) => [...prev, userMessage]);
  setNewMessage("");
  setIsTyping(true);

  setTimeout(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
      )
    );
  }, 500);

  try {
    const { text, irrelevant } = await simulateHRApiCall(newMessage);
  
    setTimeout(() => {
      setIsTyping(false);
  
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        sender: "bot",
        timestamp: new Date(),
        status: "delivered",
      };
  
      setMessages((prev) => [...prev, botMessage]);
  
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
  
      if (irrelevant) {
        setIrrelevantCount((count) => count + 1);
      } else {
        setIrrelevantCount(0);
      }
  
      if (irrelevantCount + 1 >= 3) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            content:
              "I can't understand. Would you like to connect to our support team? (yes/no)",
            sender: "bot",
            timestamp: new Date(),
            status: "delivered",
          },
        ]);
        setAwaitingSupportConfirmation(true);
        setIrrelevantCount(0);
      }
    }, 1500); // Make sure this closing parenthesis and semicolon are here
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
<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-cyan-50 to-teal-100">
  <div className="max-w-4xl mx-auto px-6 py-8">

    {/* --- Header moved here above chat box --- */}
    <div className="mb-6 bg-white border border-gray-300 rounded-2xl shadow-md px-6 py-5 flex items-center space-x-4">
      <div className="w-12 h-12 bg-gradient-to-r from-indigo-700 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Bot className="w-7 h-7 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-indigo-900">HR Assistant</h1>
        <p className="text-sm text-cyan-700 font-medium">
          Your intelligent HR support companion
        </p>
      </div>
      <div className="ml-auto">
        <Badge
          variant="secondary"
          className="bg-green-200 text-green-900 font-semibold shadow-inner"
        >
          Connected to HR API
        </Badge>
      </div>
    </div>

    {/* Chat Card */}
    <Card className="h-[600px] flex flex-col shadow-xl rounded-3xl border border-indigo-200">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6 bg-white rounded-3xl shadow-inner">
        <div className="space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    message.sender === "user"
                      ? "bg-indigo-700"
                      : "bg-gradient-to-r from-cyan-500 to-indigo-600"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`px-5 py-4 rounded-3xl shadow-lg ${
                    message.sender === "user"
                      ? "bg-indigo-700 text-white"
                      : "bg-gray-100 text-indigo-900"
                  }`}
                >
                  <p className="text-base leading-relaxed font-sans">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`text-xs font-mono ${
                        message.sender === "user"
                          ? "text-indigo-300"
                          : "text-indigo-700"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.sender === "user" && (
                      <div className="ml-3">{getStatusIcon(message.status)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-700 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-5 py-4 bg-gray-100 rounded-3xl shadow-lg">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-indigo-800 rounded-full animate-bounce"></div>
                    <div
                      className="w-3 h-3 bg-indigo-800 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-indigo-800 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
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
      <div className="px-6 py-3 border-t border-indigo-100 bg-indigo-50 rounded-b-3xl">
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="text-sm text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 rounded-lg"
            >
              {action}
            </Button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-indigo-100 bg-white rounded-b-3xl">
        <div className="flex items-center space-x-3">
          <Button
          type="file"
            variant="outline"
            size="sm"
            className="shrink-0 hover:bg-indigo-50 border-indigo-300"
          >
            <Paperclip className="w-5 h-5 text-indigo-700" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your HR question here..."
            className="flex-1 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-400 rounded-lg"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className="shrink-0 bg-gradient-to-r from-indigo-700 to-cyan-600 hover:from-indigo-800 hover:to-cyan-700 transition-all duration-300 rounded-lg"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </Card>

    {/* Features Footer */}
    <div className="mt-8 text-center">
      <p className="text-sm text-indigo-600 font-semibold mb-3">
        🔒 Secure HR API Integration • 🤖 AI-Powered Responses • 📱 Mobile Friendly
      </p>
    </div>
  </div>
</div>
  );
};
export default Index;

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AUTH_CONFIG } from "../config/auth";

const BASE_URL = process.env.P8_FS_API || "https://p8fs.percolationlabs.ai";
const API_URL = `${BASE_URL}/api/v1/chat/completions`;

type Role = "system" | "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

export function useAi() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const getAuthToken = async (): Promise<string> => {
    const token = await AsyncStorage.getItem(
      AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
    );
    if (!token) throw new Error("No access token found");
    return token;
  };

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const newMessages = [
        ...messages,
        { role: "user" as const, content: userMessage },
      ];
      setMessages(newMessages);

      const token = await getAuthToken();
      controllerRef.current = new AbortController();
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "X-P8-Agent": "p8-research",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: newMessages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        }),
        signal: controllerRef.current.signal,
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantMessage = "";

      setIsStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true }).trim();
        if (!chunk) continue;

        // Handle each line (API sends JSON chunks line-delimited)
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("{")) continue; // ignore non-JSON lines

          try {
            const data = JSON.parse(line);

            // 🔹 Stream chunks
            if (data.object === "chat.completion.chunk") {
              const token = data.choices?.[0]?.delta?.content;
              if (token) {
                assistantMessage += token;
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: "assistant", content: assistantMessage },
                ]);
              }
            }

            // 🔹 Final response
            else if (data.type === "completion") {
              assistantMessage = data.final_response || assistantMessage;
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: assistantMessage },
              ]);
              setIsStreaming(false);
              return;
            }
          } catch (err) {
            console.warn("Parse error:", line, err);
          }
        }
      }

      setIsStreaming(false);
    },
  });

  const stop = () => {
    controllerRef.current?.abort();
    setIsStreaming(false);
  };

  return {
    messages,
    isStreaming,
    sendMessage: (msg: string) => chatMutation.mutateAsync(msg),
    stop,
  };
}

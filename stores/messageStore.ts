import type { Message } from "@/hooks/useAi";
import { create } from "zustand";

const defaultMessage: Message = {
  role: "system",
  content: "You are a helpful assistant.",
};

type MessageStore = {
  messages: Message[];
  setMessages: (m: Message[]) => void;
  clearMessages: () => void;
};

const useMessageStore = create<MessageStore>((set) => ({
  messages: [defaultMessage],
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
}));

export default useMessageStore;

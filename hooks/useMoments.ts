import { moments as initialMoments } from "@/mock/momentsData";
import { useState } from "react";

export type Moment = {
  id: string | number;
  iconName?: string;
  iconColor?: string;
  label?: string;
  title: string;
  description: string;
  time?: string;
  tags?: string[];
  audioUrl?: string;
  images?: string[];
};

type AddMomentInput = Omit<Moment, "id" | "time"> & { time?: string };

export default function useMoments() {
  const [moments, setMoments] = useState<Moment[]>(() =>
    // initialize from mock data (shallow copy)
    initialMoments.map((m) => ({ ...m }))
  );

  function addMoment(input: AddMomentInput) {
    const time =
      input.time ??
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    const newMoment: Moment = {
      id: Date.now().toString(),
      time,
      ...input,
    };

    // prepend newest moments
    setMoments((prev) => [newMoment, ...prev]);
  }

  function editMoment(id: string | number, updates: Partial<AddMomentInput>) {
    setMoments((prev) => prev.map((m) => (String(m.id) === String(id) ? { ...m, ...updates } : m)));
  }

  return { moments, addMoment, editMoment } as const;
}

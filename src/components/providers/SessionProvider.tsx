"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import type { Person } from "@/types/session";

interface SessionContextValue {
  person: Person;
  setPerson: (person: Person) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// Seeded server-side (see (protected)/layout.tsx → getMe()) so there's no
// client-side loading flash and no duplicate fetch on first paint.
export function SessionProvider({ person, children }: { person: Person; children: ReactNode }) {
  const [current, setCurrent] = useState(person);
  return (
    <SessionContext.Provider value={{ person: current, setPerson: setCurrent }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useKlongSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useKlongSession must be used within a SessionProvider");
  }
  return ctx;
}

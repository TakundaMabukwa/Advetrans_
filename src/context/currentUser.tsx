import { createContext } from "react";
import { useState } from "react";

export const CurrentUserContext = createContext<any>(null)

export const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  return <CurrentUserContext.Provider value={{ user, setUser }}>{children}</CurrentUserContext.Provider>
}

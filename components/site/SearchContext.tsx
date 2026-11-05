"use client";

import { createContext, useContext, useState } from "react";

// El buscador del encabezado (escritorio y móvil) y el catálogo comparten
// el texto de búsqueda a través de este contexto.
type SearchState = { search: string; setSearch: (v: string) => void };

const Ctx = createContext<SearchState>({ search: "", setSearch: () => {} });

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");
  return <Ctx.Provider value={{ search, setSearch }}>{children}</Ctx.Provider>;
}

export const useSearch = () => useContext(Ctx);

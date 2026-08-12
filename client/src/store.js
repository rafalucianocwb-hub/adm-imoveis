import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "./api";

const RefContext = createContext(null);

export function RefProvider({ children }) {
  const [imoveis, setImoveis] = useState([]);
  const [corretores, setCorretores] = useState([]);

  const refresh = useCallback(() => {
    api.imoveis().then(setImoveis).catch(() => {});
    api.corretores().then(setCorretores).catch(() => {});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const imovelById = useCallback((id) => imoveis.find((i) => i.id === id || i.codigo === id), [imoveis]);
  const corCorretor = useCallback((nome) => (corretores.find((c) => c.nome === nome) || {}).cor || "#6B675B", [corretores]);

  const value = { imoveis, corretores, refresh, imovelById, corCorretor };
  return React.createElement(RefContext.Provider, { value }, children);
}

export function useRefData() {
  return useContext(RefContext);
}

const BASE = "/api";

let token = localStorage.getItem("rl_token") || null;

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("rl_token", t);
  else localStorage.removeItem("rl_token");
}
export function getToken() { return token; }

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  if (!(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(BASE + path, { ...opts, headers });
  if (res.status === 401) { setToken(null); window.location.reload(); throw new Error("Sessão expirada"); }
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`);
  return data;
}

export const api = {
  login: (email, senha) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, senha }) }),
  logout: (sessionId) => request("/auth/logout", { method: "POST", body: JSON.stringify({ sessionId }) }),
  me: () => request("/auth/me"),

  dashboard: () => request("/dashboard"),

  imoveis: (tipo) => request("/imoveis" + (tipo && tipo !== "Todos" ? `?tipo=${encodeURIComponent(tipo)}` : "")),
  imovel: (id) => request(`/imoveis/${id}`),
  addImovel: (body) => request("/imoveis", { method: "POST", body: JSON.stringify(body) }),
  editImovel: (id, body) => request(`/imoveis/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  avancarFase: (id, fase) => request(`/imoveis/${id}/fase`, { method: "POST", body: JSON.stringify({ fase }) }),

  leadsAngariacao: () => request("/proprietarios"),
  addLeadAngariacao: (body) => request("/proprietarios", { method: "POST", body: JSON.stringify(body) }),
  editLeadAngariacao: (id, body) => request(`/proprietarios/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  enviarParaImoveis: (id) => request(`/proprietarios/${id}/enviar-para-imoveis`, { method: "POST" }),
  interacoesLead: (id) => request(`/proprietarios/${id}/interacoes`),
  addInteracaoLead: (id, body) => request(`/proprietarios/${id}/interacoes`, { method: "POST", body: JSON.stringify(body) }),

  negocios: () => request("/negocios"),
  addNegocio: (body) => request("/negocios", { method: "POST", body: JSON.stringify(body) }),
  editNegocio: (id, body) => request(`/negocios/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  moverEtapa: (id, etapa) => request(`/negocios/${id}/etapa`, { method: "POST", body: JSON.stringify({ etapa }) }),
  semRetorno: (id) => request(`/negocios/${id}/sem-retorno`, { method: "POST" }),

  clientes: () => request("/clientes"),
  addCliente: (body) => request("/clientes", { method: "POST", body: JSON.stringify(body) }),
  editCliente: (id, body) => request(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  contratos: () => request("/contratos"),
  modelosContrato: () => request("/contratos/modelos"),
  addContrato: (body) => request("/contratos", { method: "POST", body: JSON.stringify(body) }),
  editContrato: (id, body) => request(`/contratos/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  campanhas: () => request("/campanhas"),
  siteAnalytics: () => request("/campanhas/site-analytics"),
  addCampanha: (body) => request("/campanhas", { method: "POST", body: JSON.stringify(body) }),
  editCampanha: (id, body) => request(`/campanhas/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  transacoes: () => request("/financeiro/transacoes"),
  addTransacao: (body) => request("/financeiro/transacoes", { method: "POST", body: JSON.stringify(body) }),
  resumoFinanceiro: () => request("/financeiro/resumo"),
  rentabilidadePorImovel: () => request("/financeiro/rentabilidade-por-imovel"),

  relatorios: () => request("/relatorios"),

  log: (params) => request("/log?" + new URLSearchParams(params || {})),

  usuarios: () => request("/usuarios"),
  corretores: () => request("/usuarios/corretores"),
  addUsuario: (body) => request("/usuarios", { method: "POST", body: JSON.stringify(body) }),
  editUsuario: (id, body) => request(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  setSenha: (id, senha) => request(`/usuarios/${id}/senha`, { method: "PUT", body: JSON.stringify({ senha }) }),
  delUsuario: (id) => request(`/usuarios/${id}`, { method: "DELETE" }),

  zerarDados: () => request("/admin/zerar-dados", { method: "POST" }),
};

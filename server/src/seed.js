import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db, proximoCodigo } from "./db.js";

function genContato(nome) {
  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  const ddds = ["48", "11", "51", "47", "41"];
  const ddd = ddds[nome.length % 5];
  const n = ((nome.length * 7919) % 9000) + 1000;
  const m = ((nome.length * 104729) % 9000) + 1000;
  const ruas = [
    "Rua Lauro Linhares",
    "Av. Beira-Mar Norte",
    "Rua das Araucárias",
    "Servidão das Palmeiras",
    "Rua João Pio Duarte",
    "Av. Madre Benvenuta",
  ];
  return {
    tel: `(${ddd}) 9${n}-${m}`,
    email: `${slug}@email.com`,
    endereco: `${ruas[nome.length % 6]}, ${((nome.length * 13) % 900) + 10} — Florianópolis/SC`,
  };
}

console.log("Limpando banco...");
for (const t of [
  "admin_log", "transacoes", "campanhas",
  "modelos_contrato", "contratos", "clientes", "negocios", "leads_angariacao",
  "imoveis", "proprietarios", "sessoes", "usuarios", "site_analytics", "contadores",
]) db.prepare(`DELETE FROM ${t}`).run();

// ---------------- USUÁRIOS ----------------
const usuariosSeed = [
  { nome: "Ricardo Liberato", username: "ricardo.liberato", email: "ricardo@rlimoveis.com.br", tel: "(48) 99911-2233", perfil: "Administrador" },
  { nome: "Marina Velasco", username: "marina.velasco", email: "marina@rlimoveis.com.br", tel: "(48) 99115-2027", perfil: "Corretor Sênior" },
  { nome: "André Liberato", username: "andre.liberato", email: "andre@rlimoveis.com.br", tel: "(48) 99220-8841", perfil: "Corretor" },
  { nome: "Paulo Renê", username: "paulo.rene", email: "paulo@rlimoveis.com.br", tel: "(48) 99332-7765", perfil: "Corretor Sênior" },
  { nome: "Camila Doin", username: "camila.doin", email: "camila@rlimoveis.com.br", tel: "(48) 99008-2211", perfil: "Corretor" },
  { nome: "Fernanda Alves", username: "fernanda.alves", email: "fernanda@rlimoveis.com.br", tel: "(48) 99441-0092", perfil: "Marketing" },
  { nome: "Bruno Kirchof", username: "bruno.kirchof", email: "bruno@rlimoveis.com.br", tel: "(48) 99775-4410", perfil: "Financeiro", status: "Inativo" },
];
const senhaHash = bcrypt.hashSync("demo1234", 10);
const usuarioIdPorNome = {};
const insUsuario = db.prepare(`INSERT INTO usuarios (id, codigo, nome, telefone, email, username, senha_hash, perfil, status, ultimo_acesso) VALUES (?,?,?,?,?,?,?,?,?,?)`);
for (const u of usuariosSeed) {
  const id = randomUUID();
  usuarioIdPorNome[u.nome] = id;
  insUsuario.run(id, proximoCodigo("U-"), u.nome, u.tel, u.email, u.username, senhaHash, u.perfil, u.status || "Ativo", "hoje 08:42");
}

// ---------------- PROPRIETÁRIOS (um por imóvel mantido) ----------------
const proprietarioNomes = ["Roberto Almeida", "Fernanda Luz", "Marcos Tavares", "Lucas Werneck"];
const proprietarioIdPorNome = {};
const insProp = db.prepare(`INSERT INTO proprietarios (id, nome, telefone, email, endereco) VALUES (?,?,?,?,?)`);
for (const nome of proprietarioNomes) {
  const id = randomUUID();
  proprietarioIdPorNome[nome] = id;
  const c = genContato(nome);
  insProp.run(id, nome, c.tel, c.email, c.endereco);
}

// ---------------- IMÓVEIS (um por tipo: Casa, Apartamento, Cobertura, Comercial) ----------------
const imoveisSeed = [
  { titulo: "Casa Alto Padrão · 4 suítes", tipo: "Casa", bairro: "Jurerê Internacional", area: 380, dorm: 4, vagas: 4, preco: 4200000, proprietario: "Roberto Almeida", corretor: "Marina Velasco", exclusivo: true, comissao: 6, fase: 6, foto: "casa-padrao.jpg", acessos: 1284, propostas: 3, favoritos: 48 },
  { titulo: "Apartamento 3 dorm · Vista Mar", tipo: "Apartamento", bairro: "Beira-Mar Norte", area: 124, dorm: 3, vagas: 2, preco: 1450000, proprietario: "Fernanda Luz", corretor: "André Liberato", exclusivo: true, comissao: 6, fase: 4, foto: "apto-vista.jpg", acessos: 2057, propostas: 5, favoritos: 91 },
  { titulo: "Cobertura Duplex · 3 suítes", tipo: "Cobertura", bairro: "Lagoa da Conceição", area: 210, dorm: 3, vagas: 3, preco: 2300000, proprietario: "Marcos Tavares", corretor: "Paulo Renê", exclusivo: false, comissao: 5, fase: 2, foto: "cobertura.jpg", acessos: 743, propostas: 1, favoritos: 22 },
  { titulo: "Sala Comercial · 45m²", tipo: "Comercial", bairro: "Trindade", area: 45, dorm: null, vagas: 1, preco: 380000, proprietario: "Lucas Werneck", corretor: "Paulo Renê", exclusivo: false, comissao: 5, fase: 1, foto: "garden.jpg", acessos: 412, propostas: 0, favoritos: 14 },
];
const imovelIdPorCodigo = {};
const insImovel = db.prepare(`INSERT INTO imoveis (id, codigo, titulo, tipo, bairro, cidade, area, dormitorios, vagas, preco, proprietario_id, corretor_id, exclusivo, comissao_pct, fase, foto_url, acessos, propostas, favoritos, matricula, tipo_autorizacao) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const im of imoveisSeed) {
  const id = randomUUID();
  const codigo = proximoCodigo("RL-", 101);
  imovelIdPorCodigo[codigo] = id;
  insImovel.run(id, codigo, im.titulo, im.tipo, im.bairro, "Florianópolis/SC", im.area, im.dorm, im.vagas, im.preco,
    proprietarioIdPorNome[im.proprietario], usuarioIdPorNome[im.corretor], im.exclusivo ? 1 : 0, im.comissao, im.fase,
    `/assets/urban/${im.foto}`, im.acessos, im.propostas, im.favoritos, `MAT-${10000 + Math.floor(Math.random() * 89999)}`,
    im.exclusivo ? "Exclusivo" : "Compartilhado");
}
const codigos = Object.keys(imovelIdPorCodigo); // RL-101..RL-104 em ordem

// ---------------- LEADS DE ANGARIAÇÃO (um por status) ----------------
const leadsSeed = [
  { nome: "Cláudia Regina", imovel: "Cobertura · Lagoa", origem: "Instagram", status: "Novo", valor: 2300000, corretor: "Paulo Renê" },
  { nome: "Beatriz Holanda", imovel: "Apto Garden · Campeche", origem: "Instagram", status: "Qualificado", valor: 720000, corretor: "Camila Doin" },
  { nome: "Sílvia Marques", imovel: "Apto 2 dorm · Itacorubi", origem: "Google", status: "Reunião", valor: 680000, corretor: "Marina Velasco" },
  { nome: "Invest Patrimonial", imovel: "Portfólio · 3 apartamentos", origem: "Google", status: "Autorização", valor: 2400000, corretor: "André Liberato" },
  { nome: "Renato Fagundes", imovel: "Sala Comercial · Centro", origem: "Marketplace", status: "Perdido", valor: 380000, corretor: "Paulo Renê" },
];
const insLead = db.prepare(`INSERT INTO leads_angariacao (id, codigo, nome, telefone, email, endereco, imovel_draft_json, origem, status, valor_vgv, corretor_id, observacao, enviado_imovel_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const l of leadsSeed) {
  const id = randomUUID();
  const c = genContato(l.nome);
  const draft = { titulo: l.imovel, tipo: "Casa", bairro: "", area: 0, dorm: null, vagas: 0, preco: l.valor, comissao: 5, exclusivo: true, matricula: "" };
  insLead.run(id, proximoCodigo("P-", 810), l.nome, c.tel, c.email, c.endereco, JSON.stringify(draft), l.origem, l.status, l.valor,
    usuarioIdPorNome[l.corretor], "", null);
}

// ---------------- NEGÓCIOS (FUNIL) — um por etapa ----------------
const negociosSeed = [
  { cliente: "Marcelo Tavora", imovel: codigos[0], etapa: "lead", origem: "Marketplace", corretor: "André Liberato", prob: 10, atividade: "Lead capturado via OLX" },
  { cliente: "Bruno Carvalho", imovel: codigos[2], etapa: "contato", origem: "Google", corretor: "Camila Doin", prob: 25, atividade: "Primeiro contato por WhatsApp" },
  { cliente: "Tatiana Webb", imovel: codigos[3], etapa: "visita", origem: "Marketplace", corretor: "Paulo Renê", prob: 35, atividade: "Visita agendada para sábado" },
  { cliente: "Ricardo Mendes", imovel: codigos[1], etapa: "proposta", origem: "Instagram", corretor: "André Liberato", prob: 50, atividade: "Proposta enviada · aguardando resposta" },
  { cliente: "Eduardo Brandão", imovel: codigos[1], etapa: "negoc", origem: "Instagram", corretor: "André Liberato", prob: 70, atividade: "Negociou condições de financiamento" },
  { cliente: "Juliana Reis", imovel: codigos[0], etapa: "doc", origem: "Google", corretor: "Marina Velasco", prob: 85, atividade: "Enviou documentos para análise" },
  { cliente: "Família Okabe", imovel: codigos[0], etapa: "assinado", origem: "Indicação", corretor: "Marina Velasco", prob: 95, atividade: "Contrato assinado · aguardando registro" },
  { cliente: "Sandra Lopes", imovel: codigos[2], etapa: "ganho", origem: "Instagram", corretor: "Camila Doin", prob: 100, atividade: "Venda finalizada · comissão recebida" },
  { cliente: "Anna Beatriz", imovel: codigos[0], etapa: "semretorno", origem: "Instagram", corretor: "Marina Velasco", prob: 20, atividade: "Aguardando aprovação de crédito · sem retorno" },
];
const insNegocio = db.prepare(`INSERT INTO negocios (id, codigo, cliente_nome, telefone, email, endereco, imovel_id, valor, etapa, origem, corretor_id, probabilidade, ultima_atividade) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const n of negociosSeed) {
  const id = randomUUID();
  const c = genContato(n.cliente);
  const imId = imovelIdPorCodigo[n.imovel];
  const preco = db.prepare(`SELECT preco FROM imoveis WHERE id=?`).get(imId).preco;
  insNegocio.run(id, proximoCodigo("N-", 2041), n.cliente, c.tel, c.email, c.endereco, imId, preco, n.etapa, n.origem,
    usuarioIdPorNome[n.corretor], n.prob, n.atividade);
}

// ---------------- CLIENTES — um por status ----------------
const clientesSeed = [
  { nome: "Sandra Lopes", status: "Comprou", imovel: codigos[2], origem: "Instagram", corretor: "Camila Doin", desde: "24/05/2026", ultimo: "há 6 dias", obs: "Compra concluída · cliente muito satisfeita." },
  { nome: "Família Okabe", status: "Em processo", imovel: codigos[0], origem: "Indicação", corretor: "Marina Velasco", desde: "30/05/2026", ultimo: "há 3 dias", obs: "Contrato assinado · aguardando registro em cartório." },
  { nome: "Anna Beatriz", status: "Sem retorno", imovel: codigos[0], origem: "Instagram", corretor: "Marina Velasco", desde: "25/05/2026", ultimo: "há 7 dias", obs: "Aguardando aprovação de crédito · cobrar banco." },
  { nome: "Renato Fagundes", status: "Desistiu", imovel: codigos[3], origem: "Marketplace", corretor: "Paulo Renê", desde: "14/05/2026", ultimo: "há 14 dias", obs: "Desistiu — comprou sala comercial de concorrente." },
];
const insCliente = db.prepare(`INSERT INTO clientes (id, codigo, nome, telefone, email, endereco, status, imovel_id, valor, origem, corretor_id, observacao, desde, ultimo_contato) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const cl of clientesSeed) {
  const id = randomUUID();
  const c = genContato(cl.nome);
  const imId = imovelIdPorCodigo[cl.imovel];
  const preco = db.prepare(`SELECT preco FROM imoveis WHERE id=?`).get(imId).preco;
  insCliente.run(id, proximoCodigo("CL-", 1), cl.nome, c.tel, c.email, c.endereco, cl.status, imId, preco, cl.origem,
    usuarioIdPorNome[cl.corretor], cl.obs, cl.desde, cl.ultimo);
}

// ---------------- CONTRATOS — um por status ----------------
const contratosSeed = [
  { tipo: "Autorização de Venda", parte: "Roberto Almeida", imovel: codigos[0], status: "Assinado", data: "15/04/2026", exclusivo: true },
  { tipo: "Contrato de Compra e Venda", parte: "Sandra Lopes", imovel: codigos[2], status: "Finalizado", data: "24/05/2026", exclusivo: false },
  { tipo: "Proposta de Compra", parte: "Juliana Reis", imovel: codigos[0], status: "Em revisão", data: "01/06/2026", exclusivo: false },
  { tipo: "Autorização de Venda", parte: "Lucas Werneck", imovel: codigos[3], status: "Pendente", data: null, exclusivo: true },
];
const insContrato = db.prepare(`INSERT INTO contratos (id, codigo, tipo, parte_nome, imovel_id, status, data_assinatura, valor, exclusivo) VALUES (?,?,?,?,?,?,?,?,?)`);
for (const ct of contratosSeed) {
  const imId = imovelIdPorCodigo[ct.imovel];
  const preco = db.prepare(`SELECT preco FROM imoveis WHERE id=?`).get(imId).preco;
  insContrato.run(randomUUID(), proximoCodigo("CT-", 330), ct.tipo, ct.parte, imId, ct.status, ct.data, preco, ct.exclusivo ? 1 : 0);
}

// ---------------- MODELOS DE CONTRATO (um de cada modelo padrão) ----------------
const modelosSeed = [
  { nome: "Autorização de Venda", desc: "Autoriza a intermediação e venda do imóvel pelo prazo e comissão acordados com o proprietário.", icone: "doc", usos: 14 },
  { nome: "Contrato de Compra e Venda", desc: "Instrumento particular de compra e venda de imóvel, com condições de pagamento e prazos.", icone: "sign", usos: 9 },
  { nome: "Termo de Exclusividade", desc: "Define período de venda com exclusividade e condições de remuneração da imobiliária.", icone: "lock", usos: 11 },
  { nome: "Proposta de Compra", desc: "Formaliza valor, condições de pagamento e prazo de validade da oferta do comprador.", icone: "hand", usos: 23 },
  { nome: "Contrato de Locação", desc: "Instrumento de locação residencial ou comercial, com garantias e índice de reajuste.", icone: "split", usos: 6 },
];
const insModelo = db.prepare(`INSERT INTO modelos_contrato (id, nome, descricao, icone, usos) VALUES (?,?,?,?,?)`);
for (const m of modelosSeed) insModelo.run(randomUUID(), m.nome, m.desc, m.icone, m.usos);

// ---------------- CAMPANHAS — uma por canal ----------------
const campanhasSeed = [
  { nome: "Imóveis Floripa · Conversão", canal: "Instagram", objetivo: "Vender Imóveis", status: "Ativa", invest: 18000, gasto: 14820, impressoes: 842000, cliques: 21300, leads: 412, conv: 9, receita: 188000, periodo: "Mai 2026" },
  { nome: "Apartamentos à Venda · Search", canal: "Google", objetivo: "Vender Imóveis", status: "Ativa", invest: 22000, gasto: 19980, impressoes: 128000, cliques: 6400, leads: 268, conv: 11, receita: 236000, periodo: "Mai 2026" },
  { nome: "Casas e Coberturas · OLX/ZAP", canal: "Marketplace", objetivo: "Vender Imóveis", status: "Ativa", invest: 6000, gasto: 5400, impressoes: 54000, cliques: 2480, leads: 88, conv: 3, receita: 96000, periodo: "Mai 2026" },
];
const insCamp = db.prepare(`INSERT INTO campanhas (id, codigo, nome, canal, objetivo, status, investimento, gasto, impressoes, cliques, leads, conversoes, receita, periodo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const c of campanhasSeed) insCamp.run(randomUUID(), proximoCodigo("C-", 1), c.nome, c.canal, c.objetivo, c.status, c.invest, c.gasto, c.impressoes, c.cliques, c.leads, c.conv, c.receita, c.periodo);

// ---------------- TRANSAÇÕES — uma por categoria ----------------
const transacoesSeed = [
  { data: "28/05", desc: "Comissão venda · Cobertura RL-103", imovel: codigos[2], tipo: "Comissão", valor: 138000, sinal: "+" },
  { data: "26/05", desc: "Investimento · Google Ads (Search)", imovel: null, tipo: "Marketing", valor: 19980, sinal: "-" },
  { data: "20/05", desc: "Taxa de intermediação · RL-101", imovel: codigos[0], tipo: "Taxa", valor: 2500, sinal: "+" },
  { data: "18/05", desc: "Custo cartório / registro · RL-101", imovel: codigos[0], tipo: "Cartório", valor: 3200, sinal: "-" },
  { data: "12/05", desc: "Assinatura CRM + Portal", imovel: null, tipo: "Operacional", valor: 890, sinal: "-" },
];
const insTrans = db.prepare(`INSERT INTO transacoes (id, codigo, data, descricao, categoria, imovel_id, valor, sinal) VALUES (?,?,?,?,?,?,?,?)`);
for (const t of transacoesSeed) insTrans.run(randomUUID(), proximoCodigo("T-", 501), t.data, t.desc, t.tipo, t.imovel ? imovelIdPorCodigo[t.imovel] : null, t.valor, t.sinal);

// ---------------- ADMIN LOG — um por nível ----------------
const logsSeed = [
  { usuario: "Ricardo Liberato", acao: "Login", modulo: "Sistema", alvo: "Sessão iniciada", nivel: "info" },
  { usuario: "Marina Velasco", acao: "Criou imóvel", modulo: "Imóveis", alvo: "RL-101 · Casa Alto Padrão", nivel: "criacao" },
  { usuario: "André Liberato", acao: "Moveu negócio", modulo: "Funil", alvo: "Negócio → Negociação", nivel: "edicao" },
  { usuario: "Ricardo Liberato", acao: "Excluiu imóvel", modulo: "Imóveis", alvo: "RL-090 · anúncio duplicado", nivel: "exclusao" },
  { usuario: "André Liberato", acao: "Tentativa de login falha", modulo: "Sistema", alvo: "Senha incorreta (2x)", nivel: "alerta" },
];
const insLog = db.prepare(`INSERT INTO admin_log (id, usuario, acao, modulo, alvo, nivel, ip) VALUES (?,?,?,?,?,?,?)`);
const ips = ["189.45.102.8", "201.17.88.41", "177.92.14.220", "191.55.30.12", "45.231.7.90"];
logsSeed.forEach((l, i) => insLog.run(randomUUID(), l.usuario, l.acao, l.modulo, l.alvo, l.nivel, ips[i % ips.length]));

// ---------------- SITE ANALYTICS (14 dias) ----------------
const siteTrafego = [380, 420, 510, 470, 560, 640, 720, 690, 810, 760, 880, 940, 1020, 1180];
const siteLeads = [9, 11, 12, 10, 14, 17, 16, 15, 20, 18, 22, 24, 27, 31];
const insAnalytics = db.prepare(`INSERT INTO site_analytics (data, acessos, leads) VALUES (?,?,?)`);
const hoje = new Date();
siteTrafego.forEach((acessos, i) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() - (siteTrafego.length - 1 - i));
  insAnalytics.run(d.toISOString().slice(0, 10), acessos, siteLeads[i]);
});

console.log("Seed concluído:");
console.log("  usuarios:", db.prepare("SELECT COUNT(*) n FROM usuarios").get().n);
console.log("  imoveis:", db.prepare("SELECT COUNT(*) n FROM imoveis").get().n);
console.log("  negocios:", db.prepare("SELECT COUNT(*) n FROM negocios").get().n);
console.log("  leads_angariacao:", db.prepare("SELECT COUNT(*) n FROM leads_angariacao").get().n);
console.log("  clientes:", db.prepare("SELECT COUNT(*) n FROM clientes").get().n);
console.log("  contratos:", db.prepare("SELECT COUNT(*) n FROM contratos").get().n);
console.log("  campanhas:", db.prepare("SELECT COUNT(*) n FROM campanhas").get().n);
console.log("  transacoes:", db.prepare("SELECT COUNT(*) n FROM transacoes").get().n);
console.log("  admin_log:", db.prepare("SELECT COUNT(*) n FROM admin_log").get().n);
console.log("\nLogin de demonstração (senha para todos: demo1234):");
for (const u of usuariosSeed) console.log(`  ${u.email} — ${u.perfil}`);

// AstroCode Backend - server.js
// npm install express cors
// node server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = "./plugins.json";

app.use(cors());
app.use(express.json());

// ---------- Helpers ----------

function readPlugins() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writePlugins(plugins) {
  fs.writeFileSync(DB_FILE, JSON.stringify(plugins, null, 2));
}

// ---------- Rotas Públicas (app consome) ----------

// Lista todos plugins publicados para o Marketplace
app.get("/plugins", (req, res) => {
  const plugins = readPlugins().filter(p => p.published);
  res.json(plugins.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
  })));
});

// Extensões + ações de cada plugin (carregado pelo PluginCapabilityRegistry)
app.get("/plugin-capabilities", (req, res) => {
  const plugins = readPlugins().filter(p => p.published);
  res.json(plugins.map(p => ({
    pluginId: p.id,
    extensions: p.extensions,
    action: p.action,
  })));
});

// Plugins pagos comprados pelo usuário
app.get("/purchases/:userId", (req, res) => {
  // TODO: conectar ao banco de dados real (ex: Supabase, Firebase)
  // Por enquanto retorna array vazio
  res.json([]);
});

// ---------- Rotas Admin (painel consome) ----------

// Listar todos (incluindo rascunhos)
app.get("/admin/plugins", (req, res) => {
  res.json(readPlugins());
});

// Criar plugin
app.post("/admin/plugins", (req, res) => {
  const plugins = readPlugins();
  const plugin = {
    id: req.body.id,
    name: req.body.name,
    extensions: req.body.extensions || [],
    action: req.body.action || "RUN",
    price: req.body.price || 0,
    description: req.body.description || "",
    published: req.body.published ?? false,
    createdAt: new Date().toISOString(),
  };

  if (plugins.find(p => p.id === plugin.id)) {
    return res.status(400).json({ error: "ID já existe" });
  }

  plugins.push(plugin);
  writePlugins(plugins);
  res.status(201).json(plugin);
});

// Atualizar plugin
app.put("/admin/plugins/:id", (req, res) => {
  const plugins = readPlugins();
  const idx = plugins.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Plugin não encontrado" });

  plugins[idx] = { ...plugins[idx], ...req.body, updatedAt: new Date().toISOString() };
  writePlugins(plugins);
  res.json(plugins[idx]);
});

// Deletar plugin
app.delete("/admin/plugins/:id", (req, res) => {
  const plugins = readPlugins();
  const updated = plugins.filter(p => p.id !== req.params.id);
  if (updated.length === plugins.length) return res.status(404).json({ error: "Plugin não encontrado" });
  writePlugins(updated);
  res.json({ ok: true });
});

// ---------- Start ----------

app.listen(PORT, () => {
  console.log(`AstroCode API rodando em http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log(`  GET  /plugins`);
  console.log(`  GET  /plugin-capabilities`);
  console.log(`  GET  /purchases/:userId`);
  console.log(`  GET  /admin/plugins`);
  console.log(`  POST /admin/plugins`);
  console.log(`  PUT  /admin/plugins/:id`);
  console.log(`  DEL  /admin/plugins/:id`);
});

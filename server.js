// AstroCode - API + Admin Panel
// npm install express cors
// Acesse o painel em: https://suaurl.railway.app/admin

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ================================================================
// PLUGINS — edite esta lista para persistir após restart do servidor
// ================================================================
let plugins = [
  {
    id: "dart-runner", name: "Dart Runner", description: "Execute arquivos Dart no editor",
    extensions: ["dart"], action: "RUN", price: 0, published: true,
    iconEmoji: "◆", iconColorHex: "#54C5F8", type: "TOOL",
    rating: 4.3, reviewCount: 56, official: true, featured: false,
    version: "1.0.0", author: "AstroCode Official"
  },
  {
    id: "python-exec", name: "Python Exec", description: "Execute scripts Python com output em tempo real",
    extensions: ["py", "python"], action: "RUN", price: 0, published: true,
    iconEmoji: "🐍", iconColorHex: "#A5D6A7", type: "TOOL",
    rating: 4.5, reviewCount: 78, official: true, featured: false,
    version: "1.0.0", author: "AstroCode Official"
  },
  {
    id: "js-runner", name: "JS Runner", description: "Execute JavaScript e TypeScript",
    extensions: ["js", "ts"], action: "RUN", price: 1.99, published: false,
    iconEmoji: "🟡", iconColorHex: "#FDD835", type: "TOOL",
    rating: 4.1, reviewCount: 23, official: true, featured: false,
    version: "0.9.0", author: "AstroCode Official"
  },
];
// ================================================================


// ───────────── ROTAS PÚBLICAS (app Kotlin consome) ─────────────

app.get("/plugins", (req, res) => {
  res.json(
    plugins.filter(p => p.published).map(p => ({
      id          : p.id,
      name        : p.name,
      description : p.description,
      price       : p.price,
      iconEmoji   : p.iconEmoji    || "⬡",
      iconColorHex: p.iconColorHex || "#FF6A00",
      type        : p.type         || "TOOL",
      rating      : p.rating       || 0,
      reviewCount : p.reviewCount  || 0,
      official    : p.official     || false,
      featured    : p.featured     || false,
      version     : p.version      || "1.0.0",
      author      : p.author       || "AstroCode Official"
    }))
  );
});

app.get("/plugin-capabilities", (req, res) => {
  res.json(
    plugins.filter(p => p.published).map(p => ({
      pluginId: p.id, extensions: p.extensions, action: p.action
    }))
  );
});

app.get("/purchases/:userId", (req, res) => {
  res.json([]); // TODO: conectar banco de dados
});


// ───────────── ROTAS ADMIN (painel consome) ─────────────

app.get("/admin/api/plugins", (req, res) => res.json(plugins));

app.post("/admin/api/plugins", (req, res) => {
  if (plugins.find(p => p.id === req.body.id))
    return res.status(400).json({ error: "ID já existe" });
  const p = { ...req.body, createdAt: new Date().toISOString() };
  plugins.push(p);
  res.status(201).json(p);
});

app.put("/admin/api/plugins/:id", (req, res) => {
  const i = plugins.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Não encontrado" });
  plugins[i] = { ...plugins[i], ...req.body };
  res.json(plugins[i]);
});

app.delete("/admin/api/plugins/:id", (req, res) => {
  plugins = plugins.filter(p => p.id !== req.params.id);
  res.json({ ok: true });
});

// Exporta o server.js atualizado com os plugins atuais baked-in
app.get("/admin/api/export", (req, res) => {
  res.json({ plugins });
});


// ───────────── PAINEL ADMIN HTML ─────────────

app.get("/admin", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>AstroCode Admin</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#07090f;--surface:#0d1321;--card:#111827;--border:#1e2d45;
    --accent:#00c2ff;--purple:#8b5cf6;--green:#10b981;--red:#ef4444;--yellow:#f59e0b;
    --text:#e2e8f0;--muted:#64748b;
    --ff:'Space Grotesk',sans-serif;--mono:'JetBrains Mono',monospace;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--ff);min-height:100vh}
  body::before{content:'';position:fixed;inset:0;pointer-events:none;
    background:radial-gradient(600px at 50% 0%,#00c2ff08,transparent),
               radial-gradient(400px at 90% 80%,#8b5cf610,transparent)}

  /* Header */
  .header{position:sticky;top:0;z-index:50;background:rgba(13,19,33,.92);backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border);padding:14px 20px;
    display:flex;align-items:center;gap:12px}
  .logo{width:34px;height:34px;border-radius:9px;
    background:linear-gradient(135deg,var(--accent),var(--purple));
    display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .logo-text h1{font-size:16px;font-weight:800;letter-spacing:-.02em;line-height:1}
  .logo-text small{font-size:10px;color:var(--muted);font-family:var(--mono)}
  .header-badges{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}

  /* Tabs */
  .tabs{display:flex;border-bottom:1px solid var(--border);padding:0 12px;
    background:rgba(13,19,33,.7);overflow-x:auto;gap:0}
  .tabs::-webkit-scrollbar{display:none}
  .tab{background:none;border:none;color:var(--muted);padding:12px 14px;
    font-size:13px;font-weight:600;font-family:var(--ff);cursor:pointer;white-space:nowrap;
    border-bottom:2px solid transparent;transition:all .15s}
  .tab.active{color:var(--accent);border-bottom-color:var(--accent)}

  /* Content */
  .content{padding:18px 16px;max-width:700px;margin:0 auto}

  /* Cards */
  .plugin-card{background:var(--card);border:1px solid var(--border);border-radius:12px;
    padding:16px;margin-bottom:10px;transition:opacity .2s}
  .plugin-card.draft{opacity:.6}
  .plugin-card-top{display:flex;gap:10px;align-items:flex-start}
  .plugin-info{flex:1;min-width:0}
  .plugin-name{font-size:15px;font-weight:700;margin-bottom:6px;
    display:flex;align-items:center;gap:7px;flex-wrap:wrap}
  .plugin-ext{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px}
  .plugin-desc{font-size:12px;color:var(--muted);line-height:1.5}
  .plugin-id{font-family:var(--mono);font-size:10px;color:var(--border);margin-top:5px}
  .plugin-actions{display:flex;flex-direction:column;gap:5px;flex-shrink:0}

  /* Badges */
  .badge{font-family:var(--mono);font-size:10px;font-weight:700;
    border-radius:4px;padding:2px 7px;border:1px solid;letter-spacing:.05em}
  .tag{font-family:var(--mono);font-size:10px;color:var(--muted);
    background:#ffffff08;border:1px solid var(--border);border-radius:3px;padding:2px 6px}

  /* Buttons */
  .btn{border:1px solid;border-radius:7px;padding:6px 11px;cursor:pointer;
    font-size:11px;font-weight:700;font-family:var(--ff);white-space:nowrap;transition:opacity .15s}
  .btn:hover{opacity:.85}
  .btn-edit{background:rgba(0,194,255,.1);border-color:rgba(0,194,255,.3);color:var(--accent)}
  .btn-pub{background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.3);color:var(--green)}
  .btn-unpub{background:rgba(139,92,246,.1);border-color:rgba(139,92,246,.3);color:var(--purple)}
  .btn-del{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.3);color:var(--red)}
  .btn-primary{background:linear-gradient(135deg,var(--accent),var(--purple));
    border:none;color:#fff;border-radius:9px;padding:13px;width:100%;
    font-size:15px;font-weight:800;cursor:pointer;font-family:var(--ff)}
  .btn-sec{background:var(--surface);border-color:var(--border);color:var(--muted);
    border-radius:9px;padding:13px 18px;font-size:14px;cursor:pointer;font-family:var(--ff)}
  .btn-new{background:rgba(0,194,255,.1);border:1px solid rgba(0,194,255,.4);
    color:var(--accent);border-radius:8px;padding:8px 16px;cursor:pointer;
    font-size:13px;font-weight:700;font-family:var(--ff)}

  /* Form */
  .form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
  .form-label{font-size:11px;color:var(--muted);font-weight:600;
    letter-spacing:.08em;text-transform:uppercase}
  .form-input{background:var(--surface);border:1px solid var(--border);border-radius:8px;
    padding:10px 13px;color:var(--text);font-size:14px;font-family:var(--ff);
    outline:none;width:100%;transition:border-color .2s}
  .form-input:focus{border-color:var(--accent)}
  .form-input.mono{font-family:var(--mono)}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .toggle-row{display:flex;align-items:center;gap:10px;margin-bottom:14px}
  .toggle{width:44px;height:24px;border-radius:12px;cursor:pointer;
    position:relative;transition:background .2s;flex-shrink:0}
  .toggle-knob{position:absolute;top:3px;width:18px;height:18px;
    border-radius:9px;background:#fff;transition:left .2s}

  /* Code block */
  .code-block{background:#050810;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:16px}
  .code-header{display:flex;justify-content:space-between;align-items:center;
    padding:8px 14px;border-bottom:1px solid var(--border);background:var(--surface)}
  .code-label{font-family:var(--mono);font-size:11px;color:var(--muted)}
  .code-copy{background:none;border:none;color:var(--muted);cursor:pointer;
    font-size:11px;font-family:var(--mono)}
  .code-pre{margin:0;padding:14px 16px;font-family:var(--mono);font-size:11px;
    color:#7dd3fc;overflow-x:auto;line-height:1.7;white-space:pre-wrap;word-break:break-all}

  /* Modal */
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.75);
    display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
  .modal{background:var(--card);border:1px solid rgba(239,68,68,.4);
    border-radius:16px;padding:24px;width:100%;max-width:340px}
  .modal h3{font-size:17px;font-weight:800;margin-bottom:8px}
  .modal p{font-size:13px;color:var(--muted);margin-bottom:20px}
  .modal-btns{display:flex;gap:10px}

  /* Toast */
  .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
    border-radius:10px;padding:10px 20px;font-family:var(--mono);font-size:13px;
    font-weight:700;backdrop-filter:blur(12px);z-index:200;white-space:nowrap;
    transition:opacity .3s;border:1px solid}

  /* Info box */
  .info-box{border-radius:10px;padding:14px;font-size:13px;line-height:1.6;margin-bottom:16px;border:1px solid}
  .info-accent{background:rgba(0,194,255,.08);border-color:rgba(0,194,255,.25);color:var(--accent)}
  .info-green{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.25);color:var(--green)}
  .info-yellow{background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.25);color:var(--yellow)}

  .section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
  .section-count{font-size:12px;color:var(--muted);font-family:var(--mono)}
  .empty{text-align:center;padding:40px 20px;color:var(--muted)}
  .empty-icon{font-size:28px;margin-bottom:10px}

  @media(max-width:400px){
    .form-row{grid-template-columns:1fr}
    .plugin-actions{flex-direction:row;flex-wrap:wrap}
  }
</style>
</head>
<body>

<div class="header">
  <div class="logo">✦</div>
  <div class="logo-text">
    <h1>AstroCode</h1>
    <small>admin panel</small>
  </div>
  <div class="header-badges" id="header-badges"></div>
</div>

<div class="tabs">
  <button class="tab active" onclick="showTab('plugins')">Plugins</button>
  <button class="tab" onclick="showTab('form')">Novo Plugin</button>
  <button class="tab" onclick="showTab('api')">API Preview</button>
  <button class="tab" onclick="showTab('export')">Exportar</button>
</div>

<div class="content">

  <!-- PLUGINS TAB -->
  <div id="tab-plugins">
    <div class="section-header">
      <span class="section-count" id="plugin-count">carregando...</span>
      <button class="btn-new" onclick="showTab('form')">+ Novo Plugin</button>
    </div>
    <div id="plugin-list"></div>
  </div>

  <!-- FORM TAB -->
  <div id="tab-form" style="display:none">
    <h2 id="form-title" style="font-size:20px;font-weight:800;margin-bottom:18px">Novo Plugin</h2>
    <input type="hidden" id="edit-id">

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ID do Plugin</label>
        <input class="form-input mono" id="f-id" placeholder="dart-runner">
      </div>
      <div class="form-group">
        <label class="form-label">Nome</label>
        <input class="form-input" id="f-name" placeholder="Dart Runner">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Extensões (separadas por vírgula)</label>
      <input class="form-input mono" id="f-ext" placeholder="dart, drt">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Ação</label>
        <select class="form-input mono" id="f-action">
          <option>RUN</option><option>FORMAT</option><option>LINT</option>
          <option>ANALYZE</option><option>BUILD</option><option>DEBUG</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Preço (R$)</label>
        <input class="form-input mono" id="f-price" type="number" placeholder="0" min="0" step="0.01">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Descrição</label>
      <input class="form-input" id="f-desc" placeholder="Descreva o plugin...">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Ícone (emoji)</label>
        <input class="form-input mono" id="f-icon" placeholder="🐍">
      </div>
      <div class="form-group">
        <label class="form-label">Cor do ícone (hex)</label>
        <input class="form-input mono" id="f-color" placeholder="#FF6A00">
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select class="form-input mono" id="f-type">
          <option value="TOOL">Ferramentas</option>
          <option value="AI">IA</option>
          <option value="LANGUAGE">Linguagem</option>
          <option value="PREVIEW">Preview</option>
          <option value="CLOUD">Cloud</option>
          <option value="THEME">Tema</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Versão</label>
        <input class="form-input mono" id="f-version" placeholder="1.0.0">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Autor</label>
      <input class="form-input" id="f-author" placeholder="AstroCode Official">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Rating (0-5)</label>
        <input class="form-input mono" id="f-rating" type="number" placeholder="4.5" min="0" max="5" step="0.1">
      </div>
      <div class="form-group">
        <label class="form-label">Nº de avaliações</label>
        <input class="form-input mono" id="f-reviews" type="number" placeholder="0" min="0">
      </div>
    </div>

    <div style="display:flex;gap:20px;margin-bottom:14px;font-size:13px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="f-official"> Oficial
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="f-featured"> Destaque
      </label>
    </div>

    <div class="toggle-row">
      <div class="toggle" id="pub-toggle" onclick="togglePub()">
        <div class="toggle-knob" id="pub-knob" style="left:3px"></div>
      </div>
      <span id="pub-label" style="font-size:13px;color:var(--muted)">Salvar como rascunho</span>
    </div>

    <div style="display:flex;gap:10px">
      <button class="btn-primary" onclick="submitForm()">Salvar Plugin</button>
      <button class="btn-sec" onclick="showTab('plugins')">Cancelar</button>
    </div>
  </div>

  <!-- API PREVIEW TAB -->
  <div id="tab-api" style="display:none">
    <div class="info-box info-accent">
      💡 JSON exato que sua API retorna. O app Kotlin consome esses endpoints.
    </div>
    <p style="font-size:11px;color:var(--muted);font-family:var(--mono);margin-bottom:6px">GET /plugin-capabilities</p>
    <div class="code-block">
      <div class="code-header">
        <span class="code-label">plugin-capabilities</span>
        <button class="code-copy" onclick="copyCode('cap-code')">copiar</button>
      </div>
      <pre class="code-pre" id="cap-code"></pre>
    </div>
    <p style="font-size:11px;color:var(--muted);font-family:var(--mono);margin-bottom:6px">GET /plugins</p>
    <div class="code-block">
      <div class="code-header">
        <span class="code-label">plugins</span>
        <button class="code-copy" onclick="copyCode('plug-code')">copiar</button>
      </div>
      <pre class="code-pre" id="plug-code"></pre>
    </div>
  </div>

  <!-- EXPORT TAB -->
  <div id="tab-export" style="display:none">
    <div class="info-box info-yellow">
      ⚠️ O Railway reinicia o servidor às vezes e perde os plugins adicionados pelo painel. Para deixar permanente: copie o bloco abaixo e substitua no seu server.js, depois faça commit no GitHub.
    </div>
    <p style="font-size:11px;color:var(--muted);font-family:var(--mono);margin-bottom:6px">Cole no server.js substituindo o array plugins:</p>
    <div class="code-block">
      <div class="code-header">
        <span class="code-label">plugins array atualizado</span>
        <button class="code-copy" onclick="copyCode('export-code')" style="font-weight:700;color:var(--green)">📋 copiar</button>
      </div>
      <pre class="code-pre" id="export-code"></pre>
    </div>
    <div class="info-box info-green" style="margin-top:0">
      ✓ Após colar e fazer commit, os plugins ficam permanentes mesmo se o servidor reiniciar.
    </div>
  </div>

</div>

<!-- Modal de confirmação de deleção -->
<div class="modal-bg" id="del-modal" style="display:none">
  <div class="modal">
    <h3>Deletar plugin?</h3>
    <p>Esta ação não pode ser desfeita.</p>
    <div class="modal-btns">
      <button class="btn-primary" style="background:var(--red)" onclick="confirmDelete()">Deletar</button>
      <button class="btn-sec" onclick="closeModal()">Cancelar</button>
    </div>
  </div>
</div>

<div class="toast" id="toast" style="display:none"></div>

<script>
  let plugins = [];
  let pubState = false;
  let deleteTargetId = null;
  let currentTab = 'plugins';

  const ACTION_COLOR = {
    RUN:'#10b981', FORMAT:'#00c2ff', LINT:'#f59e0b',
    ANALYZE:'#8b5cf6', BUILD:'#00c2ff', DEBUG:'#ef4444'
  };

  async function api(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch('/admin/api' + path, opts);
    return r.json();
  }

  async function loadPlugins() {
    plugins = await api('GET', '/plugins');
    renderPlugins();
    renderAPI();
    renderExport();
  }

  function renderPlugins() {
    const pub = plugins.filter(p => p.published).length;
    const draft = plugins.length - pub;
    document.getElementById('header-badges').innerHTML =
      badge(pub + ' publicados', '#10b981') + ' ' + badge(draft + ' rascunhos', '#64748b');
    document.getElementById('plugin-count').textContent = plugins.length + ' plugins no registry';

    const list = document.getElementById('plugin-list');
    if (!plugins.length) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">✦</div><div>Nenhum plugin ainda</div></div>';
      return;
    }
    list.innerHTML = plugins.map(p => {
      const ac = ACTION_COLOR[p.action] || '#00c2ff';
      return \`<div class="plugin-card \${p.published ? '' : 'draft'}">
        <div class="plugin-card-top">
          <div class="plugin-info">
            <div class="plugin-name">
              \${esc(p.name)}
              <span class="badge" style="color:\${ac};background:\${ac}20;border-color:\${ac}40">\${p.action}</span>
              \${p.price > 0 ? '<span class="badge" style="color:#f59e0b;background:#f59e0b20;border-color:#f59e0b40">R$ ' + p.price.toFixed(2) + '</span>' : ''}
              \${!p.published ? '<span class="badge" style="color:#64748b;background:#64748b15;border-color:#64748b30">RASCUNHO</span>' : ''}
            </div>
            <div class="plugin-ext">\${(p.extensions||[]).map(e => '<span class="tag">.' + esc(e) + '</span>').join('')}</div>
            \${p.description ? '<div class="plugin-desc">' + esc(p.description) + '</div>' : ''}
            <div class="plugin-id">id: \${esc(p.id)}</div>
          </div>
          <div class="plugin-actions">
            <button class="btn btn-edit" onclick="editPlugin('\${p.id}')">Editar</button>
            <button class="btn \${p.published ? 'btn-unpub' : 'btn-pub'}" onclick="togglePublish('\${p.id}')">
              \${p.published ? 'Despublicar' : 'Publicar'}
            </button>
            <button class="btn btn-del" onclick="startDelete('\${p.id}')">Deletar</button>
          </div>
        </div>
      </div>\`;
    }).join('');
  }

  function renderAPI() {
    const pub = plugins.filter(p => p.published);
    document.getElementById('cap-code').textContent = JSON.stringify(
      pub.map(p => ({ pluginId: p.id, extensions: p.extensions, action: p.action })), null, 2
    );
    document.getElementById('plug-code').textContent = JSON.stringify(
      pub.map(p => ({ id: p.id, name: p.name, description: p.description, price: p.price })), null, 2
    );
  }

  function renderExport() {
    document.getElementById('export-code').textContent =
      'let plugins = ' + JSON.stringify(plugins.map(p => ({
        id: p.id, name: p.name, extensions: p.extensions,
        action: p.action, price: p.price, description: p.description, published: p.published
      })), null, 2) + ';';
  }

  function showTab(name) {
    ['plugins','form','api','export'].forEach(t => {
      document.getElementById('tab-' + t).style.display = t === name ? '' : 'none';
    });
    document.querySelectorAll('.tab').forEach((el, i) => {
      el.classList.toggle('active', ['plugins','form','api','export'][i] === name);
    });
    currentTab = name;
    if (name === 'form' && !document.getElementById('edit-id').value) resetForm();
  }

  function resetForm() {
    document.getElementById('edit-id').value      = '';
    document.getElementById('f-id').value         = '';
    document.getElementById('f-name').value       = '';
    document.getElementById('f-ext').value        = '';
    document.getElementById('f-action').value     = 'RUN';
    document.getElementById('f-price').value      = '0';
    document.getElementById('f-desc').value       = '';
    document.getElementById('f-icon').value       = '';
    document.getElementById('f-color').value      = '#FF6A00';
    document.getElementById('f-type').value       = 'TOOL';
    document.getElementById('f-rating').value     = '0';
    document.getElementById('f-reviews').value    = '0';
    document.getElementById('f-official').checked = false;
    document.getElementById('f-featured').checked = false;
    document.getElementById('f-version').value    = '1.0.0';
    document.getElementById('f-author').value     = 'AstroCode Official';
    document.getElementById('form-title').textContent = 'Novo Plugin';
    setPub(false);
  }

  function editPlugin(id) {
    const p = plugins.find(x => x.id === id);
    if (!p) return;
    document.getElementById('edit-id').value    = p.id;
    document.getElementById('f-id').value       = p.id;
    document.getElementById('f-name').value     = p.name;
    document.getElementById('f-ext').value      = (p.extensions || []).join(', ');
    document.getElementById('f-action').value   = p.action;
    document.getElementById('f-price').value    = p.price;
    document.getElementById('f-desc').value     = p.description || '';
    document.getElementById('f-icon').value     = p.iconEmoji    || '';
    document.getElementById('f-color').value    = p.iconColorHex || '#FF6A00';
    document.getElementById('f-type').value     = p.type         || 'TOOL';
    document.getElementById('f-rating').value   = p.rating       || 0;
    document.getElementById('f-reviews').value  = p.reviewCount  || 0;
    document.getElementById('f-official').checked = p.official   || false;
    document.getElementById('f-featured').checked = p.featured   || false;
    document.getElementById('f-version').value  = p.version      || '1.0.0';
    document.getElementById('f-author').value   = p.author       || 'AstroCode Official';
    document.getElementById('form-title').textContent = 'Editar Plugin';
    setPub(p.published);
    showTab('form');
  }

  async function submitForm() {
    const editId = document.getElementById('edit-id').value;
    const id = document.getElementById('f-id').value.trim().toLowerCase().replace(/\s+/g,'-');
    const name = document.getElementById('f-name').value.trim();
    if (!id || !name) { toast('Preencha ID e Nome', '#ef4444'); return; }
    const plugin = {
      id, name,
      extensions: document.getElementById('f-ext').value.split(',').map(e => e.trim()).filter(Boolean),
      action: document.getElementById('f-action').value,
      price: parseFloat(document.getElementById('f-price').value) || 0,
      description: document.getElementById('f-desc').value.trim(),
      published: pubState,
      iconEmoji   : document.getElementById('f-icon').value.trim()     || "⬡",
      iconColorHex: document.getElementById('f-color').value.trim()    || "#FF6A00",
      type        : document.getElementById('f-type').value            || "TOOL",
      rating      : parseFloat(document.getElementById('f-rating').value) || 0,
      reviewCount : parseInt(document.getElementById('f-reviews').value)  || 0,
      official    : document.getElementById('f-official').checked,
      featured    : document.getElementById('f-featured').checked,
      version     : document.getElementById('f-version').value.trim()  || "1.0.0",
      author      : document.getElementById('f-author').value.trim()   || "AstroCode Official",
    };
    if (editId) {
      await api('PUT', '/plugins/' + editId, plugin);
      toast('Plugin atualizado ✓');
    } else {
      const r = await api('POST', '/plugins', plugin);
      if (r.error) { toast(r.error, '#ef4444'); return; }
      toast('Plugin criado ✓');
    }
    await loadPlugins();
    showTab('plugins');
  }

  async function togglePublish(id) {
    const p = plugins.find(x => x.id === id);
    await api('PUT', '/plugins/' + id, { ...p, published: !p.published });
    await loadPlugins();
    toast(p.published ? 'Despublicado' : 'Publicado ✓', p.published ? '#8b5cf6' : '#10b981');
  }

  function startDelete(id) {
    deleteTargetId = id;
    document.getElementById('del-modal').style.display = 'flex';
  }

  async function confirmDelete() {
    await api('DELETE', '/plugins/' + deleteTargetId);
    closeModal();
    await loadPlugins();
    toast('Plugin deletado');
  }

  function closeModal() {
    document.getElementById('del-modal').style.display = 'none';
    deleteTargetId = null;
  }

  function setPub(val) {
    pubState = val;
    const t = document.getElementById('pub-toggle');
    const k = document.getElementById('pub-knob');
    const l = document.getElementById('pub-label');
    t.style.background = val ? '#10b981' : '#1e2d45';
    k.style.left = val ? '23px' : '3px';
    l.textContent = val ? 'Publicar imediatamente' : 'Salvar como rascunho';
    l.style.color = val ? '#10b981' : '#64748b';
  }

  function togglePub() { setPub(!pubState); }

  function copyCode(id) {
    const text = document.getElementById(id).textContent;
    navigator.clipboard.writeText(text).then(() => toast('Copiado ✓'));
  }

  function toast(msg, color = '#10b981') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = color;
    el.style.background = color + '22';
    el.style.borderColor = color + '60';
    setTimeout(() => { el.style.display = 'none'; }, 2200);
  }

  function badge(text, color) {
    return \`<span class="badge" style="color:\${color};background:\${color}20;border-color:\${color}40">\${text}</span>\`;
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  loadPlugins();
</script>
</body>
</html>`);
});

// ───────────── START ─────────────

app.listen(PORT, () => {
  console.log("==============================");
  console.log("  AstroCode API rodando!");
  console.log("  Porta: " + PORT);
  console.log("  Admin: /admin");
  console.log("==============================");
});

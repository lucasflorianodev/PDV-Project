/* ═══════════════════════════════════════════
   app.js  –  Lógica da aplicação Café Aroma
   Depende de: data.js (tables, catalog)
   ═══════════════════════════════════════════ */

/* ── ESTADO GLOBAL ── */
let selectedTable = tables.find(t => t.num === 8); // mesa padrão ao abrir

/* ════════════════════════════════════════════
   RENDERIZAR GRID DE MESAS
   Lê os filtros, percorre `tables` e gera os
   elementos no #tableGrid
════════════════════════════════════════════ */
function renderTables() {
  const grid    = document.getElementById('tableGrid');
  const fMesas  = document.getElementById('filterMesas').value;
  const fAtt    = document.getElementById('filterAtendente').value;

  grid.innerHTML = '';

  tables.forEach(t => {
    // Aplica filtro de status
    if (fMesas === 'Ocupadas' && t.status === 'free') return;
    if (fMesas === 'Livres'   && t.status !== 'free') return;

    // Aplica filtro de atendente
    if (fAtt !== 'Todos os Atendentes' && t.attendant !== fAtt) return;

    const el = document.createElement('div');
    el.className = 'table-item' + (selectedTable?.num === t.num ? ' selected' : '');
    el.innerHTML = `
      <div class="table-icon ${t.status}">${t.num}</div>
      <div class="table-num">Mesa ${t.num}</div>
    `;
    el.onclick = () => selectTable(t);
    grid.appendChild(el);
  });
}

/* ════════════════════════════════════════════
   SELECIONAR MESA
   Atualiza o estado e re-renderiza os painéis
════════════════════════════════════════════ */
function selectTable(t) {
  selectedTable = t;
  renderTables();   // redesenha o grid (aplica .selected)
  renderOrder();    // atualiza lista de pedidos + total
  updateHeader();   // atualiza cabeçalho (cliente, atendente, mesa)
}

/* ════════════════════════════════════════════
   ATUALIZAR CABEÇALHO
   Preenche os campos do painel direito com os
   dados da mesa selecionada
════════════════════════════════════════════ */
function updateHeader() {
  if (!selectedTable) return;
  const t = selectedTable;

  document.getElementById('metaMesa').textContent      = String(t.num).padStart(2, '0');
  document.getElementById('metaPessoas').textContent   = t.persons || '—';
  document.getElementById('metaCliente').textContent   = t.client  || '—';
  document.getElementById('attendantName').textContent = t.attendant;
  document.getElementById('avatarText').textContent    = t.attendant.charAt(0);
  document.getElementById('modalMesa').textContent     = String(t.num).padStart(2, '0');

  // Limpa observação se a mesa estiver vazia
  if (t.persons === 0) {
    document.getElementById('obsInput').value = '';
  }
}

/* ════════════════════════════════════════════
   RENDERIZAR LISTA DE PEDIDOS
   Percorre os pedidos da mesa selecionada,
   monta as linhas e calcula o total
════════════════════════════════════════════ */
function renderOrder() {
  const list   = document.getElementById('orderList');
  const orders = selectedTable?.orders || [];
  let subtotal = 0;

  list.innerHTML = '';

  if (orders.length === 0) {
    list.innerHTML = `
      <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13px;">
        Nenhum item adicionado.
      </div>`;
  } else {
    orders.forEach(o => {
      subtotal += o.qty * o.price;

      const row = document.createElement('div');
      row.className = 'order-row';
      row.innerHTML = `
        <div class="order-qty">${o.qty}</div>
        <div class="order-name">${o.name}</div>
        <div class="order-price">${fmt(o.qty * o.price)}</div>
      `;
      list.appendChild(row);
    });
  }

  document.getElementById('subtotal').textContent = fmt(subtotal);
  document.getElementById('total').textContent    = fmt(subtotal);
}

/* ════════════════════════════════════════════
   UTILITÁRIO: Formatar moeda brasileira
════════════════════════════════════════════ */
function fmt(n) {
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}

/* ════════════════════════════════════════════
   MODAL: PRODUTOS
   Gera dinamicamente os itens do catálogo
════════════════════════════════════════════ */
function openProductsModal() {
  const list = document.getElementById('productsList');
  list.innerHTML = '';

  catalog.forEach(p => {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: white;
      border-radius: 8px;
      border: 1.5px solid var(--border);
    `;
    row.innerHTML = `
      <span style="font-size:13.5px; font-weight:500">${p.name}</span>
      <div style="display:flex; align-items:center; gap:10px">
        <span style="font-size:13px; color:var(--text-muted)">${fmt(p.price)}</span>
        <button
          onclick="addItem('${p.name}', ${p.price})"
          style="background:var(--brown-dark); color:#f5dfc0; border:none; border-radius:6px;
                 padding:5px 12px; font-size:12px; font-weight:600; cursor:pointer">
          + Add
        </button>
      </div>
    `;
    list.appendChild(row);
  });

  document.getElementById('productsModal').classList.add('open');
}

/* ── Adicionar item ao pedido da mesa ── */
function addItem(name, price) {
  if (!selectedTable) return;

  const existing = selectedTable.orders.find(o => o.name === name);
  if (existing) {
    existing.qty++;                                   // incrementa se já existe
  } else {
    selectedTable.orders.push({ qty:1, name, price }); // adiciona novo
  }

  // Se a mesa estava vazia, muda para 'partial'
  if (selectedTable.status === 'free') {
    selectedTable.status  = 'partial';
    selectedTable.persons = 1;
  }

  renderOrder();
  renderTables();
  showToast(`${name} adicionado ✓`);
}

/* ════════════════════════════════════════════
   MODAL: FUNÇÕES
════════════════════════════════════════════ */
function openFuncoesModal() {
  document.getElementById('funcoesModal').classList.add('open');
}

/* ── Fechar qualquer modal pelo ID ── */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/* ── Fechar modal ao clicar no overlay ── */
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('open');
  });
});

/* ════════════════════════════════════════════
   TOAST (notificação temporária)
════════════════════════════════════════════ */
let toastTimer;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ════════════════════════════════════════════
   FILTROS
════════════════════════════════════════════ */
document.getElementById('filterMesas').addEventListener('change', renderTables);
document.getElementById('filterAtendente').addEventListener('change', renderTables);

/* ════════════════════════════════════════════
   INICIALIZAÇÃO
════════════════════════════════════════════ */
renderTables();
renderOrder();
updateHeader();
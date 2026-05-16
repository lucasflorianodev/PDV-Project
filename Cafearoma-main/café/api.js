/* ═══════════════════════════════════════════
   data.js  –  Dados estáticos do sistema
   Contém: array de mesas e catálogo de produtos
   ═══════════════════════════════════════════ */

/* ── MESAS ──────────────────────────────────
   Cada objeto representa uma mesa com:
     num       → número da mesa
     status    → 'free' | 'busy' | 'partial'
     attendant → atendente responsável
     client    → nome do cliente (vazio se livre)
     persons   → quantidade de pessoas
     orders    → lista de pedidos [ {qty, name, price} ]
─────────────────────────────────────────── */
const tables = [
  { num:1,  status:'free',    attendant:'Carlos M.', client:'',           persons:0, orders:[] },
  { num:2,  status:'free',    attendant:'Carlos M.', client:'',           persons:0, orders:[] },
  { num:3,  status:'free',    attendant:'Ana P.',    client:'',           persons:0, orders:[] },
  {
    num:4, status:'busy', attendant:'Ana P.', client:'João Silva', persons:3,
    orders:[
      { qty:1, name:'Espresso Duplo G',    price:12 },
      { qty:2, name:'Pão de Queijo',       price:8  },
      { qty:1, name:'Suco de Laranja',     price:9  },
    ]
  },
  {
    num:5, status:'busy', attendant:'Ana P.', client:'Maria Lopes', persons:4,
    orders:[
      { qty:2, name:'Cappuccino G',        price:14 },
      { qty:3, name:'Croissant Presunto',  price:11 },
    ]
  },
  { num:6,  status:'free',    attendant:'Carlos M.', client:'',           persons:0, orders:[] },
  { num:7,  status:'free',    attendant:'Ana P.',    client:'',           persons:0, orders:[] },
  {
    num:8, status:'busy', attendant:'Ana P.', client:'Clara Reis', persons:2,
    orders:[
      { qty:1, name:'Latte Aveia G',       price:15 },
      { qty:1, name:'Cappuccino G',        price:14 },
      { qty:1, name:'Croissant Chocolate', price:11 },
      { qty:2, name:'Muffins de Mirtilo',  price:9  },
    ]
  },
  { num:9,  status:'free',    attendant:'Carlos M.', client:'',           persons:0, orders:[] },
  {
    num:10, status:'partial', attendant:'Carlos M.', client:'Pedro Boa', persons:2,
    orders:[
      { qty:1, name:'Café Preto',          price:7  },
      { qty:1, name:'Torrada Amanteigada', price:6  },
    ]
  },
  { num:11, status:'free',    attendant:'Ana P.',    client:'',           persons:0, orders:[] },
  { num:12, status:'free',    attendant:'Carlos M.', client:'',           persons:0, orders:[] },
  { num:13, status:'free',    attendant:'Ana P.',    client:'',           persons:0, orders:[] },
  { num:14, status:'free',    attendant:'Carlos M.', client:'',           persons:0, orders:[] },
  { num:15, status:'free',    attendant:'Ana P.',    client:'',           persons:0, orders:[] },
  {
    num:16, status:'busy', attendant:'Carlos M.', client:'Fernanda S.', persons:5,
    orders:[
      { qty:3, name:'Frappuccino Caramelo', price:16 },
      { qty:5, name:'Brownie Avelã',        price:10 },
      { qty:2, name:'Suco de Maçã',         price:8  },
    ]
  },
  { num:17, status:'free',    attendant:'Ana P.',    client:'',           persons:0, orders:[] },
  {
    num:18, status:'partial', attendant:'Carlos M.', client:'Rafael M.', persons:1,
    orders:[
      { qty:1, name:'Mocha G',             price:14 },
    ]
  },
  {
    num:19, status:'busy', attendant:'Ana P.', client:'Lívia Costa', persons:3,
    orders:[
      { qty:3, name:'Latte G',             price:13 },
      { qty:3, name:'Sanduíche Natural',   price:14 },
    ]
  },
  { num:20, status:'free',    attendant:'Carlos M.', client:'',           persons:0, orders:[] },
];

/* ── CATÁLOGO DE PRODUTOS ────────────────────
   Usado no modal "Adicionar Produto"
─────────────────────────────────────────── */
const catalog = [
  { name:'Espresso G',           price:10 },
  { name:'Cappuccino G',         price:14 },
  { name:'Latte Aveia G',        price:15 },
  { name:'Mocha G',              price:14 },
  { name:'Frappuccino Caramelo', price:16 },
  { name:'Croissant Chocolate',  price:11 },
  { name:'Muffin Mirtilo',       price:9  },
  { name:'Pão de Queijo (2un)',  price:8  },
  { name:'Brownie Avelã',        price:10 },
  { name:'Torrada Amanteigada',  price:6  },
];
const mongoose = require('mongoose');

// Schema de Cliente
const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  empresa: {
    type: String,
    default: null
  },
  telefone: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  endereco: {
    type: String,
    default: null
  },
  data_cadastro: {
    type: Date,
    default: Date.now
  }
});

// Schema de Pedido
const pedidoSchema = new mongoose.Schema({
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  cor: {
    type: String,
    default: null
  },
  tecido: {
    type: String,
    default: null
  },
  tamanho: {
    type: String,
    default: null
  },
  observacao: {
    type: String,
    default: null
  },
  entregue: {
    type: Boolean,
    default: false
  },
  cortado: {
    type: Boolean,
    default: false
  },
  silkado: {
    type: Boolean,
    default: false
  },
  bordado: {
    type: Boolean,
    default: false
  },
  data_entrega: {
    type: Date,
    default: null
  },
  data_cadastro: {
    type: Date,
    default: Date.now
  }
});

const Cliente = mongoose.model('Cliente', clienteSchema);
const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = { Cliente, Pedido };

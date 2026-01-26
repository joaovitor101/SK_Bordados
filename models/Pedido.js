import mongoose from 'mongoose';

const PedidoSchema = new mongoose.Schema(
  {
    cliente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true
    },
    descricao: { type: String, required: true },
    cor: String,
    tecido: String,
    tamanho: String,
    observacao: String,
    cortado: { type: Boolean, default: false },
    silkado: { type: Boolean, default: false },
    bordado: { type: Boolean, default: false },
    entregue: { type: Boolean, default: false },
    data_entrega: Date
  },
  { timestamps: true }
);

export default mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema);

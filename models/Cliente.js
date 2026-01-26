import mongoose from 'mongoose';

const ClienteSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    empresa: String,
    telefone: String,
    email: String,
    endereco: String
  },
  { timestamps: true }
);

export default mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema);

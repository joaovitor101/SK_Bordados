import connectDB from '@/lib/mongodb';
import Cliente from '@/models/Cliente';
import Pedido from '@/models/Pedido';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Cliente inválido' },
        { status: 400 }
      );
    }

    const pedidosDoCliente = await Pedido.countDocuments({
      cliente_id: new mongoose.Types.ObjectId(id),
    });

    if (pedidosDoCliente > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um cliente que possui pedidos cadastrados.' },
        { status: 400 }
      );
    }

    await Cliente.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar cliente' },
      { status: 500 }
    );
  }
}


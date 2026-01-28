import connectDB from '@/lib/mongodb';
import Cliente from '@/models/Cliente';
import Pedido from '@/models/Pedido';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Cliente inválido' },
        { status: 400 }
      );
    }

    const data = await request.json();

    const atualizado = await Cliente.findByIdAndUpdate(
      id,
      {
        nome: data.nome,
        empresa: data.empresa || null,
        telefone: data.telefone || null,
        email: data.email || null,
        endereco: data.endereco || null,
      },
      { new: true }
    );

    if (!atualizado) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: atualizado._id.toString(),
      ...atualizado.toObject(),
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
}

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


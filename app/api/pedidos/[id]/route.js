import connectDB from '@/lib/mongodb';
import Pedido from '@/models/Pedido';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const id = params.id;
    const status = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Pedido inválido' },
        { status: 400 }
      );
    }
    
    const updateData = {
      cortado: status.cortado || false,
      silkado: status.silkado || false,
      bordado: status.bordado || false,
      entregue: status.entregue || false
    };
    
    if (status.data_entrega) {
      updateData.data_entrega = new Date(status.data_entrega);
    } else {
      updateData.data_entrega = null;
    }

    // Permitir editar/adicionar observação no mesmo modal
    if (typeof status.observacao === 'string') {
      const obs = status.observacao.trim();
      updateData.observacao = obs ? obs : null;
    } else if (status.observacao === null) {
      updateData.observacao = null;
    }
    
    await Pedido.findByIdAndUpdate(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
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
        { error: 'Pedido inválido' },
        { status: 400 }
      );
    }
    
    await Pedido.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar pedido' },
      { status: 500 }
    );
  }
}

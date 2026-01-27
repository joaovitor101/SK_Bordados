import connectDB from '@/lib/mongodb';
import Pedido from '@/models/Pedido';
import Cliente from '@/models/Cliente'; // garante registro do schema Cliente para o populate
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    
    const pedidos = await Pedido.find()
      .populate('cliente_id', 'nome empresa')
      .sort({ createdAt: -1 })
      .lean();
    
    const pedidosFormatados = pedidos.map(p => ({
      id: p._id.toString(),
      cliente_id: p.cliente_id?._id?.toString() || '',
      cliente_nome: p.cliente_id?.nome || '',
      cliente_empresa: p.cliente_id?.empresa || '',
      descricao: p.descricao,
      cor: p.cor || null,
      tecido: p.tecido || null,
      tamanho: p.tamanho || null,
      observacao: p.observacao || null,
      cortado: p.cortado ? 1 : 0,
      silkado: p.silkado ? 1 : 0,
      bordado: p.bordado ? 1 : 0,
      entregue: p.entregue ? 1 : 0,
      data_entrega: p.data_entrega ? p.data_entrega.toISOString().split('T')[0] : null,
      data_cadastro: p.createdAt
    }));
    
    return NextResponse.json(pedidosFormatados);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(data.cliente_id)) {
      return NextResponse.json(
        { error: 'Cliente inválido' },
        { status: 400 }
      );
    }
    
    const pedido = await Pedido.create({
      cliente_id: new mongoose.Types.ObjectId(data.cliente_id),
      descricao: data.descricao,
      cor: data.cor || null,
      tecido: data.tecido || null,
      tamanho: data.tamanho || null,
      observacao: data.observacao || null
    });
    
    return NextResponse.json({
      id: pedido._id.toString(),
      ...pedido.toObject()
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    );
  }
}

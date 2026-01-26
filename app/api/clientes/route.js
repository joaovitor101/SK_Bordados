import connectDB from '@/lib/mongodb';
import Cliente from '@/models/Cliente';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const clientes = await Cliente.find().sort({ nome: 1 }).lean();
    
    const clientesComId = clientes.map(c => ({
      id: c._id.toString(),
      nome: c.nome,
      empresa: c.empresa || null,
      telefone: c.telefone || null,
      email: c.email || null,
      endereco: c.endereco || null
    }));
    
    return NextResponse.json(clientesComId);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    const cliente = await Cliente.create({
      nome: data.nome,
      empresa: data.empresa || null,
      telefone: data.telefone || null,
      email: data.email || null,
      endereco: data.endereco || null
    });
    
    return NextResponse.json({
      id: cliente._id.toString(),
      ...cliente.toObject()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

let mainWindow;

/* ================= MONGODB ================= */
async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB Atlas');
    return true;
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err);
    return false;
  }
}

function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Banco de dados não conectado');
  }
}

/* ================= SCHEMAS ================= */
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

const Cliente = mongoose.model('Cliente', ClienteSchema);
const Pedido = mongoose.model('Pedido', PedidoSchema);

/* ================= HELPERS ================= */
function mapId(doc) {
  return {
    id: doc._id.toString(),
    ...doc
  };
}

/* ================= IPC ================= */
function registerIpcHandlers() {

  /* ===== CLIENTES ===== */
  ipcMain.handle('get-clientes', async () => {
    ensureDbConnected();
    const clientes = await Cliente.find().lean();
    return clientes.map(c => ({
      id: c._id.toString(),
      ...c
    }));
  });

  ipcMain.handle('create-cliente', async (_, data) => {
    ensureDbConnected();
    const cliente = await Cliente.create(data);
    return {
      id: cliente._id.toString(),
      ...cliente.toObject()
    };
  });

  /* ===== PEDIDOS ===== */
  ipcMain.handle('get-pedidos', async () => {
    ensureDbConnected();

    const pedidos = await Pedido.find()
      .populate('cliente_id', 'nome empresa')
      .sort({ createdAt: -1 })
      .lean();

    return pedidos.map(p => ({
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
  });

  ipcMain.handle('create-pedido', async (_, data) => {
    ensureDbConnected();

    if (!mongoose.Types.ObjectId.isValid(data.cliente_id)) {
      throw new Error('Cliente inválido');
    }

    const pedido = await Pedido.create({
      ...data,
      cliente_id: new mongoose.Types.ObjectId(data.cliente_id)
    });

    return {
      id: pedido._id.toString(),
      ...pedido.toObject()
    };
  });

  ipcMain.handle('update-pedido-status', async (_, id, status) => {
    ensureDbConnected();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Pedido inválido');
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

    await Pedido.findByIdAndUpdate(id, updateData);
    return { success: true };
  });

  ipcMain.handle('delete-pedido', async (_, id) => {
    ensureDbConnected();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Pedido inválido');
    }

    await Pedido.findByIdAndDelete(id);
    return true;
  });
}

/* ================= WINDOW ================= */
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  await mainWindow.loadFile('index.html');
  
  // Abrir DevTools em desenvolvimento
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

/* ================= APP ================= */
app.whenReady().then(async () => {
  const connected = await connectMongo();

  await createWindow();
  registerIpcHandlers();

  if (connected) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('db-ready');
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

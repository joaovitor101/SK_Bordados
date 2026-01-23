const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // eventos
  onDbReady: (callback) => ipcRenderer.on('db-ready', callback),

  // clientes
  getClientes: () => ipcRenderer.invoke('get-clientes'),
  createCliente: (data) => ipcRenderer.invoke('create-cliente', data),

  // pedidos
  getPedidos: () => ipcRenderer.invoke('get-pedidos'),
  createPedido: (data) => ipcRenderer.invoke('create-pedido', data),
  updatePedidoStatus: (id, status) =>
    ipcRenderer.invoke('update-pedido-status', id, status),
  deletePedido: (id) => ipcRenderer.invoke('delete-pedido', id)
});

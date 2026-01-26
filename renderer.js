// Navegação entre páginas
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    showPage(page);
    
    // Atualizar botões ativos
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function showPage(pageName) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    
    // Carregar dados quando a página for exibida
    if (pageName === 'pedidos') {
      loadPedidos();
    } else if (pageName === 'clientes') {
      loadClientes();
    } else if (pageName === 'novo-pedido') {
      loadClientesSelect();
    }
  }
}

// ========== CLIENTES ==========

let clientes = [];

async function loadClientes() {
  try {
    clientes = await window.electronAPI.getClientes();
    renderClientes();
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    alert('Erro ao carregar clientes');
  }
}

async function loadClientesSelect() {
  try {
    clientes = await window.electronAPI.getClientes();
    const select = document.getElementById('cliente-select');
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.id;
      option.textContent = `${cliente.nome}${cliente.empresa ? ' - ' + cliente.empresa : ''}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  }
}

function renderClientes() {
  const tbody = document.getElementById('clientes-tbody');
  tbody.innerHTML = '';
  
  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum cliente cadastrado</td></tr>';
    return;
  }
  
  clientes.forEach(cliente => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.empresa || '-'}</td>
      <td>${cliente.telefone || '-'}</td>
      <td>${cliente.email || '-'}</td>
      <td>
        <button class="btn-edit" onclick="editCliente('${cliente.id}')">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Modal de Cliente
const clienteModal = document.getElementById('cliente-modal');
const clienteForm = document.getElementById('cliente-form');
const btnAdicionarCliente = document.getElementById('btn-adicionar-cliente');
const btnNovoCliente = document.getElementById('btn-novo-cliente');

btnAdicionarCliente.addEventListener('click', () => {
  openClienteModal();
});

btnNovoCliente.addEventListener('click', () => {
  openClienteModal();
  // Após fechar o modal, voltar para a página de novo pedido
  const closeBtn = clienteModal.querySelector('.close');
  const originalClose = closeBtn.onclick;
  closeBtn.onclick = () => {
    closeClienteModal();
    showPage('novo-pedido');
    loadClientesSelect();
  };
});

document.querySelectorAll('#cliente-modal .close, #btn-cancelar-cliente').forEach(btn => {
  btn.addEventListener('click', closeClienteModal);
});

function openClienteModal(cliente = null) {
  document.getElementById('modal-title').textContent = cliente ? 'Editar Cliente' : 'Novo Cliente';
  clienteForm.reset();
  
  if (cliente) {
    document.getElementById('cliente-id').value = cliente.id;
    document.getElementById('cliente-nome').value = cliente.nome;
    document.getElementById('cliente-empresa').value = cliente.empresa || '';
    document.getElementById('cliente-telefone').value = cliente.telefone || '';
    document.getElementById('cliente-email').value = cliente.email || '';
    document.getElementById('cliente-endereco').value = cliente.endereco || '';
  }
  
  clienteModal.classList.add('active');
}

function closeClienteModal() {
  clienteModal.classList.remove('active');
  clienteForm.reset();
}

window.editCliente = async function(id) {
  const cliente = clientes.find(c => c.id === id || c.id.toString() === id.toString());
  if (cliente) {
    openClienteModal(cliente);
  }
};

clienteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const cliente = {
    nome: document.getElementById('cliente-nome').value,
    empresa: document.getElementById('cliente-empresa').value,
    telefone: document.getElementById('cliente-telefone').value,
    email: document.getElementById('cliente-email').value,
    endereco: document.getElementById('cliente-endereco').value
  };
  
  try {
    await window.electronAPI.createCliente(cliente);
    closeClienteModal();
    loadClientes();
    loadClientesSelect();
    alert('Cliente salvo com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    alert('Erro ao salvar cliente');
  }
});

// ========== PEDIDOS ==========

let pedidos = [];

async function loadPedidos() {
  try {
    pedidos = await window.electronAPI.getPedidos();
    renderPedidos();
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    alert('Erro ao carregar pedidos');
  }
}

function renderPedidos() {
  const tbody = document.getElementById('pedidos-tbody');
  tbody.innerHTML = '';
  
  if (pedidos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align: center;">Nenhum pedido cadastrado</td></tr>';
    return;
  }
  
  pedidos.forEach(pedido => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pedido.cliente_nome}</td>
      <td>${pedido.cliente_empresa || '-'}</td>
      <td>${pedido.descricao}</td>
      <td>${pedido.cor || '-'}</td>
      <td>${pedido.tecido || '-'}</td>
      <td>${pedido.tamanho || '-'}</td>
      <td>${pedido.observacao || '-'}</td>
      <td><span class="status-badge ${pedido.cortado ? 'yes' : 'no'}">${pedido.cortado ? 'Sim' : 'Não'}</span></td>
      <td><span class="status-badge ${pedido.silkado ? 'yes' : 'no'}">${pedido.silkado ? 'Sim' : 'Não'}</span></td>
      <td><span class="status-badge ${pedido.bordado ? 'yes' : 'no'}">${pedido.bordado ? 'Sim' : 'Não'}</span></td>
      <td><span class="status-badge ${pedido.entregue ? 'yes' : 'no'}">${pedido.entregue ? 'Sim' : 'Não'}</span></td>
      <td>${pedido.data_entrega ? new Date(pedido.data_entrega).toLocaleDateString('pt-BR') : '-'}</td>
      <td>
        <button class="btn-edit" onclick="editPedidoStatus('${pedido.id}')">Editar Status</button>
        <button class="btn-danger" onclick="deletePedido('${pedido.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Busca de pedidos
document.getElementById('search-pedidos').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#pedidos-tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
});

// Formulário de Pedido
const pedidoForm = document.getElementById('pedido-form');

pedidoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const pedido = {
    cliente_id: document.getElementById('cliente-select').value,
    descricao: document.getElementById('descricao').value,
    cor: document.getElementById('cor').value,
    tecido: document.getElementById('tecido').value,
    tamanho: document.getElementById('tamanho').value,
    observacao: document.getElementById('observacao').value
  };
  
  try {
    await window.electronAPI.createPedido(pedido);
    pedidoForm.reset();
    alert('Pedido criado com sucesso!');
    showPage('pedidos');
    loadPedidos();
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    alert('Erro ao criar pedido');
  }
});

document.getElementById('btn-cancelar-pedido').addEventListener('click', () => {
  pedidoForm.reset();
  showPage('pedidos');
});

// Modal de Status do Pedido
const statusModal = document.getElementById('status-modal');
const statusForm = document.getElementById('status-form');

document.querySelectorAll('#status-modal .close, #btn-cancelar-status').forEach(btn => {
  btn.addEventListener('click', () => {
    statusModal.classList.remove('active');
    statusForm.reset();
  });
});

window.editPedidoStatus = async function(id) {
  const pedido = pedidos.find(p => p.id === id || p.id.toString() === id.toString());
  if (!pedido) return;
  
  document.getElementById('pedido-id-status').value = pedido.id;
  document.getElementById('status-cortado').checked = pedido.cortado === 1;
  document.getElementById('status-silkado').checked = pedido.silkado === 1;
  document.getElementById('status-bordado').checked = pedido.bordado === 1;
  document.getElementById('status-entregue').checked = pedido.entregue === 1;
  document.getElementById('status-data-entrega').value = pedido.data_entrega ? pedido.data_entrega.split('T')[0] : '';
  
  statusModal.classList.add('active');
};

statusForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('pedido-id-status').value;
  const status = {
    cortado: document.getElementById('status-cortado').checked,
    silkado: document.getElementById('status-silkado').checked,
    bordado: document.getElementById('status-bordado').checked,
    entregue: document.getElementById('status-entregue').checked,
    data_entrega: document.getElementById('status-data-entrega').value
  };
  
  try {
    await window.electronAPI.updatePedidoStatus(id, status);
    statusModal.classList.remove('active');
    statusForm.reset();
    loadPedidos();
    alert('Status atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    alert('Erro ao atualizar status');
  }
});

window.deletePedido = async function(id) {
  if (!confirm('Tem certeza que deseja excluir este pedido?')) {
    return;
  }
  
  try {
    await window.electronAPI.deletePedido(id);
    loadPedidos();
    alert('Pedido excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    alert('Erro ao excluir pedido');
  }
};

// Fechar modais ao clicar fora
window.addEventListener('click', (e) => {
  if (e.target === clienteModal) {
    closeClienteModal();
  }
  if (e.target === statusModal) {
    statusModal.classList.remove('active');
  }
});
window.electronAPI.onDbReady(() => {
  console.log('Banco pronto, carregando dados iniciais');
  loadPedidos();
  loadClientes();
});

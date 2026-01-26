'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './globals.css';

export default function Home() {
  const router = useRouter();
  const [activePage, setActivePage] = useState('pedidos');
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [editingPedido, setEditingPedido] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTecido, setFiltroTecido] = useState('');
  const [filtroCor, setFiltroCor] = useState('');
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [graficoPeriodo, setGraficoPeriodo] = useState('mes'); // 'semana' ou 'mes'

  // Função para remover acentos e normalizar texto
  const removerAcentos = (str) => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  useEffect(() => {
    loadClientes();
    loadPedidos();
  }, []);

  // Obter valores únicos de tecidos e cores para sugestões
  const tecidosUnicos = [...new Set(pedidos.map(p => p.tecido).filter(Boolean))].sort();
  const coresUnicas = [...new Set(pedidos.map(p => p.cor).filter(Boolean))].sort();

  // Atalhos de teclado para agilidade
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + N = Novo Pedido
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setActivePage('novo-pedido');
      }
      // Ctrl/Cmd + P = Lista de Pedidos
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setActivePage('pedidos');
      }
      // Ctrl/Cmd + C = Clientes
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        setActivePage('clientes');
      }
      // Ctrl/Cmd + D = Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setActivePage('dashboard');
      }
      // F5 ou Ctrl+R = Atualizar lista (quando na página de pedidos)
      if (activePage === 'pedidos' && (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r'))) {
        e.preventDefault();
        loadPedidos();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activePage]);

  // Auto-refresh da lista de pedidos (a cada 5s)
  useEffect(() => {
    if (activePage !== 'pedidos') return;
    if (showClienteModal || showStatusModal) return;

    const tick = () => {
      // Evita gastar rede em aba escondida (e evita a sensação de "não atualiza")
      if (document.visibilityState === 'visible') {
        loadPedidos();
      }
    };

    const intervalId = window.setInterval(tick, 5000);
    return () => window.clearInterval(intervalId);
  }, [activePage, showClienteModal, showStatusModal]);

  // Atualizar quando voltar para a página de pedidos / quando a aba ganhar foco
  useEffect(() => {
    if (activePage !== 'pedidos') return;
    loadPedidos();

    const onFocus = () => loadPedidos();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadPedidos();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [activePage]);

  const loadClientes = async () => {
    try {
      const res = await fetch('/api/clientes', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      alert('Erro ao carregar clientes');
    }
  };

  const loadPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' });
      const data = await res.json();
  
      if (!Array.isArray(data)) {
        console.error('API /pedidos não retornou array:', data);
        setPedidos([]); // evita crash
        return;
      }
  
      setPedidos(data);
      setUltimaAtualizacao(new Date());
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setPedidos([]);
    }
  };
  

  const handleClienteSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cliente = {
      nome: formData.get('nome'),
      empresa: formData.get('empresa') || null,
      telefone: formData.get('telefone') || null,
      email: formData.get('email') || null,
      endereco: formData.get('endereco') || null
    };

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });
      if (res.ok) {
        setShowClienteModal(false);
        setEditingCliente(null);
        e.target.reset();
        await loadClientes();
        // Se estiver na página de novo pedido, manter o modal fechado
        // Os dados já foram atualizados
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  };

  const handlePedidoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      // Tentar encontrar cliente pelo texto digitado
      if (clienteSearchTerm && filteredClientes.length === 1) {
        setSelectedClienteId(filteredClientes[0].id);
      } else {
        alert('Selecione um cliente');
        return;
      }
    }
    
    const formData = new FormData(e.target);
    const pedido = {
      cliente_id: selectedClienteId,
      descricao: formData.get('descricao'),
      cor: formData.get('cor') || null,
      tecido: formData.get('tecido') || null,
      tamanho: formData.get('tamanho') || null,
      observacao: formData.get('observacao') || null
    };

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
      if (res.ok) {
        e.target.reset();
        setSelectedClienteId('');
        setClienteSearchTerm('');
        setActivePage('pedidos');
        loadPedidos();
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido');
    }
  };

  const filteredClientes = clientes.filter(cliente => {
    const search = removerAcentos(clienteSearchTerm);
    return (
      removerAcentos(cliente.nome)?.includes(search) ||
      removerAcentos(cliente.empresa)?.includes(search) ||
      removerAcentos(cliente.telefone)?.includes(search) ||
      removerAcentos(cliente.email)?.includes(search)
    );
  });

  const selectedCliente = clientes.find(c => c.id === selectedClienteId);

  // Funções para calcular estatísticas do dashboard
  const calcularEstatisticas = () => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);
    
    // Início da semana (segunda-feira)
    const inicioSemana = new Date(agora);
    const diaSemana = agora.getDay(); // 0 = domingo, 1 = segunda, etc.
    const diasParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1; // Se domingo, volta 6 dias
    inicioSemana.setDate(agora.getDate() - diasParaSegunda);
    inicioSemana.setHours(0, 0, 0, 0);

    const pedidosEntregues = pedidos.filter(p => p.entregue === 1);

    const pedidosMes = pedidosEntregues.filter(p => {
      if (!p.data_entrega) return false;
      const dataEntrega = new Date(p.data_entrega);
      return dataEntrega >= inicioMes;
    });

    const pedidosSemana = pedidosEntregues.filter(p => {
      if (!p.data_entrega) return false;
      const dataEntrega = new Date(p.data_entrega);
      return dataEntrega >= inicioSemana;
    });

    const totalPedidos = pedidos.length;
    const pedidosPendentes = pedidos.filter(p => p.entregue !== 1).length;

    return {
      pedidosMes: pedidosMes.length,
      pedidosSemana: pedidosSemana.length,
      totalPedidos,
      pedidosPendentes,
      pedidosEntregues: pedidosEntregues.length
    };
  };

  const stats = calcularEstatisticas();

  // Função para calcular dados do gráfico
  const calcularDadosGrafico = (periodo) => {
    const pedidosEntregues = pedidos.filter(p => p.entregue === 1 && p.data_entrega);
    
    if (periodo === 'semana') {
      // Últimas 4 semanas
      const semanas = [];
      const agora = new Date();
      agora.setHours(0, 0, 0, 0);
      
      for (let i = 3; i >= 0; i--) {
        const dataRef = new Date(agora);
        dataRef.setDate(agora.getDate() - (i * 7));
        
        // Calcular início da semana (segunda-feira)
        const diaSemana = dataRef.getDay();
        const diasParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
        const inicioSemana = new Date(dataRef);
        inicioSemana.setDate(dataRef.getDate() - diasParaSegunda);
        inicioSemana.setHours(0, 0, 0, 0);
        
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        fimSemana.setHours(23, 59, 59, 999);
        
        const pedidosSemana = pedidosEntregues.filter(p => {
          const dataEntrega = new Date(p.data_entrega);
          return dataEntrega >= inicioSemana && dataEntrega <= fimSemana;
        });
        
        const diaInicio = inicioSemana.getDate();
        const mesInicio = inicioSemana.toLocaleDateString('pt-BR', { month: 'short' });
        semanas.push({
          label: `${diaInicio} ${mesInicio}`,
          valor: pedidosSemana.length,
          dataInicio: inicioSemana
        });
      }
      
      return semanas;
    } else {
      // Últimos 6 meses
      const meses = [];
      const agora = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const dataMes = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const proximoMes = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
        
        const pedidosMes = pedidosEntregues.filter(p => {
          const dataEntrega = new Date(p.data_entrega);
          return dataEntrega >= dataMes && dataEntrega < proximoMes;
        });
        
        const nomeMes = dataMes.toLocaleDateString('pt-BR', { month: 'short' });
        meses.push({
          label: nomeMes,
          valor: pedidosMes.length,
          dataInicio: dataMes
        });
      }
      
      return meses;
    }
  };

  const dadosGrafico = calcularDadosGrafico(graficoPeriodo);
  const maxValor = Math.max(...dadosGrafico.map(d => d.valor), 1);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const obsRaw = formData.get('observacao');
    const observacao = typeof obsRaw === 'string' ? obsRaw.trim() : '';
    const status = {
      cortado: formData.get('cortado') === 'on',
      silkado: formData.get('silkado') === 'on',
      bordado: formData.get('bordado') === 'on',
      entregue: formData.get('entregue') === 'on',
      data_entrega: formData.get('data_entrega') || null,
      observacao: observacao ? observacao : null
    };

    try {
      const res = await fetch(`/api/pedidos/${editingPedido.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status)
      });
      if (res.ok) {
        setShowStatusModal(false);
        setEditingPedido(null);
        loadPedidos();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleDeletePedido = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadPedidos();
      }
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      alert('Erro ao excluir pedido');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const search = removerAcentos(searchTerm);
    const tecido = removerAcentos(filtroTecido);
    const cor = removerAcentos(filtroCor);
    
    // Filtro de busca geral
    const matchSearch = !searchTerm || (
      removerAcentos(pedido.cliente_nome)?.includes(search) ||
      removerAcentos(pedido.cliente_empresa)?.includes(search) ||
      removerAcentos(pedido.descricao)?.includes(search)
    );
    
    // Filtro de tecido
    const matchTecido = !filtroTecido || (
      removerAcentos(pedido.tecido)?.includes(tecido)
    );
    
    // Filtro de cor
    const matchCor = !filtroCor || (
      removerAcentos(pedido.cor)?.includes(cor)
    );
    
    return matchSearch && matchTecido && matchCor;
  });

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroTecido('');
    setFiltroCor('');
  };

  const temFiltrosAtivos = searchTerm || filtroTecido || filtroCor;

  return (
    <div className="container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>SK Bordados</h1>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            Sair
          </button>
        </div>
        <nav>
          <button
            className={`nav-btn ${activePage === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActivePage('pedidos')}
            title="Ctrl+P"
          >
            Lista de Pedidos
          </button>
          <button
            className={`nav-btn ${activePage === 'novo-pedido' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('novo-pedido');
              setSelectedClienteId('');
              setClienteSearchTerm('');
            }}
            title="Ctrl+N"
          >
            Novo Pedido
          </button>
          <button
            className={`nav-btn ${activePage === 'clientes' ? 'active' : ''}`}
            onClick={() => setActivePage('clientes')}
            title="Ctrl+C"
          >
            Clientes
          </button>
          <button
            className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
            title="Ctrl+D"
          >
            Dashboard
          </button>
        </nav>
      </header>

      {/* Página: Lista de Pedidos */}
      {activePage === 'pedidos' && (
        <div className="page active">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>Lista de Pedidos</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {ultimaAtualizacao && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#28a745',
                    marginRight: '5px',
                    animation: 'pulse 2s infinite',
                  }}></span>
                  Atualizado: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
                </div>
              )}
            </div>
          </div>
          <div className="filters" style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            marginBottom: '20px',
          }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#555' 
              }}>
                Buscar
              </label>
              <input
                type="text"
                placeholder="Cliente, empresa, descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e0e0e0',  
                  borderRadius: '5px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '150px', position: 'relative' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#555' 
              }}>
                Tecido
              </label>
              <input
                type="text"
                list="tecidos-list"
                placeholder="Ex: Algodão"
                value={filtroTecido}
                onChange={(e) => setFiltroTecido(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: filtroTecido ? '2px solid #667eea' : '2px solid #e0e0e0',
                  borderRadius: '5px',
                  fontSize: '14px',
                }}
              />
              <datalist id="tecidos-list">
                {tecidosUnicos.map(tecido => (
                  <option key={tecido} value={tecido} />
                ))}
              </datalist>
            </div>
            <div style={{ flex: '1', minWidth: '150px', position: 'relative' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#555' 
              }}>
                Cor
              </label>
              <input
                type="text"
                list="cores-list"
                placeholder="Ex: Branca"
                value={filtroCor}
                onChange={(e) => setFiltroCor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: filtroCor ? '2px solid #667eea' : '2px solid #e0e0e0',
                  borderRadius: '5px',
                  fontSize: '14px',
                }}
              />
              <datalist id="cores-list">
                {coresUnicas.map(cor => (
                  <option key={cor} value={cor} />
                ))}
              </datalist>
            </div>
            {temFiltrosAtivos && (
              <button
                type="button"
                onClick={limparFiltros}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  height: '42px',
                }}
                onMouseOver={(e) => e.target.style.background = '#5a6268'}
                onMouseOut={(e) => e.target.style.background = '#6c757d'}
              >
                Limpar Filtros
              </button>
            )}
          </div>
          {temFiltrosAtivos && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              background: '#e7f3ff',
              borderRadius: '5px',
              fontSize: '13px',
              color: '#0066cc',
            }}>
              <strong>Filtros ativos:</strong>
              {searchTerm && <span style={{ marginLeft: '10px' }}>Busca: "{searchTerm}"</span>}
              {filtroTecido && <span style={{ marginLeft: '10px' }}>Tecido: "{filtroTecido}"</span>}
              {filtroCor && <span style={{ marginLeft: '10px' }}>Cor: "{filtroCor}"</span>}
              <span style={{ marginLeft: '10px', fontWeight: '600' }}>
                ({filteredPedidos.length} {filteredPedidos.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'})
              </span>
            </div>
          )}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Empresa</th>
                  <th>Descrição</th>
                  <th>Cor</th>
                  <th>Tecido</th>
                  <th>Tamanho</th>
                  <th>Cortado</th>
                  <th>Silkado</th>
                  <th>Bordado</th>
                  <th>Entregue</th>
                  <th>Data Entrega</th>
                  <th>Observação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPedidos.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ textAlign: 'center' }}>
                      Nenhum pedido cadastrado
                    </td>
                  </tr>
                ) : (
                  filteredPedidos.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>{pedido.cliente_nome}</td>
                      <td>{pedido.cliente_empresa || '-'}</td>
                      <td>{pedido.descricao}</td>
                      <td>{pedido.cor || '-'}</td>
                      <td>{pedido.tecido || '-'}</td>
                      <td>{pedido.tamanho || '-'}</td>
                      <td>
                        <span className={`status-badge ${pedido.cortado ? 'yes' : 'no'}`}>
                          {pedido.cortado ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${pedido.silkado ? 'yes' : 'no'}`}>
                          {pedido.silkado ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${pedido.bordado ? 'yes' : 'no'}`}>
                          {pedido.bordado ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${pedido.entregue ? 'yes' : 'no'}`}>
                          {pedido.entregue ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td>
                        {pedido.data_entrega
                          ? new Date(pedido.data_entrega).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="observacao-cell">
                        {pedido.observacao || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setEditingPedido(pedido);
                              setShowStatusModal(true);
                            }}
                          >
                            Editar Status
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDeletePedido(pedido.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Página: Novo Pedido */}
      {activePage === 'novo-pedido' && (
        <div className="page active">
          <h2>Novo Pedido</h2>
          <form onSubmit={handlePedidoSubmit}>
            <div className="form-group" style={{ position: 'relative' }} data-cliente-search>
              <label htmlFor="cliente-search">Cliente *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    id="cliente-search"
                    value={selectedClienteId ? (selectedCliente?.nome || '') + (selectedCliente?.empresa ? ` - ${selectedCliente.empresa}` : '') : clienteSearchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setClienteSearchTerm(value);
                      setShowClienteDropdown(true);
                      // Se começar a digitar, limpar seleção
                      if (selectedClienteId && value !== (selectedCliente?.nome || '') + (selectedCliente?.empresa ? ` - ${selectedCliente.empresa}` : '')) {
                        setSelectedClienteId('');
                      }
                    }}
                    onFocus={() => {
                      if (!selectedClienteId) {
                        setShowClienteDropdown(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowClienteDropdown(false);
                      }
                      if (e.key === 'Enter' && filteredClientes.length === 1 && !selectedClienteId) {
                        e.preventDefault();
                        setSelectedClienteId(filteredClientes[0].id);
                        setClienteSearchTerm('');
                        setShowClienteDropdown(false);
                      }
                      if (e.key === 'Backspace' && selectedClienteId && !clienteSearchTerm) {
                        setSelectedClienteId('');
                        setShowClienteDropdown(true);
                      }
                    }}
                    placeholder={selectedClienteId ? '' : 'Digite para buscar cliente...'}
                    required={!selectedClienteId}
                    autoComplete="off"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: selectedClienteId ? '2px solid #28a745' : '2px solid #e0e0e0',
                      borderRadius: '5px',
                      fontSize: '14px',
                      backgroundColor: selectedClienteId ? '#f8fff9' : 'white',
                    }}
                  />
                  {selectedClienteId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClienteId('');
                        setClienteSearchTerm('');
                        setShowClienteDropdown(false);
                        document.getElementById('cliente-search')?.focus();
                      }}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '38px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#dc3545',
                        padding: '0 5px',
                      }}
                      title="Limpar seleção"
                    >
                      ×
                    </button>
                  )}
                  {showClienteDropdown && filteredClientes.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '2px solid #667eea',
                      borderTop: 'none',
                      borderRadius: '0 0 5px 5px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}>
                      {filteredClientes.map((cliente) => (
                        <div
                          key={cliente.id}
                          onClick={() => {
                            setSelectedClienteId(cliente.id);
                            setClienteSearchTerm('');
                            setShowClienteDropdown(false);
                          }}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f8f9ff'}
                          onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                          <div style={{ fontWeight: '600', color: '#333' }}>
                            {cliente.nome}
                          </div>
                          {cliente.empresa && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              {cliente.empresa}
                            </div>
                          )}
                          {cliente.telefone && (
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                              📞 {cliente.telefone}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingCliente(null);
                    setShowClienteModal(true);
                  }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Novo
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição da Peça *</label>
              <input
                type="text"
                id="descricao"
                name="descricao"
                required
                placeholder="Ex: Camiseta"
                autoFocus={selectedClienteId ? true : false}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cor">Cor</label>
                <input type="text" id="cor" name="cor" placeholder="Ex: Azul" />
              </div>
              <div className="form-group">
                <label htmlFor="tecido">Tecido</label>
                <input type="text" id="tecido" name="tecido" placeholder="Ex: Algodão" />
              </div>
              <div className="form-group">
                <label htmlFor="tamanho">Tamanho</label>
                <input type="text" id="tamanho" name="tamanho" placeholder="Ex: G" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observacao">Observação</label>
              <textarea
                id="observacao"
                name="observacao"
                rows="3"
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Salvar Pedido
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setActivePage('pedidos');
                  setSelectedClienteId('');
                  setClienteSearchTerm('');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Página: Dashboard */}
      {activePage === 'dashboard' && (
        <div className="page active">
          <h2>Dashboard</h2>
          
          {/* Gráfico de Pedidos Entregues */}
          <div className="dashboard-chart-container">
            <div className="dashboard-chart-header">
              <h3>Pedidos Entregues</h3>
              <select
                value={graficoPeriodo}
                onChange={(e) => setGraficoPeriodo(e.target.value)}
                className="dashboard-period-select"
              >
                <option value="semana">Por Semana</option>
                <option value="mes">Por Mês</option>
              </select>
            </div>
            <div className="dashboard-chart">
              <div className="chart-bars">
                {dadosGrafico.map((item, index) => (
                  <div key={index} className="chart-bar-container">
                    <div className="chart-bar-wrapper">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${(item.valor / maxValor) * 100}%`,
                          backgroundColor: graficoPeriodo === 'semana' ? '#28a745' : '#667eea'
                        }}
                        title={`${item.label}: ${item.valor} pedidos`}
                      >
                        <span className="chart-bar-value">{item.valor}</span>
                      </div>
                    </div>
                    <div className="chart-bar-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-grid">

            <div className="dashboard-card">
              <div className="dashboard-card-icon" style={{ background: '#ffc107' }}>
                ⏳
              </div>
              <div className="dashboard-card-content">
                <h3>Pedidos Pendentes</h3>
                <p className="dashboard-card-value">{stats.pedidosPendentes}</p>
                <p className="dashboard-card-label">Aguardando entrega</p>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon" style={{ background: '#17a2b8' }}>
                📋
              </div>
              <div className="dashboard-card-content">
                <h3>Total de Pedidos</h3>
                <p className="dashboard-card-value">{stats.totalPedidos}</p>
                <p className="dashboard-card-label">Todos os pedidos</p>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon" style={{ background: '#6c757d' }}>
                ✅
              </div>
              <div className="dashboard-card-content">
                <h3>Total Entregues</h3>
                <p className="dashboard-card-value">{stats.pedidosEntregues}</p>
                <p className="dashboard-card-label">Histórico completo</p>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon" style={{ background: '#dc3545' }}>
                👥
              </div>
              <div className="dashboard-card-content">
                <h3>Total de Clientes</h3>
                <p className="dashboard-card-value">{clientes.length}</p>
                <p className="dashboard-card-label">Clientes cadastrados</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Página: Clientes */}
      {activePage === 'clientes' && (
        <div className="page active">
          <h2>Gerenciar Clientes</h2>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingCliente(null);
              setShowClienteModal(true);
            }}
          >
            + Adicionar Cliente
          </button>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Empresa</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      Nenhum cliente cadastrado
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nome}</td>
                      <td>{cliente.empresa || '-'}</td>
                      <td>{cliente.telefone || '-'}</td>
                      <td>{cliente.email || '-'}</td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => {
                            setEditingCliente(cliente);
                            setShowClienteModal(true);
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Cliente */}
      {showClienteModal && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target.className === 'modal active') {
              setShowClienteModal(false);
              setEditingCliente(null);
            }
          }}
        >
          <div className="modal-content">
            <span className="close" onClick={() => {
              setShowClienteModal(false);
              setEditingCliente(null);
            }}>
              &times;
            </span>
            <h2>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={handleClienteSubmit}>
              <div className="form-group">
                <label htmlFor="cliente-nome">Nome *</label>
                <input
                  type="text"
                  id="cliente-nome"
                  name="nome"
                  required
                  defaultValue={editingCliente?.nome || ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cliente-empresa">Empresa</label>
                <input
                  type="text"
                  id="cliente-empresa"
                  name="empresa"
                  defaultValue={editingCliente?.empresa || ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cliente-telefone">Telefone</label>
                <input
                  type="text"
                  id="cliente-telefone"
                  name="telefone"
                  defaultValue={editingCliente?.telefone || ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cliente-email">Email</label>
                <input
                  type="email"
                  id="cliente-email"
                  name="email"
                  defaultValue={editingCliente?.email || ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cliente-endereco">Endereço</label>
                <textarea
                  id="cliente-endereco"
                  name="endereco"
                  rows="2"
                  defaultValue={editingCliente?.endereco || ''}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowClienteModal(false);
                    setEditingCliente(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Status do Pedido */}
      {showStatusModal && editingPedido && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target.className === 'modal active') {
              setShowStatusModal(false);
              setEditingPedido(null);
            }
          }}
        >
          <div className="modal-content">
            <span className="close" onClick={() => {
              setShowStatusModal(false);
              setEditingPedido(null);
            }}>
              &times;
            </span>
            <h2>Editar Status do Pedido</h2>
            <form onSubmit={handleStatusSubmit}>
              <div className="status-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="cortado"
                    defaultChecked={editingPedido.cortado === 1}
                  />
                  <span>Cortado</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="silkado"
                    defaultChecked={editingPedido.silkado === 1}
                  />
                  <span>Silkado</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="bordado"
                    defaultChecked={editingPedido.bordado === 1}
                  />
                  <span>Bordado</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="entregue"
                    defaultChecked={editingPedido.entregue === 1}
                  />
                  <span>Entregue</span>
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="status-data-entrega">Data de Entrega</label>
                <input
                  type="date"
                  id="status-data-entrega"
                  name="data_entrega"
                  defaultValue={
                    editingPedido.data_entrega
                      ? editingPedido.data_entrega.split('T')[0]
                      : ''
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="status-observacao">Observação</label>
                <textarea
                  id="status-observacao"
                  name="observacao"
                  rows="3"
                  placeholder="Adicionar/editar observação..."
                  defaultValue={editingPedido.observacao || ''}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowStatusModal(false);
                    setEditingPedido(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

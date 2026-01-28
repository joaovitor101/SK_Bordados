'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './globals.css';

// Paleta de cores disponíveis na loja, organizadas por categoria
const CORES_POR_CATEGORIA = {
  'Neutros / Básicos': [
    'Branco',
    'Cru',
    'Gelo mescla',
    'Cinza mescla',
    'Cinza 1002',
    'Prata acr',
    'Prata 94275',
    'Areia claro',
    'Palha claro',
    'Bege escola',
    'Bege 33179',
    'Bege médio',
    'Capuccino médio',
    'Café',
    'Marrom 0028',
    'Marrom Sajama',
    'Terra',
  ],
  'Pretos, cinzas e grafites': [
    'Preto escuro',
    'Preto mescla',
    'PV – Preto Mescla',
    'Chumbo escuro',
    'Chumbo médio acr 767',
    'Chumbo 40',
    'Chumbo 6690',
    'Chumbo 6631',
    'Chumbo 8260',
    'Chumbo 33177',
    'Ardósia',
    'Noite',
    'Noite 36884',
  ],
  'Amarelos / Alaranjados': [
    'Amarelo BB claro',
    'Amarelo ouro médio',
    'Mostarda claro',
    'Canário médio',
    'Carambola médio',
    'Limão médio',
    'Fluorescente escuro',
    'Papaia claro',
    'Pêssego médio',
    'Laranja médio',
    'Coral médio',
    'Coral escuro',
    'Maravilha médio',
  ],
  Verdes: [
    'Verde BB claro',
    'Verde médio',
    'Verde 92894',
    'Verde 8905',
    'Verde 699',
    'Verde folha',
    'Verde chá',
    'Verde oliva',
    'Verde musgo 92894',
    'Verde grama claro',
    'Verde cana médio',
    'Verde mar médio',
    'Verde bandeira escuro',
    'Verde floresta escuro',
    'Verde menta',
    'Verde água (acgua 89737)',
    'Esmeralda médio',
    'Laguna médio',
    'Laguna',
    'Turquesa escuro',
    'Piscina médio',
    'Serena médio',
  ],
  Azuis: [
    'Azul BB claro',
    'Celeste médio',
    'Escola médio',
    'Capri médio',
    'Capri 78',
    'Jeans médio',
    'Cobalto médio',
    'Cobalto',
    'Cobalto 33178',
    'Royal escuro',
    'Royal bic escuro',
    'Petróleo médio',
    'Marinho escuro',
    'Marinho 3091',
    'Marinho 36884',
    'Barcelona',
    'Nuvem 34789',
  ],
  'Rosas, lilás e roxos': [
    'Rosa BB claro',
    'Rosa',
    'Rose 36882',
    'Chiclete médio',
    'Pink escuro',
    'Pink 11636',
    'Lilás claro',
    'Lilás 11805',
    'Lavanda médio',
    'Orquídea escuro',
    'Uva escuro',
    'Roxo escuro',
  ],
  'Vermelhos / Vinhos': [
    'Vermelho médio',
    'Ferrari vermelho',
    'Rubi escuro',
    'Vinho médio',
    'Vinho 36883',
    'Goiaba médio',
    'Salmão claro',
  ],
  'Outros / Especiais': [
    'Cristal escuro',
    'Nevoa claro',
    'Skol',
    '9121',
    '6690',
    '36882',
  ],
};

// Configuração das categorias com rótulos (incluindo emojis) para exibição
const CATEGORIAS_CORES = [
  { id: 'Neutros / Básicos', label: '🔹 Neutros / Básicos' },
  { id: 'Pretos, cinzas e grafites', label: '⚫ Pretos, cinzas e grafites' },
  { id: 'Amarelos / Alaranjados', label: '🟡 Amarelos / Alaranjados' },
  { id: 'Verdes', label: '🟢 Verdes' },
  { id: 'Azuis', label: '🔵 Azuis' },
  { id: 'Rosas, lilás e roxos', label: '🌸 Rosas, lilás e roxos' },
  { id: 'Vermelhos / Vinhos', label: '🔴 Vermelhos / Vinhos' },
  { id: 'Outros / Especiais', label: '🤍 Outros / Especiais' },
];

// Formata telefone brasileiro para (xx) xxxxx-xxxx
const formatPhone = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 2) return digits;
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 7);
  const part3 = digits.slice(7, 11);
  if (!part2) return `(${part1}`;
  if (!part3) return `(${part1}) ${part2}`;
  return `(${part1}) ${part2}-${part3}`;
};

export default function Home() {
  const router = useRouter();
  const [activePage, setActivePage] = useState('pedidos');
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pedidosLoaded, setPedidosLoaded] = useState(false);
  const [pedidosError, setPedidosError] = useState(null);
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [corCategoria, setCorCategoria] = useState('');
  const [corSelecionada, setCorSelecionada] = useState('');
  const [selectedPedidoIds, setSelectedPedidoIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState({
    cortado: false,
    silkado: false,
    bordado: false,
    entregue: false,
  });
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
  });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Função para remover acentos e normalizar texto
  const removerAcentos = (str) => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Função para formatar data (YYYY-MM-DD) para dd/mm/aaaa sem problema de fuso
  const formatarDataLocal = (dataStr) => {
    if (!dataStr) return '';
    if (dataStr.includes('/')) return dataStr;
    const [ano, mes, dia] = dataStr.split('-');
    if (!ano || !mes || !dia) return dataStr;
    return `${dia}/${mes}/${ano}`;
  };

  // Função para criar Date a partir de YYYY-MM-DD sem mudar de dia por causa do fuso
  const parseDataEntrega = (dataStr) => {
    if (!dataStr) return null;
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    if (!ano || !mes || !dia) return null;
    return new Date(ano, mes - 1, dia);
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

  // Auto-refresh da lista de pedidos (a cada 4s)
  useEffect(() => {
    if (activePage !== 'pedidos') return;
    if (showClienteModal || showStatusModal) return;
    // Não atualizar automaticamente enquanto o usuário estiver fazendo seleção em massa,
    // para não "quebrar" os checkboxes de seleção/estatus
    if (selectedPedidoIds.length > 0) return;

    const tick = () => {
      // Evita gastar rede em aba escondida (e evita a sensação de "não atualiza")
      if (document.visibilityState === 'visible') {
        loadPedidos();
      }
    };

    const intervalId = window.setInterval(tick, 4000);
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

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const hojeStr = hoje.toISOString().split('T')[0];

  // Quando o usuário seleciona pedidos, já marca os status que TODOS eles têm como "ligados"
  useEffect(() => {
    if (!selectedPedidoIds.length) {
      setBulkStatus({
        cortado: false,
        silkado: false,
        bordado: false,
        entregue: false,
      });
      return;
    }

    const selecionados = pedidos.filter((p) => selectedPedidoIds.includes(p.id));
    if (!selecionados.length) return;

    setBulkStatus((prev) => ({
      cortado: selecionados.every((p) => !!p.cortado),
      silkado: selecionados.every((p) => !!p.silkado),
      bordado: selecionados.every((p) => !!p.bordado),
      entregue: selecionados.every((p) => !!p.entregue),
    }));
  }, [selectedPedidoIds]);

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
      setAlertModal({
        open: true,
        title: 'Erro',
        message: 'Erro ao carregar clientes.',
      });
    }
  };

  const loadPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' });

      if (!res.ok) {
        // Não limpa a lista em caso de erro para evitar "sumir" com os pedidos
        console.error('Erro HTTP ao carregar pedidos:', res.status, res.statusText);
        setPedidosError(`Erro ao carregar pedidos (${res.status})`);
        return;
      }

      const data = await res.json();
  
      if (!Array.isArray(data)) {
        console.error('API /pedidos não retornou array:', data);
        // Mantém a lista atual para não dar a impressão de que não há pedidos
        setPedidosError('Resposta inesperada ao carregar pedidos');
        return;
      }
  
      setPedidos(data);
      setUltimaAtualizacao(new Date());
      setPedidosLoaded(true);
      setPedidosError(null);
    } catch (err) {
      // Em falha de rede ou outro erro, mantemos o último estado conhecido
      console.error('Erro ao carregar pedidos:', err);
      setPedidosError('Erro de rede ao carregar pedidos');
    }
  };
  
  const handleBulkStatusApply = async (e) => {
    e?.preventDefault?.();
    if (!selectedPedidoIds.length) {
      setAlertModal({
        open: true,
        title: 'Aviso',
        message: 'Selecione pelo menos um pedido.',
      });
      return;
    }
    if (!bulkStatus.cortado && !bulkStatus.silkado && !bulkStatus.bordado && !bulkStatus.entregue) {
      setAlertModal({
        open: true,
        title: 'Aviso',
        message: 'Selecione pelo menos um status para aplicar.',
      });
      return;
    }

    const pedidosMap = pedidos.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    try {
      await Promise.all(
        selectedPedidoIds.map(async (id) => {
          const p = pedidosMap[id];
          if (!p) return;
          const body = {
            cortado: bulkStatus.cortado ? true : !!p.cortado,
            silkado: bulkStatus.silkado ? true : !!p.silkado,
            bordado: bulkStatus.bordado ? true : !!p.bordado,
            entregue: bulkStatus.entregue ? true : !!p.entregue,
            data_entrega: p.data_entrega || null,
            observacao: p.observacao ?? null,
          };
          await fetch(`/api/pedidos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        })
      );
      setBulkStatus({ cortado: false, silkado: false, bordado: false, entregue: false });
      setSelectedPedidoIds([]);
      loadPedidos();
    } catch (err) {
      console.error('Erro ao aplicar status em massa:', err);
      setAlertModal({
        open: true,
        title: 'Erro',
        message: 'Erro ao aplicar status em massa.',
      });
    }
  };

  const handleClienteSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cliente = {
      nome: formData.get('nome'),
      empresa: formData.get('empresa') || null,
      telefone: formatPhone(formData.get('telefone') || ''),
      email: formData.get('email') || null,
      endereco: formData.get('endereco') || null
    };

    try {
      const isEditing = !!editingCliente;
      const url = isEditing ? `/api/clientes/${editingCliente.id}` : '/api/clientes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
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
      setAlertModal({
        open: true,
        title: 'Erro',
        message: 'Erro ao salvar cliente.',
      });
    }
  };

  const handlePedidoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      // Tentar encontrar cliente pelo texto digitado
      if (clienteSearchTerm && filteredClientes.length === 1) {
        setSelectedClienteId(filteredClientes[0].id);
      } else {
        setAlertModal({
          open: true,
          title: 'Aviso',
          message: 'Selecione um cliente.',
        });
        return;
      }
    }
    
    const formData = new FormData(e.target);
    const pedido = {
      cliente_id: selectedClienteId,
      descricao: formData.get('descricao'),
      cor: corSelecionada || null,
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
        setCorCategoria('');
        setCorSelecionada('');
        setActivePage('pedidos');
        loadPedidos();
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      setAlertModal({
        open: true,
        title: 'Erro',
        message: 'Erro ao criar pedido.',
      });
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
      const dataEntrega = parseDataEntrega(p.data_entrega);
      if (!dataEntrega) return false;
      return dataEntrega >= inicioMes;
    });

    const pedidosSemana = pedidosEntregues.filter(p => {
      if (!p.data_entrega) return false;
      const dataEntrega = parseDataEntrega(p.data_entrega);
      if (!dataEntrega) return false;
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
          const dataEntrega = parseDataEntrega(p.data_entrega);
          if (!dataEntrega) return false;
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
          const dataEntrega = parseDataEntrega(p.data_entrega);
          if (!dataEntrega) return false;
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
    const dataEntregaValue = formData.get('data_entrega');

    if (dataEntregaValue) {
      const dataSelecionada = new Date(dataEntregaValue);
      dataSelecionada.setHours(0, 0, 0, 0);
      if (dataSelecionada < hoje) {
        setAlertModal({
          open: true,
          title: 'Aviso',
          message: 'A data de entrega não pode ser anterior a hoje.',
        });
        return;
      }
    }
    const status = {
      cortado: formData.get('cortado') === 'on',
      silkado: formData.get('silkado') === 'on',
      bordado: formData.get('bordado') === 'on',
      entregue: formData.get('entregue') === 'on',
      data_entrega: dataEntregaValue || null,
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
      setAlertModal({
        open: true,
        title: 'Erro',
        message: 'Erro ao atualizar status.',
      });
    }
  };

  const handleDeletePedido = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Excluir pedido',
      message: 'Tem certeza que deseja excluir este pedido?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/pedidos/${id}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            loadPedidos();
          } else {
            setAlertModal({
              open: true,
              title: 'Erro',
              message: 'Erro ao excluir pedido.',
            });
          }
        } catch (error) {
          console.error('Erro ao excluir pedido:', error);
          setAlertModal({
            open: true,
            title: 'Erro',
            message: 'Erro ao excluir pedido.',
          });
        }
      },
    });
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
        <div className="header-top">
          <h1>SK Bordados</h1>
          <div className="header-actions">
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Sair
            </button>
            <button
              className="hamburger-btn"
              type="button"
              aria-label="Abrir menu"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <nav className={`main-nav ${isMobileNavOpen ? 'open' : ''}`}>
          <button
            className={`nav-btn ${activePage === 'pedidos' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('pedidos');
              setIsMobileNavOpen(false);
            }}
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
              setIsMobileNavOpen(false);
            }}
            title="Ctrl+N"
          >
            Novo Pedido
          </button>
          <button
            className={`nav-btn ${activePage === 'clientes' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('clientes');
              setIsMobileNavOpen(false);
            }}
            title="Ctrl+C"
          >
            Clientes
          </button>
          <button
            className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('dashboard');
              setIsMobileNavOpen(false);
            }}
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
          {/* Ações em massa para pedidos selecionados */}
          {selectedPedidoIds.length > 0 && (
            <div
              style={{
                marginBottom: '10px',
                padding: '10px 12px',
                background: '#e7f3ff',
                borderRadius: '6px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
              }}
            >
              <span>
                {selectedPedidoIds.length}{' '}
                {selectedPedidoIds.length === 1 ? 'pedido selecionado' : 'pedidos selecionados'}
              </span>
              <span style={{ marginLeft: '8px', fontWeight: 600 }}>Marcar como:</span>
              <label className="color-checkbox" style={{ padding: '4px 8px' }}>
                <input
                  type="checkbox"
                  checked={bulkStatus.cortado}
                  onChange={(e) => setBulkStatus((s) => ({ ...s, cortado: e.target.checked }))}
                />
                <span>Cortado</span>
              </label>
              <label className="color-checkbox" style={{ padding: '4px 8px' }}>
                <input
                  type="checkbox"
                  checked={bulkStatus.silkado}
                  onChange={(e) => setBulkStatus((s) => ({ ...s, silkado: e.target.checked }))}
                />
                <span>Silkado</span>
              </label>
              <label className="color-checkbox" style={{ padding: '4px 8px' }}>
                <input
                  type="checkbox"
                  checked={bulkStatus.bordado}
                  onChange={(e) => setBulkStatus((s) => ({ ...s, bordado: e.target.checked }))}
                />
                <span>Bordado</span>
              </label>
              <label className="color-checkbox" style={{ padding: '4px 8px' }}>
                <input
                  type="checkbox"
                  checked={bulkStatus.entregue}
                  onChange={(e) => setBulkStatus((s) => ({ ...s, entregue: e.target.checked }))}
                />
                <span>Entregue</span>
              </label>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={handleBulkStatusApply}
              >
                Aplicar
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => {
                  setSelectedPedidoIds([]);
                  setBulkStatus({ cortado: false, silkado: false, bordado: false, entregue: false });
                }}
              >
                Limpar seleção
              </button>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        filteredPedidos.length > 0 &&
                        filteredPedidos.every((p) => selectedPedidoIds.includes(p.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          const ids = filteredPedidos.map((p) => p.id);
                          setSelectedPedidoIds(ids);
                        } else {
                          setSelectedPedidoIds([]);
                        }
                      }}
                    />
                  </th>
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
                {/* Estado de erro na carga de pedidos */}
                {pedidosError && (
                  <tr>
                    <td colSpan="13" style={{ textAlign: 'center', color: '#dc3545' }}>
                      {pedidosLoaded ? 'Erro ao atualizar pedidos. Tentando novamente...' : 'Erro ao carregar pedidos. Verifique a conexão ou tente recarregar.'}
                    </td>
                  </tr>
                )}
                {/* Carregando primeira vez */}
                {!pedidosError && !pedidosLoaded && (
                  <tr>
                    <td colSpan="13" style={{ textAlign: 'center', color: '#666' }}>
                      Carregando pedidos...
                    </td>
                  </tr>
                )}
                {/* Lista vazia somente quando realmente não há pedidos */}
                {!pedidosError && pedidosLoaded && filteredPedidos.length === 0 && (
                  <tr>
                    <td colSpan="13" style={{ textAlign: 'center' }}>
                      Nenhum pedido cadastrado
                    </td>
                  </tr>
                )}
                {/* Lista de pedidos */}
                {!pedidosError && filteredPedidos.length > 0 && (
                  filteredPedidos.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPedidoIds.includes(pedido.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPedidoIds((ids) =>
                                ids.includes(pedido.id) ? ids : [...ids, pedido.id]
                              );
                            } else {
                              setSelectedPedidoIds((ids) => ids.filter((id) => id !== pedido.id));
                            }
                          }}
                        />
                      </td>
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
                          ? formatarDataLocal(pedido.data_entrega)
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
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Cor</label>

                {/* Botões de categoria de cores */}
                <div className="color-category-buttons">
                  {CATEGORIAS_CORES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`color-category-btn ${
                        corCategoria === cat.id ? 'active' : ''
                      }`}
                      onClick={() => {
                        setCorCategoria((current) =>
                          current === cat.id ? '' : cat.id
                        );
                        setCorSelecionada('');
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Área de seleção de cor por checkbox */}
                {!corCategoria && (
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#777',
                      fontStyle: 'italic',
                    }}
                  >
                    Clique em um grupo acima para ver as cores disponíveis.
                  </div>
                )}

                {corCategoria && (
                  <div className="color-choices-panel">
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#555',
                        marginBottom: '8px',
                        fontWeight: 600,
                      }}
                    >
                      Selecione a cor desejada ({corCategoria}):
                    </div>
                    <div className="color-options-grid">
                      {CORES_POR_CATEGORIA[corCategoria].map((cor) => {
                        const checked = corSelecionada === cor;
                        return (
                          <label
                            key={cor}
                            className={`color-checkbox ${checked ? 'checked' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setCorSelecionada((current) =>
                                  current === cor ? '' : cor
                                )
                              }
                            />
                            <span>{cor}</span>
                          </label>
                        );
                      })}
                    </div>
                    {/* Mantém valor no form para compatibilidade */}
                    <input type="hidden" name="cor" value={corSelecionada} />
                  </div>
                )}
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
                  setCorCategoria('');
                  setCorSelecionada('');
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
                  <th colSpan="2">Ações</th>
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
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => {
                            setConfirmModal({
                              open: true,
                              title: 'Excluir cliente',
                              message:
                                'Tem certeza que deseja excluir este cliente? Clientes com pedidos cadastrados não podem ser excluídos.',
                              onConfirm: async () => {
                                try {
                                  const res = await fetch(`/api/clientes/${cliente.id}`, {
                                    method: 'DELETE',
                                  });
                                  if (res.ok) {
                                    await loadClientes();
                                  } else {
                                    const data = await res.json().catch(() => ({}));
                                    setAlertModal({
                                      open: true,
                                      title: 'Erro',
                                      message: data?.error || 'Erro ao excluir cliente.',
                                    });
                                  }
                                } catch (err) {
                                  console.error('Erro ao excluir cliente:', err);
                                  setAlertModal({
                                    open: true,
                                    title: 'Erro',
                                    message: 'Erro ao excluir cliente.',
                                  });
                                }
                              },
                            });
                          }}
                        >
                          Excluir
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
                  placeholder="(41) 99999-9999"
                  inputMode="tel"
                  onBlur={(e) => {
                    e.target.value = formatPhone(e.target.value);
                  }}
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

      {/* Modal genérico de aviso */}
      {alertModal.open && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target.className === 'modal active') {
              setAlertModal({ open: false, title: '', message: '' });
            }
          }}
        >
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setAlertModal({ open: false, title: '', message: '' })}
            >
              &times;
            </span>
            {alertModal.title && <h2>{alertModal.title}</h2>}
            <p>{alertModal.message}</p>
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setAlertModal({ open: false, title: '', message: '' })}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal genérico de confirmação */}
      {confirmModal.open && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target.className === 'modal active') {
              setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
            }
          }}
        >
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setConfirmModal({ open: false, title: '', message: '', onConfirm: null })}
            >
              &times;
            </span>
            {confirmModal.title && <h2>{confirmModal.title}</h2>}
            <p>{confirmModal.message}</p>
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  const fn = confirmModal.onConfirm;
                  setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
                  if (typeof fn === 'function') {
                    await fn();
                  }
                }}
              >
                Confirmar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setConfirmModal({ open: false, title: '', message: '', onConfirm: null })
                }
              >
                Cancelar
              </button>
            </div>
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
                  min={hojeStr}
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

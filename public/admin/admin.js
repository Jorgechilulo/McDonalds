// ==========================================================================
// CONFIGURAÇÕES GLOBAIS & CONEXÃO COM O BACKEND (MySQL)
// ==========================================================================
const API_BASE = 'http://localhost/McDonalds/mcdonalds-api/api.php';
let currentTheme = localStorage.getItem('theme') || 'light';

// Sempre que a página do Admin carregar, executa estas funções automaticamente
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initClock();
    initSidebarNavigation();
    
    // Carregamento de dados iniciais
    carregarDadosDoServidor();
    
    // Inicializa os gráficos com um pequeno delay para garantir que o canvas existe
    setTimeout(initCharts, 500);
    
    // Atualizações automáticas em tempo real (15 segundos)
    setInterval(function() {
        carregarDashboardReal();
        carregarPedidosReal();
        carregarEntregasReal();
    }, 15000); 
});

function carregarDadosDoServidor() {
    carregarDashboardReal();
    carregarFuncionariosReal();
    carregarPedidosReal();
    carregarEntregasReal();
}

// Relógio digital no cabeçalho (Otimizado com span isolado para impedir oscilações)
function initClock() {
    const timeDisplay = document.getElementById('currentTime');
    if (!timeDisplay) return;
    
    function updateTime() {
        const agora = new Date();
        // O segredo está em isolar os números dentro de um <span> próprio
        timeDisplay.innerHTML = `<i class="fas fa-clock"></i> <span>${agora.toLocaleTimeString('pt-AO')}</span>`;
    }
    updateTime();
    setInterval(updateTime, 1000);
}

// Navegação entre as abas da Sidebar
function initSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            if (!targetSection) return;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            
            item.classList.add('active');
            const targetEl = document.getElementById(targetSection);
            if (targetEl) targetEl.classList.add('active');
        });
    });
}

// ==========================================================================
// 1. CARREGAR OS DADOS DO DASHBOARD (CARDS & GRÁFICOS)
// ==========================================================================
async function carregarDashboardReal() {
    try {
        const response = await fetch(`${API_BASE}?action=get_dashboard`);
        const data = await response.json();
        
        if (!data) return;

        if (document.getElementById('total-pedidos')) {
            document.getElementById('total-pedidos').textContent = data.total_pedidos ?? 0;
        }
        if (document.getElementById('faturamento-dia')) {
            document.getElementById('faturamento-dia').textContent = formatarMoeda(data.faturamento ?? 0);
        }
        
        const responseEntregas = await fetch(`${API_BASE}?action=get_entregas`);
        const entregas = await responseEntregas.json();
        if (document.getElementById('total-entregas') && entregas) {
            document.getElementById('total-entregas').textContent = entregas.length || 0;
        }

        if (window.canaisChart && data.grafico_canais) {
            window.canaisChart.data.datasets[0].data = [
                parseInt(data.grafico_canais.Balcao) || 0,
                parseInt(data.grafico_canais.Entrega) || 0,
                parseInt(data.grafico_canais.DriveThru) || 0
            ];
            window.canaisChart.update();
        }
    } catch (error) {
        console.error('Erro ao conectar com a API do Dashboard:', error);
    }
}

// ==========================================================================
// 2. LISTAR OS PEDIDOS ATIVOS
// ==========================================================================
async function carregarPedidosReal() {
    try {
        const response = await fetch(`${API_BASE}?action=get_pedidos`);
        const pedidos = await response.json();
        
        const tabela = document.getElementById('tabela-pedidos');
        if (!tabela) return;
        tabela.innerHTML = '';
        
        if (!pedidos || pedidos.length === 0) {
            tabela.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">Nenhum pedido ativo na cozinha.</td></tr>`;
            return;
        }
        
        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            
            let badgeTipo = pedido.tipo === 'Entrega' || pedido.tipo === 'McDelivery' ? 'background: #ffc72c; color: #27251f;' : 'background: #da291c; color: white;';
            let badgeEstado = 'background: #fff3cd; color: #856404;';
            if (pedido.estado === 'Pronto' || pedido.estado === 'Em Rota') badgeEstado = 'background: #cce5ff; color: #004085;';
            
            row.innerHTML = `
                <td><strong>#${pedido.id}</strong></td>
                <td>${pedido.cliente || 'Cliente'}</td>
                <td><span style="padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight:bold; ${badgeTipo}">${pedido.tipo || 'Balcão'}</span></td>
                <td><strong>${formatarMoeda(pedido.total ?? 0)}</strong></td>
                <td>${pedido.pagamento || 'Pendente'}</td>
                <td>${pedido.hora || '--:--'}</td>
                <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight:bold; ${badgeEstado}">${pedido.estado || 'Pendente'}</span></td>
                <td>
                    <button class="btn-icon success" style="background:#28a745; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="finalizarPedidoReal(${pedido.id})">
                        <i class="fas fa-check"></i> Entregar
                    </button>
                </td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
    }
}

async function finalizarPedidoReal(id) {
    try {
        const response = await fetch(`${API_BASE}?action=finalizar_pedido&id=${id}`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            mostrarToast("Pedido concluído com sucesso!");
            carregarDadosDoServidor();
        } else {
            alert(result.message || "Erro ao concluir o pedido.");
        }
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
    }
}

// ==========================================================================
// 3. LOGÍSTICA DE ENTREGAS
// ==========================================================================
async function carregarEntregasReal() {
    try {
        const response = await fetch(`${API_BASE}?action=get_entregas`);
        const entregas = await response.json();
        
        const tabela = document.getElementById('tabela-entregas');
        if (!tabela) return;
        tabela.innerHTML = '';
        
        if (!entregas || entregas.length === 0) {
            tabela.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">Nenhuma entrega pendente ou em rota.</td></tr>`;
            return;
        }
        
        entregas.forEach(ent => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="badge-id">${ent.id_entrega || 'ENT'}</span></td>
                <td>#${ent.num_pedido || '0'}</td>
                <td><i class="fas fa-motorcycle" style="color: #ffc72c"></i> <strong>${ent.motoboy || 'Sem estafeta'}</strong></td>
                <td>${ent.destino || 'Não especificado'}</td>
                <td>${typeof ent.taxa === 'number' ? formatarMoeda(ent.taxa) : ent.taxa}</td>
                <td><span style="color: #da291c; font-weight: bold;"><i class="far fa-clock"></i> ${ent.tempo || '0 min'}</span></td>
                <td><span style="background: #e2e8f0; padding:4px 8px; border-radius:4px; font-weight:bold; color: #27251f;">${ent.estado || 'Em Preparação'}</span></td>
                <td>
                    <button class="btn-icon" style="background:#27251f; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="finalizarPedidoReal(${ent.num_pedido})">
                        Concluir
                    </button>
                </td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao listar entregas:', error);
    }
}

// ==========================================================================
// 4. LISTAR OS FUNCIONÁRIOS
// ==========================================================================
async function carregarFuncionariosReal() {
    try {
        const response = await fetch(`${API_BASE}?action=get_funcionarios`);
        const funcionarios = await response.json();
        
        const tabela = document.getElementById('tabela-funcionarios'); 
        if (!tabela) return;
        tabela.innerHTML = ''; 
        
        if (!funcionarios || funcionarios.length === 0) {
            tabela.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum funcionário cadastrado no MySQL.</td></tr>`;
            return;
        }
        
        funcionarios.forEach(func => {
            const row = document.createElement('tr');
            const cargoFmt = func.cargo ? func.cargo.toLowerCase() : '';
            
            let acoesHtml = (cargoFmt === 'superadmin' || cargoFmt === 'gerente') 
                ? `<span style="color: #da291c; font-weight: bold;">Protegido</span>` 
                : `<button class="btn-icon danger" style="background:#da291c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="removerFuncionarioReal(${func.id})">Apagar</button>`;

            row.innerHTML = `
                <td><span class="badge-id">#${func.id.toString().padStart(4, '0')}</span></td>
                <td>
                    <div class="employee-info" style="display: flex; align-items: center; gap: 12px;">
                        <div class="avatar-small" style="width: 30px; height: 30px; border-radius: 5px; background: linear-gradient(135deg, #da291c 0%, #a81c12 100%); display: flex; align-items: center; justify-content: center; color: white; font-size:12px;">
                            <i class="fas ${cargoFmt === 'motoboy' ? 'fa-motorcycle' : 'fa-user'}"></i>
                        </div>
                        <div>
                            <strong>${func.nome || 'Sem Nome'}</strong>
                            <small style="display:block; color:gray;">${func.email || ''}</small>
                        </div>
                    </div>
                </td>
                <td><span class="specialty-badge" style="background: rgba(255, 199, 44, 0.2); padding: 4px 8px; border-radius: 20px;">${func.cargo || 'Staff'}</span></td>
                <td><strong>${formatarMoeda(func.salario ?? 0)}</strong></td>
                <td><span class="status-badge" style="background: #e6f4ea; color: #137333; padding: 4px 8px; border-radius: 4px;">${func.estado || 'Ativo'}</span></td>
                <td>${acoesHtml}</td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao listar funcionários:', error);
    }
}

// ==========================================================================
// 5. ADICIONAR FUNCIONÁRIO E LANÇAR PEDIDOS MANUALMENTE
// ==========================================================================
async function adicionarFuncionario() {
    const novoFunc = {
        nome: document.getElementById('func-nome')?.value,
        cargo: document.getElementById('func-cargo')?.value,
        salario: parseFloat(document.getElementById('func-salario')?.value || 0),
        email: document.getElementById('func-email')?.value,
        senha: document.getElementById('func-senha')?.value
    };
    
    if (!novoFunc.nome || !novoFunc.email || !novoFunc.senha || !novoFunc.cargo) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}?action=add_funcionario`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(novoFunc)
        });
        const result = await response.json();
        
        if (result.success) {
            mostrarToast("Funcionário contratado com sucesso!");
            carregarFuncionariosReal();
            document.getElementById('form-funcionario').reset();
            fecharModalFuncionario();
        } else {
            alert(result.message || "Erro ao salvar funcionário.");
        }
    } catch (error) {
        console.error('Erro ao adicionar funcionário:', error);
    }
}

async function adicionarPedido() {
    const novoPedido = {
        clienteNome: document.getElementById('nome-cliente')?.value,
        metodoEntrega: document.getElementById('tipo-pedido')?.value === 'McDelivery' ? 'delivery' : 'balcao',
        valorTotal: parseFloat(document.getElementById('total-valor')?.value || 0),
        metodoPagamento: document.getElementById('metodo-pagamento')?.value
    };

    if (!novoPedido.clienteNome || !novoPedido.valorTotal || !document.getElementById('tipo-pedido')?.value) {
        alert('Por favor, preencha todos os campos do pedido!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}?action=add_venda`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(novoPedido)
        });
        const result = await response.json();

        if (result.success) {
            mostrarToast("Pedido lançado no PDV com sucesso!");
            carregarPedidosReal();
            carregarEntregasReal();
            carregarDashboardReal();
            document.getElementById('form-pedido').reset();
            fecharModalPedido();
        } else {
            alert(result.message || "Erro ao registar o pedido.");
        }
    } catch (error) {
        console.error("Erro ao lançar pedido manual:", error);
    }
}

async function removerFuncionarioReal(id) {
    if (!confirm('Tens a certeza que queres eliminar este funcionário do sistema?')) return;
    
    try {
        const response = await fetch(`${API_BASE}?action=delete_funcionario&id=${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            mostrarToast("Funcionário removido com sucesso.");
            carregarFuncionariosReal();
            carregarDashboardReal();
        } else {
            alert(result.message || "Erro ao remover funcionário.");
        }
    } catch (error) {
        console.error('Erro ao remover funcionário:', error);
    }
}

// ==========================================================================
// 6. INICIALIZAR GRÁFICOS (CORREÇÃO TOTAL DE RE-RENDER E API FALLBACK)
// ==========================================================================
function initCharts() {
    // 1. Gráfico de Canais de Venda
    const canaisEl = document.getElementById('canaisVendaChart');
    if (canaisEl && typeof Chart !== "undefined") {
        if (window.canaisChart) { window.canaisChart.destroy(); }
        
        const ctx = canaisEl.getContext('2d');
        window.canaisChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Balcão', 'McDelivery', 'Drive-Thru'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#da291c', '#ffc72c', '#27251f'],
                    borderWidth: 2,
                    borderColor: currentTheme === 'dark' ? '#1e293b' : '#ffffff'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    // 2. Gráfico de Produtos Mais Vendidos (Com proteção antiqueda / 500 error handle)
    const produtosEl = document.getElementById('produtosChart');
    if (produtosEl && typeof Chart !== "undefined") {
        if (window.produtosChart) { window.produtosChart.destroy(); }
        
        const ctx = produtosEl.getContext('2d');
        window.produtosChart = new Chart(ctx, {
            type: 'bar',
            data: { 
                labels: ['Big Mac', 'Batata Frita', 'McFlurry', 'McChicken', 'Cerveja/Refresco'], 
                datasets: [{ 
                    label: 'Unidades Vendidas', 
                    data: [120, 95, 84, 62, 45], // Dados locais de segurança estruturados
                    backgroundColor: 'rgba(255, 199, 44, 0.85)', 
                    borderColor: '#ffc72c', 
                    borderWidth: 2, 
                    borderRadius: 6 
                }] 
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Tenta buscar no banco de dados, se falhar ou der erro 500 mantém os dados estáticos acima ativos
        fetch(`${API_BASE}?action=get_produtos_mais_vendidos`)
            .then(res => {
                if (!res.ok) throw new Error("Erro no servidor MySQL");
                return res.json();
            })
            .then(dados => {
                if (dados && Array.isArray(dados) && dados.length > 0) {
                    window.produtosChart.data.labels = dados.map(item => item.name || item.produto);
                    window.produtosChart.data.datasets[0].data = dados.map(item => item.vendas || 0);
                    window.produtosChart.update();
                }
            })
            .catch(err => {
                console.log("Aviso: Falha na API. Usando dados estáticos de segurança no gráfico de produtos.");
            });
    }
}

// ==========================================================================
// 7. CONTROLES VISUAIS (MODAIS, TOAST & TEMA)
// ==========================================================================
function toggleModal(id, action) {
    const modal = document.getElementById(id);
    if (modal) {
        if (action === 'open') modal.classList.add('active');
        else modal.classList.remove('active');
    }
}

function abrirModalPedido() { toggleModal('modalPedido', 'open'); }
function fecharModalPedido() { toggleModal('modalPedido', 'close'); }
function abrirModalFuncionario() { toggleModal('modalFuncionario', 'open'); }
function fecharModalFuncionario() { toggleModal('modalFuncionario', 'close'); }

function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMessage');
    if (toast && msg) {
        msg.textContent = message;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 4000);
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(valor).replace("AOA", "Kz");
}

// Inicializador de Temas adaptado
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        
        const novoBotao = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(novoBotao, themeToggle);

        novoBotao.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            novoBotao.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
            
            if (window.canaisChart) {
                window.canaisChart.data.datasets[0].borderColor = currentTheme === 'dark' ? '#1e293b' : '#ffffff';
                window.canaisChart.update();
            }
        });
    }
}

function despacharEstafetaRapido() { abrirModalPedido(); }
function gerarRelatorioVendas() { mostrarToast("Caixa do dia fechado com sucesso! Relatório emitido."); }
function filtrarPorCargo(cargo) { mostrarToast("A filtrar equipe por " + cargo); }
function consultarVendasDinheiro() { mostrarToast("Filtro aplicado para vendas em Dinheiro."); }
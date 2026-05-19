// ==========================================================================
// CONFIGURAÇÕES GLOBAIS & CONEXÃO COM O BACKEND (MySQL)
// ==========================================================================
if (typeof API_BASE === 'undefined') {
    window.API_BASE = 'http://localhost/mcdonalds-api/api.php';
} else {
    window.API_BASE = API_BASE;
}

if (typeof currentTheme === 'undefined') {
    window.currentTheme = localStorage.getItem('theme') || 'light';
} else {
    window.currentTheme = currentTheme;
}

// ==========================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initNavigation();
    initTimeDisplay();
    
    // 1. Inicializa os gráficos primeiro
    initCharts();
    
    // 2. Carrega os dados iniciais do MySQL
    carregarDadosDoServidor();
    
    // Sincronização em tempo real a cada 10 segundos
    setInterval(carregarDadosDoServidor, 10000);
});

function carregarDadosDoServidor() {
    carregarDashboardReal();
    atualizarTabelaFuncionariosReal();
    atualizarTabelaPedidosReal();
    atualizarTabelaLogisticaEntregasReal();
}

// ==========================================================================
// TEMA (Identidade Visual McDonald's)
// ==========================================================================
function initTheme() {
    document.documentElement.setAttribute('data-theme', window.currentTheme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = window.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    window.currentTheme = window.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', window.currentTheme);
    document.documentElement.setAttribute('data-theme', window.currentTheme);
    
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = window.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Atualiza cores dos gráficos baseado no tema
    const labelColor = window.currentTheme === 'dark' ? '#f8fafc' : '#1e293b';
    const gridColor = window.currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    if (window.canaisChart && window.canaisChart.options) {
        window.canaisChart.options.plugins.legend.labels.color = labelColor;
        window.canaisChart.data.datasets[0].borderColor = window.currentTheme === 'dark' ? '#1e293b' : '#ffffff';
        window.canaisChart.update();
    }
    if (window.produtosChart && window.produtosChart.options) {
        window.produtosChart.options.scales.y.ticks.color = labelColor;
        window.produtosChart.options.scales.x.ticks.color = labelColor;
        window.produtosChart.options.scales.y.grid.color = gridColor;
        window.produtosChart.options.scales.x.grid.color = gridColor;
        window.produtosChart.options.plugins.legend.labels.color = labelColor;
        window.produtosChart.update();
    }
    
    showToast('Tema ' + (window.currentTheme === 'dark' ? 'escuro' : 'claro') + ' ativado');
}

// ==========================================================================
// NAVEGAÇÃO ENTRE SECÇÕES
// ==========================================================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        switch(sectionId) {
            case 'dashboard':
                carregarDashboardReal();
                break;
            case 'funcionarios':
                atualizarTabelaFuncionariosReal();
                break;
            case 'pedidos':
                atualizarTabelaPedidosReal();
                atualizarTabelaLogisticaEntregasReal();
                break;
        }
        
        targetSection.style.animation = 'fadeIn 0.5s ease';
    }
}

function initTimeDisplay() {
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateString = now.toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const timeDisplay = document.getElementById('currentTime');
        if (timeDisplay) {
            timeDisplay.innerHTML = `
                <div>${timeString}</div>
                <small>${dateString}</small>
            `;
        }
    }
    updateTime();
    setInterval(updateTime, 1000);
}

// ==========================================================================
// READ - DATA LOADERS
// ==========================================================================
async function carregarDashboardReal() {
    try {
        const responseDashboard = await fetch(`${window.API_BASE}?action=get_dashboard`);
        const dados = await responseDashboard.json();
        
        if (dados) {
            const totalPedidos = document.getElementById('total-pedidos');
            const faturamentoDia = document.getElementById('faturamento-dia');
            const totalEquipa = document.getElementById('total-equipa');
            
            if (totalPedidos) totalPedidos.textContent = dados.total_pedidos ?? 0;
            if (faturamentoDia) faturamentoDia.textContent = formatarMoeda(dados.faturamento ?? 0);
            if (totalEquipa) totalEquipa.textContent = dados.total_equipa ?? 0;
            
            if (window.canaisChart && dados.grafico_canais) {
                window.canaisChart.data.datasets[0].data = [
                    parseInt(dados.grafico_canais.Balcao) || 0,
                    parseInt(dados.grafico_canais.Entrega) || 0,
                    parseInt(dados.grafico_canais.DriveThru) || 0 // Ajustado para mapear dinamicamente o 3º item
                ];
                window.canaisChart.update();
            }
        }

        const responseProdutos = await fetch(`${window.API_BASE}?action=get_produtos_mais_vendidos`);
        const produtosDados = await responseProdutos.json();
        
        if (window.produtosChart && Array.isArray(produtosDados) && produtosDados.length > 0) {
            window.produtosChart.data.labels = produtosDados.map(p => p.name || p.produto || 'Desconhecido');
            window.produtosChart.data.datasets[0].data = produtosDados.map(p => parseInt(p.vendas) || 0);
            window.produtosChart.update();
        }
        
    } catch (error) {
        console.error('Erro ao ler métricas dinâmicas do Dashboard:', error);
    }
}

async function atualizarTabelaFuncionariosReal() {
    const tabela = document.getElementById('tabela-funcionarios');
    if (!tabela) return;
    
    try {
        const response = await fetch(`${window.API_BASE}?action=get_funcionarios`);
        const funcionarios = await response.json();
        
        tabela.innerHTML = '';
        
        if (!funcionarios || funcionarios.length === 0) {
            tabela.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum funcionário cadastrado no MySQL.</td></tr>`;
            return;
        }

        funcionarios.forEach(func => {
            const cargoLimpo = func.cargo ? func.cargo.toLowerCase() : '';
            const estadoFunc = func.estado || 'Disponível';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="badge-id">#${func.id.toString().padStart(4, '0')}</span></td>
                <td>
                    <div class="employee-info">
                        <div class="avatar-small ${cargoLimpo === 'administrador' || cargoLimpo === 'superadmin' ? 'admin-master' : ''}">
                            <i class="fas ${cargoLimpo === 'motoboy' ? 'fa-motorcycle' : 'fa-user'}"></i>
                        </div>
                        <div>
                            <strong>${func.nome || 'Sem Nome'}</strong>
                            <small>ID Interno: ${func.id}</small>
                        </div>
                    </div>
                </td>
                <td><span class="specialty-badge">${func.cargo || 'Funcionário'}</span></td>
                <td><strong>${formatarMoeda(func.salario)}</strong></td>
                <td><span class="status-badge ${estadoFunc === 'Em Entrega' || estadoFunc === 'Em Rota' ? 'status-busy' : 'status-active'}">${estadoFunc}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon info" onclick="verCredenciaisReal(${func.id}, '${func.nome}', '${func.email}')" title="Ver Email">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn-icon danger" onclick="removerFuncionarioReal(${func.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar lista de funcionários:', error);
    }
}

async function atualizarTabelaPedidosReal() {
    const tabela = document.getElementById('tabela-pedidos');
    if (!tabela) return;
    
    try {
        const response = await fetch(`${window.API_BASE}?action=get_pedidos`);
        const pedidos = await response.json();
        
        tabela.innerHTML = '';
        
        if (!pedidos || pedidos.length === 0) {
            tabela.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">Nenhum pedido ativo na esteira de produção.</td></tr>`;
            return;
        }

        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="badge-id">#${pedido.id}</span></td>
                <td><strong>${pedido.cliente || 'Cliente'}</strong></td>
                <td><span class="floor-badge">${pedido.tipo || 'Balcão'}</span></td>
                <td><strong>${formatarMoeda(pedido.total)}</strong></td>
                <td><span class="room-badge">${pedido.pagamento || 'Dinheiro'}</span></td>
                <td>${pedido.hora || '--:--'}</td>
                <td><span class="status-badge ${pedido.estado === 'Em Rota' ? 'status-route' : 'status-active'}">${pedido.estado || 'Pendente'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" style="background: #10b981; color: white;" onclick="finalizarPedidoReal(${pedido.id})" title="Concluir e Liberar Motoboy">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        tabela.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color: var(--danger);">Pedidos indisponíveis (Erro ao ler dados estruturados).</td></tr>`;
    }
}

async function atualizarTabelaLogisticaEntregasReal() {
    const tabelaEntregas = document.getElementById('tabela-entregas-motoboy');
    if (!tabelaEntregas) return;

    try {
        const response = await fetch(`${window.API_BASE}?action=get_entregas`);
        const entregas = await response.json();

        tabelaEntregas.innerHTML = '';

        if (!entregas || entregas.length === 0) {
            tabelaEntregas.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:15px; color:#94a3b8;">Nenhuma entrega ativa em rota de viagem neste momento.</td></tr>`;
            return;
        }

        entregas.forEach(ent => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong style="color: #ffc72c;">${ent.id_entrega || 'ENT-0'}</strong></td>
                <td><span class="badge-id">#${ent.num_pedido || '0'}</span></td>
                <td><i class="fas fa-motorcycle" style="color:#ffc72c; margin-right:8px;"></i> <strong>${ent.motoboy || 'Aguardando'}</strong></td>
                <td>${ent.destino || 'Não Informado'}</td>
                <td><span style="color:#10b981; font-weight:bold;">${formatarMoeda(ent.taxa || 0)}</span></td>
                <td><span class="floor-badge"><i class="fas fa-clock"></i> ${ent.tempo || '0 min'}</span></td>
            `;
            tabelaEntregas.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao processar tabela logística de entregas:', error);
    }
}

// ==========================================================================
// WRITE & DELETE - MÉTODOS DE AÇÃO REAIS
// ==========================================================================
function abrirModalFuncionario() {
    const modal = document.getElementById('modalFuncionario');
    if (modal) modal.classList.add('active');
}

function fecharModalFuncionario() {
    const modal = document.getElementById('modalFuncionario');
    if (modal) modal.classList.remove('active');
    const form = document.getElementById('form-funcionario');
    if (form) form.reset();
}

async function adicionarFuncionario() {
    const form = document.getElementById('form-funcionario');
    if (form && !form.checkValidity()) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    const novoFunc = {
        nome: document.getElementById('func-nome').value,
        cargo: document.getElementById('func-cargo').value,
        salario: parseFloat(document.getElementById('func-salario').value) || 0,
        email: document.getElementById('func-email').value,
        senha: document.getElementById('func-senha').value
    };
    
    try {
        const response = await fetch(`${window.API_BASE}?action=add_funcionario`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(novoFunc)
        });
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message, 'success');
            fecharModalFuncionario();
            carregarDadosDoServidor(); 
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao comunicar criação com a API:', error);
        showToast('Falha crítica de comunicação com o Servidor PHP.', 'error');
    }
}

async function removerFuncionarioReal(id) {
    if (confirm('Deseja demitir permanentemente este funcionário do banco de dados?')) {
        try {
            const response = await fetch(`${window.API_BASE}?action=delete_funcionario&id=${id}`, { method: 'DELETE' });
            const result = await response.json();
            
            if (result.success) {
                showToast('Funcionário removido com sucesso!', 'warning');
                carregarDadosDoServidor();
            } else {
                showToast(result.message || 'Erro ao remover.', 'error');
            }
        } catch (error) {
            console.error('Erro ao deletar do banco:', error);
        }
    }
}

async function finalizarPedidoReal(id) {
    try {
        const response = await fetch(`${window.API_BASE}?action=finalizar_pedido&id=${id}`, { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            showToast("Pedido arquivado e motoboy liberado!", "success");
            carregarDadosDoServidor(); 
        }
    } catch (error) {
        console.error('Erro ao fechar pedido:', error);
    }
}

function verCredenciaisReal(id, nome, email) {
    alert(`🔒 INFORMAÇÕES DE CADASTRO REAL:\n\nID Interno: ${id}\nFuncionário: ${nome}\nE-mail de Login: ${email}\n\nNota: Por motivos de segurança, a hash da senha encontra-se criptografada na base de dados.`);
}

function abrirModalPedido() { const modal = document.getElementById('modalPedido'); if (modal) modal.classList.add('active'); }
function fecharModalPedido() { const modal = document.getElementById('modalPedido'); if (modal) modal.classList.remove('active'); const form = document.getElementById('form-pedido'); if (form) form.reset(); }

// ==========================================================================
// CONFIGURAÇÃO INICIAL DOS GRÁFICOS DINÂMICOS
// ==========================================================================
function initCharts() {
    const canaisEl = document.getElementById('genderChart');
    if (canaisEl && !window.canaisChart) {
        const ctx = canaisEl.getContext('2d');
        window.canaisChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Balcão', 'McDelivery', 'Drive-Thru'],
                datasets: [{
                    data: [0, 0, 0], 
                    backgroundColor: ['#da291c', '#ffc72c', '#27251f'],
                    borderWidth: 2,
                    borderColor: window.currentTheme === 'dark' ? '#1e293b' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: window.currentTheme === 'dark' ? '#f8fafc' : '#1e293b', font: { size: 14 } } } }
            }
        });
    }

    const produtosEl = document.getElementById('specialtiesChart');
    if (produtosEl && !window.produtosChart) {
        const ctx = produtosEl.getContext('2d');
        window.produtosChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Carregando...'], 
                datasets: [{
                    label: 'Quantidade Unidades',
                    data: [0], 
                    backgroundColor: 'rgba(255, 199, 44, 0.9)',
                    borderColor: '#ffc72c',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: window.currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }, ticks: { color: window.currentTheme === 'dark' ? '#f8fafc' : '#1e293b' } },
                    x: { grid: { color: window.currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }, ticks: { color: window.currentTheme === 'dark' ? '#f8fafc' : '#1e293b' } }
                },
                plugins: { legend: { labels: { color: window.currentTheme === 'dark' ? '#f8fafc' : '#1e293b' } } }
            }
        });
    }
}

// UTILITÁRIOS DE FORMATAÇÃO VISUAL
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AKZ' }).format(valor);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #da291c 100%)';
        if (icon) icon.className = 'fas fa-exclamation-circle toast-icon';
    } else if (type === 'warning') {
        toast.style.background = 'linear-gradient(135deg, #ffc72c 0%, #d97706 100%)';
        if (icon) icon.className = 'fas fa-exclamation-triangle toast-icon';
    } else {
        toast.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        if (icon) icon.className = 'fas fa-check-circle toast-icon';
    }
    
    if (messageEl) messageEl.textContent = message;
    toast.classList.add('active');
    setTimeout(() => { toast.classList.remove('active'); }, 3000);
}

// Injeção de CSS Auxiliar
if (!document.getElementById('mcdonalds-custom-styles')) {
    document.head.insertAdjacentHTML('beforeend', `
        <style id="mcdonalds-custom-styles">
            .badge-id { background: var(--gray-light); color: var(--dark); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
            .employee-info { display: flex; align-items: center; gap: 12px; }
            .avatar-small { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #da291c 0%, #a81c12 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; }
            .avatar-small.admin-master { background: linear-gradient(135deg, #ffc72c 0%, #d97706 100%); color: #1e293b; }
            .specialty-badge { background: rgba(255, 199, 44, 0.2); color: var(--dark); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
            .floor-badge, .room-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; background: var(--gray-light); color: var(--dark); font-size: 12px; font-weight: 500; }
            .action-buttons { display: flex; gap: 8px; }
            .btn-icon { width: 36px; height: 36px; border-radius: 8px; border: none; background: var(--gray-light); color: var(--dark); cursor: pointer; transition: 0.2s ease; display: flex; align-items: center; justify-content: center; }
            .btn-icon:hover { transform: translateY(-2px); background: #ffc72c; color: #1e293b; }
            .btn-icon.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
            .btn-icon.danger:hover { background: var(--danger); color: white; }
            .btn-icon.info { background: rgba(59, 130, 246, 0.1); color: var(--info); }
            .status-badge.status-busy { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
            .status-badge.status-route { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
        </style>
    `);
}
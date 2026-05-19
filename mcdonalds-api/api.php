<?php
// Permite que o React e o HTML puro enviem dados para a API PHP sem bloqueios de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Content-Type: application/json; charset=UTF-8");

// Desativa a exibição de erros textuais que quebram o JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuração da ligação à Base de Dados
$host = "localhost";
$user = "root";
$pass = "";
$db   = "McDonalds";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Erro na ligação à base de dados."]);
    exit;
}

$action = $_GET['action'] ?? '';

// ==========================================================
// 1. ROTA DE AUTENTICAÇÃO (LOGIN)
// ==========================================================
if ($action == 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $email = $data['email'] ?? '';
    $senha = $data['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        echo json_encode(["success" => false, "message" => "Por favor, preencha todos os campos!"]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, nome, cargo, senha FROM funcionarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user_data = $result->fetch_assoc()) {
        if (password_verify($senha, $user_data['senha'])) {
            echo json_encode([
                "success" => true,
                "message" => "Login efetuado com sucesso!",
                "usuario" => [
                    "id" => $user_data['id'],
                    "nome" => $user_data['nome'],
                    "cargo" => $user_data['cargo']
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Senha incorreta! Tente novamente."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "E-mail não encontrado no sistema!"]);
    }
    exit;
}

// ==========================================================
// 2. ROTAS DE FUNCIONÁRIOS
// ==========================================================
elseif ($action == 'get_funcionarios') {
    $result = $conn->query("SELECT id, nome, cargo, salario, estado, email FROM funcionarios");
    $funcs = [];
    while($row = $result->fetch_assoc()) { 
        $funcs[] = $row; 
    }
    echo json_encode($funcs);
    exit;
}

elseif ($action == 'add_funcionario') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $name = $data['nome'] ?? '';
    $cargo = $data['cargo'] ?? '';
    $salario = $data['salario'] ?? 0;
    $email = $data['email'] ?? '';
    $senha = password_hash(($data['senha'] ?? '123456'), PASSWORD_DEFAULT);
    
    $stmt = $conn->prepare("INSERT INTO funcionarios (nome, cargo, salario, email, senha, estado) VALUES (?, ?, ?, ?, ?, 'Disponível')");
    $stmt->bind_param("ssdss", $name, $cargo, $salario, $email, $senha);
    
    if($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Funcionário adicionado com sucesso!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao adicionar. Verifique se o e-mail já existe."]);
    }
    exit;
}

elseif ($action == 'delete_funcionario') {
    $id = $_GET['id'] ?? 0;
    
    $check = $conn->prepare("SELECT cargo FROM funcionarios WHERE id = ?");
    $check->bind_param("i", $id);
    $check->execute();
    $res = $check->get_result()->fetch_assoc();
    
    if ($res && $res['cargo'] === 'SuperAdmin') {
        echo json_encode(["success" => false, "message" => "Ação Bloqueada! Não é permitido excluir o SuperAdmin."]);
        exit;
    }
    
    $stmt = $conn->prepare("DELETE FROM funcionarios WHERE id = ?");
    $stmt->bind_param("i", $id);
    if($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao tentar apagar o funcionário."]);
    }
    exit;
}

// ==========================================================
// 3. ROTAS DO DASHBOARD, GRÁFICOS E RELATÓRIOS
// ==========================================================
elseif ($action == 'get_dashboard') {
    $fat = $conn->query("SELECT SUM(total_pago) as total FROM vendas")->fetch_assoc();
    $pedidos = $conn->query("SELECT COUNT(*) as total FROM vendas")->fetch_assoc();
    $equipa = $conn->query("SELECT COUNT(*) as total FROM funcionarios")->fetch_assoc();
    
    $canais_res = $conn->query("SELECT tipo_pedido, COUNT(*) as qtd FROM vendas GROUP BY tipo_pedido");
    $canais = ["Balcao" => 0, "Entrega" => 0, "DriveThru" => 0];
    
    while($row = $canais_res->fetch_assoc()) {
        $tipo = strtolower($row['tipo_pedido']);
        if($tipo == 'balcão' || $tipo == 'balcao') $canais['Balcao'] = (int)$row['qtd'];
        if($tipo == 'entrega' || $tipo == 'mcdelivery') $canais['Entrega'] = (int)$row['qtd'];
        if($tipo == 'drive-thru' || $tipo == 'drivethru') $canais['DriveThru'] = (int)$row['qtd'];
    }

    echo json_encode([
        "faturamento" => (float)($fat['total'] ?? 0),
        "total_pedidos" => (int)($pedidos['total'] ?? 0),
        "total_equipa" => (int)($equipa['total'] ?? 0),
        "grafico_canais" => $canais
    ]);
    exit;
}

elseif ($action == 'get_produtos_mais_vendidos') {
    $produtos = [];
    
    $sql = "SELECT p.nome_produto AS name, SUM(i.quantidade) AS vendas 
            FROM itens_venda i 
            INNER JOIN produtos p ON i.id_produto = p.id 
            GROUP BY p.id 
            ORDER BY vendas DESC LIMIT 5";
            
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $produtos[] = ["name" => $row['name'], "vendas" => (int)$row['vendas']];
        }
    } else {
        $produtos = [
            ["name" => "Big Mac", "vendas" => 120],
            ["name" => "Batata M", "vendas" => 180],
            ["name" => "Sundae", "vendas" => 90],
            ["name" => "McNuggets", "vendas" => 115],
            ["name" => "Menu McPrime", "vendas" => 65]
        ];
    }
    
    echo json_encode($produtos);
    exit;
}

// ==========================================================
// 4. ROTAS DE PEDIDOS E LOGÍSTICA DE ENTREGAS
// ==========================================================
elseif ($action == 'get_pedidos') {
    $result = $conn->query("SELECT id, cliente_nome, tipo_pedido, total_pago, metodo_pagamento, hora_venda, estado FROM vendas WHERE estado NOT IN ('Entregue', 'Cancelado') ORDER BY id DESC");
    $pedidos = [];
    while($row = $result->fetch_assoc()) {
        $pedidos[] = [
            "id" => $row['id'],
            "cliente" => $row['cliente_nome'],
            "tipo" => $row['tipo_pedido'],
            "total" => $row['total_pago'],
            "pagamento" => $row['metodo_pagamento'],
            "hora" => date('H:i', strtotime($row['hora_venda'])),
            "estado" => $row['estado']
        ];
    }
    echo json_encode($pedidos);
    exit;
}

elseif ($action == 'get_entregas') {
    $sql = "SELECT v.id AS id_pedido, v.cliente_nome AS destino, v.total_pago AS taxa, v.hora_venda, v.estado, f.nome AS motoboy_nome 
            FROM vendas v 
            LEFT JOIN funcionarios f ON v.motoboy_id = f.id 
            WHERE v.tipo_pedido = 'Entrega' AND v.estado IN ('Em Rota', 'Pendente')";
    
    $result = $conn->query($sql);
    $entregas = [];
    
    while($row = $result->fetch_assoc()) {
        $tempoDecorrido = round((time() - strtotime($row['hora_venda'])) / 60);
        if ($tempoDecorrido < 0 || $tempoDecorrido > 1440) $tempoDecorrido = 0; 
        
        $entregas[] = [
            "id_entrega" => "ENT-" . $row['id_pedido'],
            "num_pedido" => $row['id_pedido'],
            "motoboy" => $row['motoboy_nome'] ?? "Aguardando Estafeta",
            "destino" => $row['destino'],
            "taxa" => number_format($row['taxa'] * 0.10, 0) . " KZ", 
            "tempo" => $tempoDecorrido . " min",
            "estado" => $row['estado']
        ];
    }
    echo json_encode($entregas);
    exit;
}

elseif ($action == 'finalizar_pedido') {
    $id = $_GET['id'] ?? 0;
    
    $stmtCheck = $conn->prepare("SELECT motoboy_id FROM vendas WHERE id = ?");
    $stmtCheck->bind_param("i", $id);
    $stmtCheck->execute();
    $venda = $stmtCheck->get_result()->fetch_assoc();
    
    $stmt = $conn->prepare("UPDATE vendas SET estado = 'Entregue' WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($venda && !empty($venda['motoboy_id'])) {
            $motoboyId = $venda['motoboy_id'];
            $conn->query("UPDATE funcionarios SET estado = 'Disponível' WHERE id = $motoboyId");
        }
        echo json_encode(["success" => true, "message" => "Pedido concluído com sucesso e funcionário liberado!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao finalizar pedido."]);
    }
    exit;
}

// ==========================================================
// 5. ROTA DE ADICIONAR VENDAS (PDV / React Manual)
// ==========================================================
elseif ($action == 'add_venda') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        echo json_encode(["success" => false, "message" => "Nenhum dado recebido no servidor."]);
        exit;
    }

    $clienteNome      = $data['clienteNome'] ?? 'Cliente Geral';
    $tipoPedidoTexto  = ($data['metodoEntrega'] === 'delivery') ? 'Entrega' : 'Balcão';
    $totalPago        = $data['valorTotal'] ?? 0.00;
    $subtotal         = $totalPago; 
    $metodoPagamento  = $data['metodoPagamento'] ?? 'Dinheiro'; 
    $isFidelidade     = isset($data['clienteUid']) ? 1 : 0;
    
    $estado           = "Pendente"; 
    $motoboyId        = null; 

    if ($tipoPedidoTexto === 'Entrega') {
        $result = $conn->query("SELECT id FROM funcionarios WHERE cargo = 'Motoboy' AND estado = 'Disponível' LIMIT 1");
        
        if ($result && $result->num_rows > 0) {
            $motoboy = $result->fetch_assoc();
            $motoboyId = (int)$motoboy['id'];
            $estado = "Em Rota"; 
            
            $conn->query("UPDATE funcionarios SET estado = 'Em Entrega' WHERE id = '$motoboyId'");
        }
    } else {
        $estado = "Pronto";
    }

    $stmt = $conn->prepare("INSERT INTO vendas (cliente_nome, is_fidelidade, tipo_pedido, subtotal, total_pago, metodo_pagamento, estado, motoboy_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Erro na estrutura do banco: " . $conn->error]);
        exit;
    }

    if ($motoboyId === null) {
        $paramMotoboy = null;
        $stmt->bind_param("sisddsss", $clienteNome, $isFidelidade, $tipoPedidoTexto, $subtotal, $totalPago, $metodoPagamento, $estado, $paramMotoboy);
    } else {
        $stmt->bind_param("sisddssi", $clienteNome, $isFidelidade, $tipoPedidoTexto, $subtotal, $totalPago, $metodoPagamento, $estado, $motoboyId);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "Venda salva com sucesso no MySQL!",
            "motoboyId" => $motoboyId ?? "N/A"
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Erro ao executar inserção: " . $stmt->error
        ]);
    }
    exit;
}

$conn->close();
?>
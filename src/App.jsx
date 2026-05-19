import { Routes, Route, Link } from 'react-router-dom'
import AreaRestrita from './pages/area_restrita'
import Pedido from './pages/pedido'
import './App.css'
import Logo from "./assets/Logo.png"
import Combo from "./assets/combo.png"
import Bebida from "./assets/bebidas.png"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import emailjs from '@emailjs/browser'

// IMPORTS REAIS DO FIREBASE
import { auth } from './firebaseConfig' 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile 
} from 'firebase/auth'

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Cardápio", href: "#" },
  { label: "Entregas", href: "#" },
  { label: "Pedidos", href: "#" },
  { label: "Sobre", href: "#" },
  { label: "Contacto", href: "#" },
]

const textSlides = [
  {
    h1: "Uma comida deliciosa está à sua espera.",
    p: "Ingredientes frescos, preparo na hora e aquele sabor caseiro que só a gente sabe fazer. Peça já e surpreenda-se!",
    buttonText: "Peça já"
  },
  {
    h1: "Encomende os seus favoritos e seja feliz.",
    p: "Descubra os sabores que vão tornar o seu dia ainda mais especial. Do clássico ao premium, temos o lanche perfeito para você.",
    buttonText: "Encomendar"
  },
  {
    h1: "Seu lanche favorito, em apenas um clique de distância.",
    p: "Rápido, prático e irresistível. Escolha o seu, finalize o pedido e receba onde estiver.",
    buttonText: "Fazer Pedido"
  }
]

const produtosPromocao = [
  {
    id: 1,
    name: "X-Tudo Especial",
    descricao: "Pão, hambúrguer artesanal, queijo cheddar, bacon, ovo, alface, tomate e molho especial.",
    precoOriginal: 3250,
    precoPromocional: 2490,
    imagem: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop",
    desconto: 23,
    categoria: "Hambúrgueres",
    pontos: 25
  },
  {
    id: 2,
    name: "Combo Família",
    descricao: "2 hambúrgueres + 2 batatas grandes + 2 refrigerantes 500ml.",
    precoOriginal: 5990,
    precoPromocional: 4590,
    imagem: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=300&h=200&fit=crop",
    desconto: 23,
    categoria: "Combos",
    pontos: 45
  },
  {
    id: 3,
    name: "Batata Suprema",
    descricao: "Batata crocante coberta com cheddar, bacon e cebolinha.",
    precoOriginal: 2290,
    precoPromocional: 1690,
    imagem: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=300&h=200&fit=crop",
    desconto: 26,
    categoria: "Acompanhamentos",
    pontos: 15
  },
  {
    id: 4,
    name: "Milk Shake Ovomaltine",
    descricao: "Delicioso milk shake de Ovomaltine com chantilly e calda.",
    precoOriginal: 1890,
    precoPromocional: 1390,
    imagem: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop",
    desconto: 26,
    categoria: "Bebidas",
    pontos: 10
  }
]

function MagneticLink({ href, children }) {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const x = useSpring(position.x, { stiffness: 300, damping: 20 })
  const y = useSpring(position.y, { stiffness: 300, damping: 20 })

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPosition({
      x: (e.clientX - cx) * 0.35,
      y: (e.clientY - cy) * 0.35,
    })
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setPosition({ x: 0, y: 0 }); setHovered(false) }}
      style={{ x, y, display: 'inline-block', position: 'relative' }}
      className="nav-link"
    >
      <span className="nav-link-text">{children}</span>
      <motion.span
        className="nav-underline"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#FFC72C', originX: 0 }}
      />
    </motion.a>
  )
}

function RestrictedButton({ onClick }) {
  const [hovered, setHovered] = useState(false)
  const [particles, setParticles] = useState([])

  const handleHover = () => {
    setHovered(true)
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 60 - 30,
      y: Math.random() * -40 - 10,
      scale: Math.random() * 0.5 + 0.3,
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 500)
  }

  return (
    <div style={{ position: "relative", cursor: 'pointer' }} onClick={onClick}>
      <motion.div
        className="restricted-btn"
        onHoverStart={handleHover}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <motion.span 
          className="btn-bg" 
          animate={{
            background: hovered 
              ? "linear-gradient(135deg, #FFD700 0%, #FFC72C 50%, #FF9800 100%)" 
              : "linear-gradient(135deg, #FFC72C 0%, #FFD700 100%)",
          }} 
          transition={{ duration: 0.4 }} 
        />
        
        <motion.span 
          className="lock-icon" 
          animate={{ 
            rotate: hovered ? [0, -15, 10, -5, 0] : 0, 
            y: hovered ? [0, -3, 0] : 0 
          }} 
          transition={{ duration: 0.5 }}
        >
          🔒
        </motion.span>
        
        <motion.span 
          className="btn-label" 
          animate={{ letterSpacing: hovered ? "0.08em" : "0.02em" }} 
          transition={{ duration: 0.3 }}
        >
          Minha conta
        </motion.span>
        
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
          <AnimatePresence>
            {particles.map((p) => (
              <motion.span 
                key={p.id} 
                className="particle" 
                initial={{ opacity: 1, x: 0, y: 0, scale: p.scale }} 
                animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ position: 'absolute', color: '#FFD700', left: '50%', top: '50%' }}
              >
                ✦
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        
        <motion.div 
          className="btn-shine" 
          initial={{ x: "-100%", opacity: 0 }} 
          animate={hovered ? { x: "200%", opacity: [0, 0.6, 0] } : { x: "-100%", opacity: 0 }} 
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  )
}

function CartButton({ cartItems, onOpenCart }) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  
  return (
    <motion.div 
      className="cart-button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onOpenCart}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      <span className="cart-icon">🛒</span>
      {totalItems > 0 && (
        <motion.span 
          className="cart-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {totalItems}
        </motion.span>
      )}
    </motion.div>
  )
}

function CartModal({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout, userPoints, formatPrice, usuarioLogado }) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.precoPromocional * item.quantity), 0)
  const totalPontos = cartItems.reduce((sum, item) => sum + (item.pontos * item.quantity), 0)

  const temDesconto = usuarioLogado && !usuarioLogado.isGuest
  const valorTotalFinal = temDesconto ? subtotal * 0.80 : subtotal

  if (!isOpen) return null

  return (
    <motion.div 
      className="cart-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="cart-modal"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-modal-header">
          <h3>Seu Carrinho</h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="cart-points-bar">
          <span>⭐ Pontos acumulados: <strong>{userPoints}</strong> pts</span>
          {totalPontos > 0 && (
            <span className="cart-earn-points" style={{ marginLeft: '10px', color: '#FFC72C' }}>+{totalPontos} pts nesta compra</span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.cartId} className="cart-item">
                  <img src={item.imagem} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>{formatPrice(item.precoPromocional)}</p>
                    <div className="cart-item-points">+{item.pontos} pts</div>
                  </div>
                  <div className="cart-item-actions">
                    <button onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}>+</button>
                    <button className="cart-item-remove" onClick={() => onRemoveItem(item.cartId)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              {temDesconto && (
                <div className="cart-discount-alert" style={{ color: '#2ec4b6', fontSize: '14px', marginBottom: '8px', textAlign: 'right' }}>
                  🎉 Desconto aplicado para cliente logado!
                </div>
              )}
              <div className="cart-total">
                <span>Total:</span>
                <strong>{formatPrice(valorTotalFinal)}</strong>
              </div>
              <button className="cart-checkout" onClick={onCheckout}>
                Finalizar Pedido
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function AuthModal({ isOpen, onClose, tela, setTela, setUsuarioLogado, setUserPoints, setToastMessage, setShowToast }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [codigoSMS, setCodigoSMS] = useState('') 
  const [codigoGerado, setCodigoGerado] = useState('')
  const [enviandoEmail, setEnviandoEmail] = useState(false)

  const rotateX = useSpring(0, { stiffness: 100, damping: 15 })
  const rotateY = useSpring(0, { stiffness: 100, damping: 15 })

  if (!isOpen) return null

  const handleMouseMove3D = (e) => {
    const el = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - el.left - el.width / 2
    const y = e.clientY - el.top - el.height / 2
    rotateX.set(-y * 0.06) 
    rotateY.set(x * 0.06)
  }

  const handleMouseLeave3D = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  // REDIRECIONAMENTO INTELIGENTE INTEGRADO AQUI
  const verificarRedirecionamentoAdmin = (emailUsuario) => {
    const emailLimpo = emailUsuario.toLowerCase().trim();
    // Lista de controlo de acessos administrativos do McDonald's Super
    if (emailLimpo === "admin@mcdonalds.com" || emailLimpo === "secretario@mcdonalds.com") {
      setToastMessage("Acedendo ao Painel de Controlo Administrativo...");
      setTimeout(() => {
        window.location.href = "/admin/index.html"; 
      }, 1000);
      return true;
    }
    return false;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!email || !senha) {
      alert("Por favor, preencha todos os campos!")
      return
    }

    try {
      setToastMessage("Autenticando...")
      setShowToast(true)
      
      const userCredential = await signInWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user
      
      const usuarioAutenticado = { 
        nome: user.displayName || "Cliente", 
        email: user.email, 
        isGuest: false 
      }
      
      setUsuarioLogado(usuarioAutenticado)
      setUserPoints(150) 
      
      // Executa validação de privilégios de Admin
      const isAdmin = verificarRedirecionamentoAdmin(user.email);
      
      if (!isAdmin) {
        setToastMessage(`Bem-vindo de volta, ${usuarioAutenticado.nome}!`)
        onClose()
      }
    } catch (error) {
      console.error(error)
      setShowToast(false)
      alert("Erro na autenticação: Verifique o e-mail e a senha informados.")
    }
  }

  const handleCadastroPreSubmit = async (e) => {
    e.preventDefault()
    if (!nome || !email || !senha || !telefone) {
      alert("Preencha todos os campos obrigatórios!")
      return
    }
    if (senha.length < 6) {
      alert("A senha precisa ter no mínimo 6 caracteres!")
      return
    }

    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString()
    setCodigoGerado(novoCodigo)
    setEnviandoEmail(true)

    const templateParams = {
      nome: nome,
      to_email: email, 
      codigo: novoCodigo
    }

    try {
      await emailjs.send(
        'service_hxxl9ld', 
        'template_c33uioi', 
        'templateParams', 
        'byNAlBbaYRnaPw5O7'
      )

      setToastMessage("Código enviado para o seu e-mail!")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      setTela('verificar_codigo')
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error)
      alert("Falha ao enviar o código para o e-mail. Verifique as credenciais.")
    } finally {
      setEnviandoEmail(false)
    }
  }

  const handleVerificarCodigoSubmit = async (e) => {
    e.preventDefault()
    if (codigoSMS !== codigoGerado) {
      alert("Código de verificação incorreto!")
      return
    }

    try {
      setToastMessage("Criando conta no Firebase...")
      setShowToast(true)
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      await updateProfile(userCredential.user, { displayName: nome })
      
      setUsuarioLogado({ nome: nome, email: email, isGuest: false })
      setUserPoints(100) 
      
      const isAdmin = verificarRedirecionamentoAdmin(email);
      
      if (!isAdmin) {
        setToastMessage(`Bem-vindo ${nome}! Conta criada com sucesso.`)
        onClose()
      }
    } catch (error) {
      console.error(error)
      setShowToast(false)
      alert(`Erro ao criar conta: ${error.message}`)
      setTela('cadastro')
    }
  }

  const handleRecuperarSenhaSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      alert("Introduza o seu e-mail cadastrado!")
      return
    }

    try {
      setToastMessage("Enviando e-mail de redefinição...")
      setShowToast(true)
      
      await sendPasswordResetEmail(auth, email)
      
      setToastMessage(`Link de recuperação enviado para: ${email}`)
      setTimeout(() => { 
        setShowToast(false)
        setTela('login')
      }, 4000)
    } catch (error) {
      console.error(error)
      setShowToast(false)
      alert("Não foi possível processar a recuperação. Verifique o e-mail digitado.")
    }
  }

  return (
    <motion.div 
      className="auth-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', perspective: 1000
      }}
    >
      <motion.div 
        className="auth-modal-card"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        style={{
          background: '#18181b', padding: '40px', borderRadius: '20px',
          width: '100%', maxWidth: '440px', border: '1px solid #27272a',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', position: 'relative',
          rotateX, rotateY, transformStyle: 'preserve-3d'
        }}
        onMouseMove={handleMouseMove3D}
        onMouseLeave={handleMouseLeave3D}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px', background: 'transparent',
            border: 'none', color: '#a1a1aa', fontSize: '18px', cursor: 'pointer', zIndex: 10
          }}
        >
          ✕
        </button>

        {tela === 'inicio' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '10px', textAlign: 'center', fontWeight: '700' }}>
              Como deseja prosseguir?
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>
              Faça login ou cadastre-se para acumular pontos de fidelidade e ganhar descontos exclusivos.
            </p>
            <button 
              onClick={() => setTela('login')}
              style={{
                width: '100%', padding: '14px', background: '#FFC72C', border: 'none',
                borderRadius: '10px', color: '#000', fontWeight: 'bold', fontSize: '16px',
                cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <span>🔑</span> Entrar com minha conta
            </button>
            <button 
              onClick={() => setTela('cadastro')}
              style={{
                width: '100%', padding: '14px', background: 'transparent', border: '2px solid #27272a',
                borderRadius: '10px', color: '#fff', fontWeight: '600', fontSize: '16px',
                cursor: 'pointer', marginBottom: '24px'
              }}
            >
              Criar nova conta rápida
            </button>
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#4b5563' }}>
              <hr style={{ flex: 1, border: '0', borderTop: '1px solid #27272a' }} />
              <span style={{ padding: '0 10px', fontSize: '12px', color: '#71717a' }}>OU SE PREFERIR</span>
              <hr style={{ flex: 1, border: '0', borderTop: '1px solid #27272a' }} />
            </div>
            <button 
              onClick={() => {
                setUsuarioLogado({ nome: "Convidado", email: "guest@fome.com", isGuest: true })
                setToastMessage("Acedendo como Convidado!")
                setShowToast(true)
                setTimeout(() => setShowToast(false), 3000)
                onClose()
              }}
              style={{
                width: '100%', padding: '12px', background: '#27272a', border: 'none',
                borderRadius: '10px', color: '#a1a1aa', fontWeight: '500', fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Continuar apenas como Convidado 🏃💨
            </button>
          </motion.div>
        )}

        {tela === 'login' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '6px', fontWeight: '700' }}>
              Acesse sua Conta
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>
              Insira as suas credenciais de acesso abaixo.
            </p>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#e4e4e7', fontSize: '14px' }}>E-mail</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#e4e4e7', fontSize: '14px' }}>Senha Secreta</label>
                  <span onClick={() => setTela('recuperar')} style={{ color: '#FFC72C', fontSize: '12px', cursor: 'pointer' }}>Esqueceu a senha?</span>
                </div>
                <input 
                  type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}
                />
              </div>
              <button 
                type="submit"
                style={{ width: '100%', padding: '14px', background: '#FFC72C', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
              >
                Autenticar e Entrar
              </button>
            </form>
            <p style={{ color: '#71717a', fontSize: '14px', marginTop: '20px', textAlign: 'center' }}>
              Não tem conta? <span onClick={() => setTela('cadastro')} style={{ color: '#FFC72C', cursor: 'pointer', fontWeight: '500' }}>Cadastre-se</span>
            </p>
            <p onClick={() => setTela('inicio')} style={{ color: '#a1a1aa', fontSize: '12px', marginTop: '12px', textAlign: 'center', cursor: 'pointer' }}>
              ← Voltar para as opções
            </p>
          </motion.div>
        )}

        {tela === 'cadastro' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '6px', fontWeight: '700' }}>
              Crie a sua Conta
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '20px' }}>
              Um código de verificação real será enviado ao seu e-mail.
            </p>
            <form onSubmit={handleCadastroPreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#e4e4e7', fontSize: '13px' }}>Seu Nome Completo</label>
                <input 
                  type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como gostaria de ser chamado"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#e4e4e7', fontSize: '13px' }}>Endereço de E-mail</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#e4e4e7', fontSize: '13px' }}>Telefone / WhatsApp</label>
                <input 
                  type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Ex: 923 000 000"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#e4e4e7', fontSize: '13px' }}>Defina uma Senha</label>
                <input 
                  type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}
                />
              </div>
              <button 
                type="submit"
                disabled={enviandoEmail}
                style={{ width: '100%', padding: '12px', background: '#FFC72C', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '6px', opacity: enviandoEmail ? 0.6 : 1 }}
              >
                {enviandoEmail ? "Enviando Código..." : "Enviar Código p/ E-mail"}
              </button>
            </form>
            <p style={{ color: '#71717a', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>
              Já possui conta cadastrada? <span onClick={() => setTela('login')} style={{ color: '#FFC72C', cursor: 'pointer', fontWeight: '500' }}>Faça Login</span>
            </p>
          </motion.div>
        )}

        {tela === 'verificar_codigo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '6px', fontWeight: '700' }}>
              Verifique seu E-mail
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '20px' }}>
              Introduza o código de 6 dígitos enviado para o seu e-mail cadastrado.
            </p>
            <form onSubmit={handleVerificarCodigoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#e4e4e7', fontSize: '14px' }}>Código de 6 Dígitos</label>
                <input 
                  type="text" maxLength={6} value={codigoSMS} onChange={(e) => setCodigoSMS(e.target.value)} placeholder="000000"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', outline: 'none', letterSpacing: '0.3em', textAlign: 'center', fontSize: '18px' }}
                />
              </div>
              <button 
                type="submit"
                style={{ width: '100%', padding: '14px', background: '#FFC72C', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
              >
                Concluir Cadastro e Entrar
              </button>
            </form>
            <p onClick={() => setTela('cadastro')} style={{ color: '#FFC72C', fontSize: '14px', marginTop: '20px', textAlign: 'center', cursor: 'pointer', fontWeight: '500' }}>
              Voltar e corrigir dados
            </p>
          </motion.div>
        )}

        {tela === 'recuperar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '6px', fontWeight: '700' }}>
              Recuperar Senha
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '20px' }}>
              Insira o seu e-mail cadastrado. Enviaremos um link seguro do Firebase para redefinição.
            </p>
            <form onSubmit={handleRecuperarSenhaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#e4e4e7', fontSize: '14px' }}>E-mail de Cadastro</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}
                />
              </div>
              <button 
                type="submit"
                style={{ width: '100%', padding: '14px', background: '#FFC72C', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
              >
                Disparar Link de Recuperação
              </button>
            </form>
            <p onClick={() => setTela('login')} style={{ color: '#FFC72C', fontSize: '14px', marginTop: '20px', textAlign: 'center', cursor: 'pointer', fontWeight: '500' }}>
              Voltar para o Login
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

function App() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cart, setCart] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [nextCartId, setNextCartId] = useState(1)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userPoints, setUserPoints] = useState(150) 
  
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [telaModal, setTelaModal] = useState('inicio') 
  const [usuarioLogado, setUsuarioLogado] = useState(null) 

  const footerRef = useRef(null)
  const sec2Ref = useRef(null)
  const isFooterInView = useInView(footerRef, { once: true, amount: 0.3 })
  const isSec2InView = useInView(sec2Ref, { once: true, amount: 0.2 })

  const headerBg = useTransform(scrollY, [0, 80], ["rgba(0,0,0,0)", "rgba(0,0,0,0.72)"])
  const headerBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(16px)"])
  const headerPy = useTransform(scrollY, [0, 80], [40, 18])

  useEffect(() => {
    return scrollY.onChange((v) => setScrolled(v > 30))
  }, [scrollY])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % textSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const addToCart = (produto) => {
    const existingItem = cart.find(item => item.id === produto.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === produto.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
      setToastMessage(`${produto.name} quantidade aumentada!`)
    } else {
      setCart([...cart, { ...produto, cartId: nextCartId, quantity: 1 }])
      setNextCartId(nextCartId + 1)
      setToastMessage(`${produto.name} adicionado ao carrinho!`)
    }
    
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.cartId !== cartId))
    } else {
      setCart(cart.map(item => 
        item.cartId === cartId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const removeItem = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId))
    setToastMessage(`Item removido do carrinho!`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleCheckout = () => {
    if (!usuarioLogado) {
      setIsCartOpen(false) 
      setTelaModal('inicio')
      setShowAuthModal(true) 
      return
    }

    const totalPontos = cart.reduce((sum, item) => sum + (item.pontos * item.quantity), 0)
    setUserPoints(userPoints + totalPontos)
    setCart([])
    setIsCartOpen(false)
    setToastMessage(`Pedido finalizado! Você ganhou ${totalPontos} pontos!`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -24, filter: "blur(6px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)", 
      transition: { type: "spring", stiffness: 260, damping: 22 } 
    },
  }
  
  const formatPrice = (price) => {
    return price.toLocaleString('pt-AO') + ' Kz'
  }
  
  return (
    <section id='home'>
      <section id="inicio">
        <motion.header
          className={`animated-header${scrolled ? " scrolled" : ""}`}
          style={{
            backgroundColor: headerBg,
            backdropFilter: headerBlur,
            paddingTop: headerPy,
            paddingBottom: headerPy,
          }}
        >
          <motion.div
            id='logo'
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            whileHover={{ scale: 1.07, rotate: -2 }}
          >
            <img src={Logo} alt="Logo" />
          </motion.div>

          <motion.div className="points-display">
            <span className="points-icon">⭐</span>
            <span className="points-value">{userPoints}</span>
          </motion.div>

          <motion.nav variants={containerVariants} initial="hidden" animate="visible">
            {navLinks.map(({ label, href }) => (
              <motion.div key={label} variants={itemVariants}>
                <MagneticLink href={href}>{label}</MagneticLink>
              </motion.div>
            ))}
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.55 }}
            className="header-actions"
          >
            <CartButton cartItems={cart} onOpenCart={() => setIsCartOpen(true)} />
            
            {!usuarioLogado ? (
              <RestrictedButton onClick={() => { setTelaModal('inicio'); setShowAuthModal(true); }} />
            ) : (
              <motion.div 
                className="user-profile-header"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px' }}
              >
                <div className="user-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFC72C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>
                  {usuarioLogado.nome.charAt(0).toUpperCase()}
                </div>
                <span className="user-name" style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                  {usuarioLogado.nome}
                </span>
                <button 
                  className="btn-logout" 
                  onClick={() => { setUsuarioLogado(null); setUserPoints(0); }}
                  style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', marginLeft: '4px' }}
                >
                  Sair
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.header>

        <main>
          <div id="main">
            <div id="principal">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.6
                  }}
                >
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    {textSlides[currentIndex].h1}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {textSlides[currentIndex].p}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <Link to="/pedido" className='peca_ja'>{textSlides[currentIndex].buttonText}</Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>

        <footer ref={footerRef}>
          <motion.div
            id='principal'
            initial={{ opacity: 0, y: 80 }}
            animate={isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
          >
            <motion.div
              className="combos"
              initial={{ opacity: 0, x: -50 }}
              animate={isFooterInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.4 }}
            >
              <motion.div
                className="img-combos"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img src={Combo} alt="Combo" />
              </motion.div>
              <motion.div
                className="text-combos"
                initial={{ opacity: 0 }}
                animate={isFooterInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3>Combo</h3>
                <p>O combo perfeito para matar a fome e a sede.</p>
              </motion.div>
            </motion.div>
            <motion.div
              className="bebidas"
              initial={{ opacity: 0, y: 30 }}
              animate={isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
            >
              <motion.div
                className="img-bebidas"
                whileHover={{ rotate: -5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img src={Bebida} alt="Bebida" />
              </motion.div>
              <motion.div
                className="text-bebidas"
                initial={{ opacity: 0 }}
                animate={isFooterInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3>Bebidas</h3>
                <p>Faça a escolha perfeita e mate sua sede</p>
              </motion.div>
            </motion.div>
            <motion.div
              className="link"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isFooterInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.8 }}
              whileHover={{ scale: 1.1 }}
            >
              <Link to="/pedido" className='peca_ja'>Peça já</Link>
            </motion.div>
          </motion.div>
        </footer>
      </section>

      <section id="sec2" ref={sec2Ref}>
        <motion.div 
          className="container-sec2"
          initial={{ opacity: 0, y: 50 }}
          animate={isSec2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="header-sec2"
            initial={{ opacity: 0, y: 30 }}
            animate={isSec2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2>🔥 Ofertas Imperdíveis</h2>
            <p>Produtos selecionados com discounts especiais por tempo limitado!</p>
          </motion.div>

          <div className="cards-container">
            {produtosPromocao.map((produto, index) => (
              <motion.div 
                key={produto.id}
                className="card"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={isSec2InView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 50 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="card-badge">-{produto.desconto}% OFF</div>
                <div className="card-points-badge">+{produto.pontos} pts</div>
                <div className="card-image">
                  <img src={produto.imagem} alt={produto.name} />
                </div>
                <div className="card-content">
                  <span className="card-categoria">{produto.categoria}</span>
                  <h3>{produto.name}</h3>
                  <p className="card-descricao">{produto.descricao}</p>
                  <div className="card-prices">
                    <span className="preco-original">{formatPrice(produto.precoOriginal)}</span>
                    <span className="preco-promocional">{formatPrice(produto.precoPromocional)}</span>
                  </div>
                  <div className="card-points">
                    <span>⭐</span> Ganhe {produto.pontos} pontos
                  </div>
                  <motion.button 
                    className="btn-add-cart"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(produto)}
                  >
                    🛒 Adicionar ao carrinho
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {isCartOpen && (
          <CartModal 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onCheckout={handleCheckout}
            userPoints={userPoints}
            formatPrice={formatPrice}
            usuarioLogado={usuarioLogado}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            tela={telaModal}
            setTela={setTelaModal}
            setUsuarioLogado={setUsuarioLogado}
            setUserPoints={setUserPoints}
            setToastMessage={(msg) => setToastMessage(msg)}
            setShowToast={setShowToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            className="toast-notification"
            initial={{ opacity: 0, x: -50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <span>✅</span>
            <p>{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/pedido" element={<Pedido />} />
        <Route path="/area_restrita" element={<AreaRestrita />} />
      </Routes>
    </section> 
  )
}

export default App
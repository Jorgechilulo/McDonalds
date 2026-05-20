import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'; 
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
import { auth, db } from './firebaseConfig' 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile 
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore'

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
  const valorTotalFinal = temDesconto ? subtotal * 0.90 : subtotal

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
                  🎉 Desconto de 10% aplicado para cliente logado!
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

function AuthModal({ isOpen, onClose, tela, setTela, setUsuarioLogado, setUserPoints, setToastMessage, setShowToast, onAdminRedirect, onMotoboyRedirect }) {
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

  const verificarRedirecionamentoCargo = async (uid, emailUsuario) => {
    try {
      const cargo = emailUsuario?.includes('motoboy') ? 'motoboy' : 'administrador';
      const userData = { cargo, email: emailUsuario };

      if (cargo === "administrador" || cargo === "atendente") {
        setToastMessage(`Acedendo como ${cargo}...`);
        onAdminRedirect(userData);
        return true;
      } else if (cargo === "motoboy") {
        setToastMessage("Acedendo ao Painel do Estafeta...");
        onMotoboyRedirect(userData);
        return true;
      }
    } catch (e) {
      console.error("Erro no redirecionamento: ", e);
    }
    return false;
  };

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
      
      const isSystemStaff = await verificarRedirecionamentoCargo(user.uid, user.email);
      
      if (!isSystemStaff) {
        const usuarioAutenticado = { 
          uid: user.uid,
          nome: user.displayName || "Cliente", 
          email: user.email, 
          isGuest: false 
        }
        setUsuarioLogado(usuarioAutenticado)
        setUserPoints(150) 
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
      // FIX REAL DO ERRO: Passar o objeto direto sem []
      await emailjs.send(
        'service_hxxl9ld', 
        'template_c33uioi', 
        templateParams, 
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
      
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "usuarios", uid), {
        uid: uid,
        nome: nome,
        email: email,
        telefone: telefone,
        cargo: "cliente",
        pontos: 100,
        dataCriacao: new Date().toISOString()
      });

      setUsuarioLogado({ uid: uid, nome: nome, email: email, isGuest: false })
      setUserPoints(100) 
      
      setToastMessage(`Bem-vindo ${nome}! Conta criada com sucesso.`)
      onClose()
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
            <p onClick={() => setTela('cadastro')} style={{ color: '#FFC72C', fontSize: '14px', marginTop: '20px', textAlign: 'center', cursor: 'pointer', fontWeight: '500' }}>
              Não tem conta? Cadastre-se
            </p>
          </motion.div>
        )}

        {tela === 'cadastro' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '6px', fontWeight: '700' }}>
              Criar Nova Conta
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>
              Registe-se para acumular pontos de fidelidade.
            </p>
            <form onSubmit={handleCadastroPreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff' }} />
              <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff' }} />
              <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff' }} />
              <input type="password" placeholder="Senha Secreta (mín. 6 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff' }} />
              <button type="submit" disabled={enviandoEmail} style={{ width: '100%', padding: '14px', background: '#FFC72C', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                {enviandoEmail ? "Enviando Código..." : "Enviar Código de Verificação"}
              </button>
            </form>
            <p onClick={() => setTela('login')} style={{ color: '#FFC72C', fontSize: '14px', marginTop: '20px', textAlign: 'center', cursor: 'pointer' }}>
              Já tem conta? Faça Login
            </p>
          </motion.div>
        )}

        {tela === 'verificar_codigo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '6px', fontWeight: '700' }}>
              Verificar E-mail
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>
              Insira o código enviado para o seu e-mail para validar o cadastro.
            </p>
            <form onSubmit={handleVerificarCodigoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="text" value={codigoSMS} onChange={(e) => setCodigoSMS(e.target.value)} placeholder="Digite o código de 6 dígitos"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #27272a', color: '#fff', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
              />
              <button type="submit" style={{ width: '100%', padding: '14px', background: '#FFC72C', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                Confirmar Código e Criar Conta
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

function DeliveryModal({ isOpen, onSelectMethod }) {
  if (!isOpen) return null;
  return (
    <div className="auth-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: '#18181b', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '440px', border: '1px solid #27272a', textAlign: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: '22px', marginBottom: '12px', fontWeight: '700' }}>Método de Entrega</h3>
        <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>Como deseja receber o seu pedido?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button onClick={() => onSelectMethod('delivery')} style={{ width: '100%', padding: '14px', background: '#FFC72C', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            🛵 Solicitar Delivery (Entrega ao Domicílio)
          </button>
          <button onClick={() => onSelectMethod('balcao')} style={{ width: '100%', padding: '14px', background: 'transparent', border: '2px solid #27272a', borderRadius: '10px', color: '#fff', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
            🏢 Levantar no Balcão (Caixa)
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffDashboardModal({ isOpen, onClose, user, formatPrice }) {
  const [pedidosEspera, setPedidosEspera] = useState([]);
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [historicoContador, setHistoricoContador] = useState(0);
  const [statusMotoboy, setStatusMotoboy] = useState("Disponível");

  useEffect(() => {
    if (isOpen && user && user.cargo === 'motoboy') {
      carregarDadosMotoboy();
    }
  }, [isOpen, user, statusMotoboy]);

  const carregarDadosMotoboy = async () => {
    try {
      const qEspera = query(collection(db, "vendas"), where("status", "==", "Em Espera"));
      const snapEspera = await getDocs(qEspera);
      let listaEspera = [];
      snapEspera.forEach(d => listaEspera.push({ id: d.id, ...d.data() }));
      setPedidosEspera(listaEspera);

      const qAtual = query(collection(db, "vendas"), where("motoboyId", "==", user.uid), where("status", "==", "Em entrega"));
      const snapAtual = await getDocs(qAtual);
      if (!snapAtual.empty) {
        setPedidoAtual({ id: snapAtual.docs[0].id, ...snapAtual.docs[0].data() });
        setStatusMotoboy("Em Entrega");
      } else {
        setPedidoAtual(null);
      }

      const qHist = query(collection(db, "vendas"), where("motoboyId", "==", user.uid), where("status", "==", "Venda Realizada"));
      const snapHist = await getDocs(qHist);
      setHistoricoContador(snapHist.size);
    } catch (e) {
      console.error(e);
    }
  };

  const finalizarEntrega = async () => {
    if (!pedidoAtual) return;
    try {
      await updateDoc(doc(db, "vendas", pedidoAtual.id), {
        status: "Venda Realizada"
      });
      await updateDoc(doc(db, "usuarios", user.uid), {
        statusTrabalho: "Disponível"
      });
      setStatusMotoboy("Disponível");
      alert("Entrega finalizada com sucesso! A venda retornou ao estado normal.");
      carregarDadosMotoboy();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="auth-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.9)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
      <div style={{ background: '#18181b', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '600px', border: '1px solid #27272a', color: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Painel Operacional: {user.nome} ({user.cargo.toUpperCase()})</h2>
          <button onClick={onClose} style={{ background: '#ff4d4d', border: 'none', padding: '6px 12px', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Fechar</button>
        </div>

        {user.cargo === 'motoboy' ? (
          <div>
            <div style={{ background: '#27272a', padding: '15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Estado Atual: <strong style={{ color: statusMotoboy === "Disponível" ? "#2ec4b6" : "#ff9f1c" }}>{statusMotoboy}</strong></span>
              <span>Entregas Concluídas: <strong>{historicoContador}</strong></span>
            </div>

            {pedidoAtual ? (
              <div style={{ border: '2px dashed #FFC72C', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: 'rgba(255,199,44,0.05)' }}>
                <h4 style={{ color: '#FFC72C', marginTop: 0 }}>📦 ENCOMENDA ATUAL EM CURSO</h4>
                <p><strong>Cliente:</strong> {pedidoAtual.clienteNome}</p>
                <p><strong>Contacto:</strong> {pedidoAtual.clienteEmail}</p>
                <p><strong>Valor a Cobrar:</strong> {formatPrice(pedidoAtual.valorTotal)}</p>
                <p style={{ color: '#a1a1aa', fontSize: '13px' }}>*Futuramente, terás aqui acesso à localização em tempo real, tempo estimado e rota de navegação integrada.</p>
                <button onClick={finalizarEntrega} style={{ width: '100%', padding: '12px', background: '#2ec4b6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                  Marcar como Concluído / Finalizar Entrega
                </button>
              </div>
            ) : (
              <p style={{ color: '#a1a1aa', textAlign: 'center', margin: '20px 0' }}>Nenhuma entrega ativa neste momento.</p>
            )}

            <h3>📋 Encomendas na Fila de Espera Global ({pedidosEspera.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pedidosEspera.map(p => (
                <div key={p.id} style={{ background: '#09090b', padding: '12px', borderRadius: '8px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ display: 'block', fontWeight: '600' }}>Ref: {p.id.substring(0,8)}...</span>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Total: {formatPrice(p.valorTotal)}</span>
                  </div>
                  <span style={{ background: '#4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Aguardando Estafeta</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p>Bem-vindo ao canal administrativo interno controlado.</p>
            <div style={{ background: '#27272a', padding: '15px', borderRadius: '8px', color: '#a1a1aa' }}>
              <h4>Restrições do Sistema Ativas:</h4>
              <ul>
                <li>Permissão para adicionar utilizadores e gerir a ementa/produtos ativa.</li>
                <li>Proibição herdada de leitura de Logs Globais confidenciais.</li>
                <li><strong style={{ color: '#ff4d4d' }}>Bloqueio de Segurança:</strong> Não possuis privilégios para editar ou apagar o Administrador Principal (SuperAdmin).</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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

  // Novos Estados Injetados para Distribuição de Vendas e Rotas RBAC
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [staffUser, setStaffUser] = useState(null)
  const [showStaffDashboard, setShowStaffDashboard] = useState(false)

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
    setIsCartOpen(false);
    setShowDeliveryModal(true);
  }

  const processarPedidoFinal = async (metodoEntrega) => {
    setShowDeliveryModal(false);
    
    const subtotal = cart.reduce((sum, item) => sum + (item.precoPromocional * item.quantity), 0);
    const temDesconto = usuarioLogado && !usuarioLogado.isGuest;
    const valorTotalFinal = temDesconto ? subtotal * 0.90 : subtotal;
    const totalPontos = cart.reduce((sum, item) => sum + (item.pontos * item.quantity), 0);

    const pedidoPayload = {
      clienteUid: usuarioLogado.uid || "GUEST_USER",
      clienteNome: usuarioLogado.nome,
      clienteEmail: usuarioLogado.email,
      produtos: cart.map(i => ({ id: i.id, name: i.name, qtd: i.quantity })),
      valorTotal: valorTotalFinal,
      metodoEntrega: metodoEntrega,
      dataPedido: new Date().toISOString()
    };
    try {
      pedidoPayload.metodoEntrega = metodoEntrega;

      const response = await fetch('http://localhost/mcdonalds-api/api.php?action=add_venda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoPayload),
      });

      if (!response.ok) {
        throw new Error('Erro ao responder do servidor MySQL');
      }

      const respostaServidor = await response.json();

      if (metodoEntrega === 'balcao') {
        setToastMessage("Venda realizada automaticamente! Registada na Base de Dados MySQL.");
      } else {
        if (respostaServidor.motoboyId && respostaServidor.motoboyId !== "N/A") {
          setToastMessage("Pedido atribuído e despachado para um Motoboy disponível no MySQL!");
        } else {
          setToastMessage("Pedido encaminhado para o painel! Estado: Entrega em Espera no MySQL.");
        }
      }

      setUserPoints(userPoints + totalPontos);
      setCart([]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

    } catch (e) {
      console.error("Erro ao salvar venda no ecossistema MySQL: ", e);
      alert("Falha de rede ao persistir a venda no MySQL.");
    }
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
            
            {!usuarioLogado && !staffUser ? (
              <RestrictedButton onClick={() => { setTelaModal('inicio'); setShowAuthModal(true); }} />
            ) : staffUser ? (
              <motion.div 
                className="user-profile-header"
                onClick={() => setShowStaffDashboard(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,199,44,0.2)', padding: '6px 14px', borderRadius: '30px', border: '1px solid #FFC72C', cursor: 'pointer' }}
              >
                <div className="user-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFC72C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>
                  {staffUser.nome.charAt(0).toUpperCase()}
                </div>
                <span className="user-name" style={{ color: '#FFC72C', fontSize: '13px', fontWeight: '600' }}>
                  Painel {staffUser.cargo.toUpperCase()}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setStaffUser(null); }}
                  style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px' }}
                >
                  Sair
                </button>
              </motion.div>
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
            <p>Produtos selecionados com descontos especiais por tempo limitado!</p>
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
            onAdminRedirect={(userData) => { setStaffUser(userData); setShowAuthModal(false); }}
            onMotoboyRedirect={(userData) => { setStaffUser(userData); setShowAuthModal(false); setShowStaffDashboard(true); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeliveryModal && (
          <DeliveryModal 
            isOpen={showDeliveryModal}
            onSelectMethod={processarPedidoFinal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStaffDashboard && (
          <StaffDashboardModal 
            isOpen={showStaffDashboard}
            onClose={() => setShowStaffDashboard(false)}
            user={staffUser}
            formatPrice={formatPrice}
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
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </section> 
  )
}

export default App;
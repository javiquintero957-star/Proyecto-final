import { reactive, ref } from 'vue'

const API_URL = 'http://localhost:8080/api/auth'

export default {
  setup(_, { emit }) {
    const tab          = ref('login')
    const loading      = ref(false)
    const showLoginPwd = ref(false)
    const showRegPwd   = ref(false)

    const login    = reactive({ email: '', password: '' })
    const register = reactive({ nombre: '', email: '', password: '' })

    const loginError    = reactive({ email: '', password: '', general: '' })
    const registerError = reactive({ nombre: '', email: '', password: '', general: '' })
    const toast         = reactive({ visible: false, message: '' })

    function showToast(msg) {
      toast.message = msg
      toast.visible = true
      setTimeout(() => { toast.visible = false }, 3000)
    }

    async function doLogin() {
      loginError.email = ''; loginError.password = ''; loginError.general = ''
      let valid = true
      if (!login.email) { loginError.email = 'El email es requerido.'; valid = false }
      else if (!/\S+@\S+\.\S+/.test(login.email)) { loginError.email = 'Email inválido.'; valid = false }
      if (!login.password) { loginError.password = 'La contraseña es requerida.'; valid = false }
      if (!valid) return

      loading.value = true
      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: login.email, password: login.password })
        })
        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('coctel_session', JSON.stringify(data))
          showToast('Inicio de sesión exitoso 🎉')
          setTimeout(() => emit('navigate', 'dashboard'), 1200)
        } else {
          loginError.general = 'Credenciales incorrectas. Verifica tu email y contraseña.'
        }
      } catch {
        loginError.general = 'No se pudo conectar al servidor. Intenta más tarde.'
      } finally {
        loading.value = false
      }
    }

    async function doRegister() {
      registerError.nombre = ''; registerError.email = ''; registerError.password = ''; registerError.general = ''
      let valid = true
      if (!register.nombre.trim()) { registerError.nombre = 'El nombre es requerido.'; valid = false }
      if (!register.email) { registerError.email = 'El email es requerido.'; valid = false }
      else if (!/\S+@\S+\.\S+/.test(register.email)) { registerError.email = 'Email inválido.'; valid = false }
      if (!register.password || register.password.length < 6) { registerError.password = 'Mínimo 6 caracteres.'; valid = false }
      if (!valid) return

      loading.value = true
      try {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: register.nombre, email: register.email, password: register.password })
        })
        if (res.ok) {
          showToast('Cuenta creada exitosamente ✅')
          tab.value = 'login'
        } else {
          const msg = await res.text()
          registerError.general = msg || 'No se pudo crear la cuenta. Intenta de nuevo.'
        }
      } catch {
        registerError.general = 'No se pudo conectar al servidor. Intenta más tarde.'
      } finally {
        loading.value = false
      }
    }

    return {
      tab,
      loading,
      showLoginPwd,
      showRegPwd,
      login,
      register,
      loginError,
      registerError,
      toast,
      doLogin,
      doRegister
    }
  }
}

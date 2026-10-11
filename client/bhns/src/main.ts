import './main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.router'
import axios from 'axios'

const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Expired/invalid token on a protected call -> back to login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = /\/api\/(login|register)\//.test(error.config?.url ?? '')
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh')
      localStorage.removeItem('role')
      delete axios.defaults.headers.common['Authorization']
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)
app.use(router)
app.mount('#app')
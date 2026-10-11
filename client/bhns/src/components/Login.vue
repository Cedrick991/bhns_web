<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) return

  try {
    isSubmitting.value = true
    error.value = ''

    const response = await axios.post('/api/login/', {
      username: username.value,
      password: password.value
    })

    const { access, refresh } = response.data.tokens
    localStorage.setItem('token', access)
    localStorage.setItem('refresh', refresh)
    localStorage.setItem('role', response.data.account.role)

    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
    router.push('/rooms')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">BHNS Login</h2>

      <div v-if="$route.query.registered" class="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm text-center">
        Account created. You can sign in now.
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-md font-medium transition-colors mt-2"
        >
          {{ isSubmitting ? 'Authenticating...' : 'Sign In' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-center text-gray-600">
        No account yet?
        <RouterLink to="/register" class="text-emerald-600 font-medium hover:underline">Register</RouterLink>
      </p>
    </div>
  </div>
</template>
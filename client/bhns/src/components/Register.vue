<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const form = ref({
  username: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  contact_number: '',
  role: 'tenant',
  passcode: '',
  password: '',
  confirm_password: ''
})
const error = ref('')
const isSubmitting = ref(false)

const handleRegister = async () => {
  error.value = ''

  if (form.value.password !== form.value.confirm_password) {
    error.value = 'Passwords do not match.'
    return
  }
  if (form.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  try {
    isSubmitting.value = true
    const payload: Record<string, string> = {
      username: form.value.username,
      first_name: form.value.first_name,
      middle_name: form.value.middle_name,
      last_name: form.value.last_name,
      contact_number: form.value.contact_number,
      password: form.value.password,
      role: form.value.role
    }
    if (form.value.role === 'landlord') {
      payload.passcode = form.value.passcode
    }

    await axios.post('/api/register/', payload)
    router.push({ name: 'login', query: { registered: '1' } })
  } catch (err: any) {
    const data = err.response?.data
    if (data && typeof data === 'object') {
      error.value = Object.entries(data)
        .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(' ') : msg}`)
        .join(' | ')
    } else {
      error.value = 'Registration failed. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Create Account</h2>

      <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
          <select v-model="form.role" class="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>

        <div v-if="form.role === 'landlord'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Landlord Passcode</label>
          <input v-model="form.passcode" type="password" inputmode="numeric" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input v-model="form.username" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input v-model="form.first_name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input v-model="form.last_name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name (optional)</label>
          <input v-model="form.middle_name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input v-model="form.contact_number" type="tel" placeholder="09XXXXXXXXX" maxlength="15" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="form.password" type="password" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input v-model="form.confirm_password" type="password" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
        </div>
        <button type="submit" :disabled="isSubmitting" class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-md font-medium transition-colors">
          {{ isSubmitting ? 'Creating...' : 'Register' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-center text-gray-600">
        Already have an account?
        <RouterLink to="/login" class="text-emerald-600 font-medium hover:underline">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>
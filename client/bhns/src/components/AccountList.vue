<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Account { id: number; username: string; first_name: string; last_name: string; contact_number: string; role: string; }

const accounts = ref<Account[]>([])
const loading = ref(true)

const newAccount = ref({ username: '', first_name: '', last_name: '', contact_number: '', role: 'tenant', password: '' })
const isSubmitting = ref(false)

const fetchAccounts = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/accounts/')
    accounts.value = response.data
  } catch (err: any) { console.error(err) } finally { loading.value = false }
}

const addAccount = async () => {
  try {
    isSubmitting.value = true
    const response = await axios.post('/api/accounts/', newAccount.value)
    accounts.value.push(response.data)
    newAccount.value = { username: '', first_name: '', last_name: '', contact_number: '', role: 'tenant', password: '' }
  } catch (err: any) {
    console.error('Failed to add account:', err)
    alert('Error creating account. Ensure username is unique.')
  } finally { isSubmitting.value = false }
}

onMounted(() => fetchAccounts())
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">User Accounts</h2>
      <form @submit.prevent="addAccount" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div><label class="block text-xs font-medium text-gray-600 mb-1">Username</label><input v-model="newAccount.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
        <div><label class="block text-xs font-medium text-gray-600 mb-1">First Name</label><input v-model="newAccount.first_name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
        <div><label class="block text-xs font-medium text-gray-600 mb-1">Last Name</label><input v-model="newAccount.last_name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
        <div><label class="block text-xs font-medium text-gray-600 mb-1">Contact</label><input v-model="newAccount.contact_number" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
        <div><label class="block text-xs font-medium text-gray-600 mb-1">Role</label>
          <select v-model="newAccount.role" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>
        <div><label class="block text-xs font-medium text-gray-600 mb-1">Password</label><input v-model="newAccount.password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
        <div class="md:col-span-3 flex justify-end">
          <button type="submit" :disabled="isSubmitting" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md font-medium">{{ isSubmitting ? 'Saving...' : 'Create Account' }}</button>
        </div>
      </form>
    </div>

    <div v-if="loading" class="text-gray-500 animate-pulse">Loading accounts...</div>
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="acc in accounts" :key="acc.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-900"><div class="font-medium">{{ acc.first_name }} {{ acc.last_name }}</div><div class="text-gray-500 text-xs">@{{ acc.username }}</div></td>
            <td class="px-6 py-4"><span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', acc.role === 'landlord' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800']">{{ acc.role }}</span></td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ acc.contact_number }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
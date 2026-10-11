<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Tenancy {
  id: number;
  tenant: number;
  bed: number;
  room?: number;
  check_in_date: string;
  agreed_rate: string;
}

const tenancies = ref<Tenancy[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const newTenancy = ref({
  tenant: '',
  bed: '',
  check_in_date: new Date().toISOString().split('T')[0],
  agreed_rate: ''
})
const isSubmitting = ref(false)

const fetchTenancies = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/tenancies/')
    tenancies.value = response.data
  } catch (err: any) {
    error.value = 'Failed to load tenancies.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const addTenancy = async () => {
  try {
    isSubmitting.value = true
    const response = await axios.post('/api/tenancies/create/', {
      tenant: Number(newTenancy.value.tenant),
      bed: Number(newTenancy.value.bed),
      check_in_date: newTenancy.value.check_in_date,
      agreed_rate: newTenancy.value.agreed_rate
    })
    tenancies.value.push(response.data)
    newTenancy.value.tenant = ''
    newTenancy.value.bed = ''
    newTenancy.value.agreed_rate = ''
  } catch (err: any) {
    console.error('Failed to add tenancy:', err.response?.data || err)
    alert('Error creating tenancy. Check fields.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchTenancies())
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">New Tenancy</h2>
      <form @submit.prevent="addTenancy" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tenant ID</label>
          <input v-model="newTenancy.tenant" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Bed ID</label>
          <input v-model="newTenancy.bed" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Check-in Date</label>
          <input v-model="newTenancy.check_in_date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Agreed Rate (PHP)</label>
          <input v-model="newTenancy.agreed_rate" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium"
        >
          {{ isSubmitting ? 'Saving...' : 'Create' }}
        </button>
      </form>
    </div>

    <div v-if="loading" class="text-gray-500 animate-pulse">Loading tenancies...</div>
    
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bed ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="t in tenancies" :key="t.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">#{{ t.tenant }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">Bed {{ t.bed }} (Room {{ t.room }})</td>
            <td class="px-6 py-4 text-sm text-emerald-600 font-medium">₱{{ t.agreed_rate }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ t.check_in_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
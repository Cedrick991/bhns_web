<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Invoice { id: number; tenancy_id: number; billing_month: string; }

const invoices = ref<Invoice[]>([])
const loading = ref(true)

const newInvoice = ref({ tenancy_id: '', billing_month: new Date().toISOString().slice(0, 7) + '-01' })
const isSubmitting = ref(false)

const fetchInvoices = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/invoices/')
    invoices.value = response.data
  } catch (err: any) { console.error(err) } finally { loading.value = false }
}

const addInvoice = async () => {
  try {
    isSubmitting.value = true
    const response = await axios.post('/api/invoices/create/', {
      tenancy_id: Number(newInvoice.value.tenancy_id),
      billing_month: newInvoice.value.billing_month
    })
    invoices.value.push(response.data)
    newInvoice.value.tenancy_id = ''
  } catch (err: any) { alert('Error creating invoice.') } finally { isSubmitting.value = false }
}

onMounted(() => fetchInvoices())
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Billing & Invoices</h2>
      <form @submit.prevent="addInvoice" class="flex flex-col sm:flex-row gap-3 items-end">
        <div class="flex-1"><label class="block text-xs font-medium text-gray-600 mb-1">Tenancy ID</label><input v-model="newInvoice.tenancy_id" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
        <div class="flex-1"><label class="block text-xs font-medium text-gray-600 mb-1">Billing Month</label><input v-model="newInvoice.billing_month" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
        <button type="submit" :disabled="isSubmitting" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md font-medium h-[42px]">{{ isSubmitting ? 'Creating...' : 'Generate Invoice' }}</button>
      </form>
    </div>

    <div v-if="loading" class="text-gray-500 animate-pulse">Loading invoices...</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="inv in invoices" :key="inv.id" class="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start mb-4">
          <div><span class="text-xs text-gray-400 uppercase tracking-wider">Invoice #{{ inv.id }}</span><h3 class="text-lg font-bold text-gray-800">Tenancy #{{ inv.tenancy_id }}</h3></div>
          <span class="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">{{ inv.billing_month }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface InvoiceItem {
  id: number;
  invoice_id: number;
  line_no: number;
  charge_type: string;
  amount: string;
}

const items = ref<InvoiceItem[]>([])
const loading = ref(true)

const newItem = ref({
  invoice_id: '',
  line_no: 1,
  charge_type: 'rent',
  amount: ''
})
const isSubmitting = ref(false)

const fetchItems = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/invoice-items/')
    items.value = response.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const addItem = async () => {
  try {
    isSubmitting.value = true
    const response = await axios.post('/api/invoice-items/create/', {
      invoice_id: Number(newItem.value.invoice_id),
      line_no: Number(newItem.value.line_no),
      charge_type: newItem.value.charge_type,
      amount: newItem.value.amount
    })
    items.value.push(response.data)
    newItem.value.line_no++ // Auto-increment for next item
    newItem.value.amount = ''
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchItems())
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Add Invoice Charge</h2>
      <form @submit.prevent="addItem" class="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Invoice ID</label>
          <input v-model="newItem.invoice_id" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Line No.</label>
          <input v-model="newItem.line_no" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Charge Type</label>
          <select v-model="newItem.charge_type" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
            <option value="penalty">Penalty</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Amount</label>
          <input v-model="newItem.amount" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <button type="submit" :disabled="isSubmitting" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium">
          {{ isSubmitting ? 'Adding...' : 'Add Charge' }}
        </button>
      </form>
    </div>

    <!-- Grouped by Invoice (Simplified View) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="item in items" :key="item.id" class="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
        <div>
          <span class="text-xs text-gray-400 uppercase">Invoice #{{ item.invoice_id }} - Line {{ item.line_no }}</span>
          <p class="font-bold text-gray-800 capitalize">{{ item.charge_type }}</p>
        </div>
        <span class="text-emerald-600 font-semibold">₱{{ item.amount }}</span>
      </div>
    </div>
  </div>
</template>
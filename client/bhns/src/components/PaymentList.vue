<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Payment {
  id: number;
  invoice: number;
  payment_date: string;
  amount_paid: string;
  method: string;
}

interface Invoice {
  id: number;
  tenancy_id: number;
}

const payments = ref<Payment[]>([])
const invoices = ref<Invoice[]>([])
const loading = ref(true)

const newPayment = ref({
  invoice: '',
  payment_date: new Date().toISOString().split('T')[0],
  amount_paid: '',
  method: 'cash'
})
const isSubmitting = ref(false)

const fetchData = async () => {
  try {
    loading.value = true
    const [paymentsRes, invoicesRes] = await Promise.all([
      axios.get('/api/payments/'),
      axios.get('/api/invoices/')
    ])
    payments.value = paymentsRes.data
    invoices.value = invoicesRes.data
  } catch (err: any) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const addPayment = async () => {
  try {
    isSubmitting.value = true
    const response = await axios.post('/api/payments/create/', {
      invoice: Number(newPayment.value.invoice),
      payment_date: newPayment.value.payment_date,
      amount_paid: newPayment.value.amount_paid,
      method: newPayment.value.method
    })
    payments.value.push(response.data)
    newPayment.value.invoice = ''
    newPayment.value.amount_paid = ''
  } catch (err: any) {
    alert('Error recording payment.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Record Payment</h2>
      <form @submit.prevent="addPayment" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-start">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Invoice</label>
            <select v-model="newPayment.invoice" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
              <option value="" disabled>Select Invoice</option>
              <option v-for="inv in invoices" :key="inv.id" :value="inv.id">
                #{{ inv.id }} (Tenancy {{ inv.tenancy_id }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Amount Paid (PHP)</label>
            <input v-model="newPayment.amount_paid" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
            <input v-model="newPayment.payment_date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Method</label>
            <select v-model="newPayment.method" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div v-if="['gcash', 'bank_transfer'].includes(newPayment.method)" class="mt-4 p-4 border border-emerald-100 bg-emerald-50 rounded-md flex flex-col items-center justify-center">
          <p class="text-sm font-semibold text-emerald-800 mb-2">Scan to Pay</p>
          <!-- Temporary Placeholder until the real QR is ready -->
          <div class="w-48 h-48 bg-white border border-gray-200 rounded-md shadow-sm flex items-center justify-center p-4 text-center">
            <span class="text-xs text-gray-400">QR Code Placeholder<br>(Add public/gcash_qr_code.png later)</span>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button type="submit" :disabled="isSubmitting" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md font-medium">
            {{ isSubmitting ? 'Processing...' : 'Submit Payment' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="loading" class="text-gray-500 animate-pulse">Loading payments...</div>
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Ref</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="pay in payments" :key="pay.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">Invoice #{{ pay.invoice }}</td>
            <td class="px-6 py-4 text-sm text-emerald-600 font-medium">₱{{ pay.amount_paid }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ pay.payment_date }}</td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                {{ pay.method.replace('_', ' ') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
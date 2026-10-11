<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Room { id: number; room_number: string; }
interface Bed { id: number; room_id: number; bed_label: string; is_occupied: boolean; }

const beds = ref<Bed[]>([])
const rooms = ref<Room[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const newBed = ref({ room_id: '', bed_label: '' })
const isSubmitting = ref(false)

const fetchData = async () => {
  try {
    loading.value = true
    const [bedsRes, roomsRes] = await Promise.all([
      axios.get('/api/beds/'),
      axios.get('/api/rooms/')
    ])
    beds.value = bedsRes.data
    rooms.value = roomsRes.data
  } catch (err: any) {
    error.value = 'Failed to load data.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const addBed = async () => {
  if (!newBed.value.room_id || !newBed.value.bed_label.trim()) return
  try {
    isSubmitting.value = true
    const response = await axios.post('/api/beds/create/', {
      room_id: Number(newBed.value.room_id),
      bed_label: newBed.value.bed_label
    })
    beds.value.push(response.data)
    newBed.value.bed_label = '' 
  } catch (err: any) {
    console.error('Failed to add bed:', err)
    alert('Error adding bed.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Bed Management</h2>
      <form @submit.prevent="addBed" class="flex flex-col sm:flex-row gap-3">
        <select v-model="newBed.room_id" class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" required>
          <option value="" disabled>Select Room</option>
          <option v-for="room in rooms" :key="room.id" :value="room.id">Room {{ room.room_number }}</option>
        </select>
        <input v-model="newBed.bed_label" type="text" placeholder="Bed Label (e.g., A, B, Window)" class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
        <button type="submit" :disabled="isSubmitting" class="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-2 rounded-md shadow-sm font-medium transition-colors">
          {{ isSubmitting ? 'Adding...' : 'Add Bed' }}
        </button>
      </form>
    </div>

    <div v-if="loading" class="text-gray-500 animate-pulse px-2">Loading beds...</div>
    <div v-else-if="error" class="p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">{{ error }}</div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="bed in beds" :key="bed.id" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <span class="text-xs text-gray-400 uppercase tracking-wider">Room {{ bed.room_id }}</span>
          <h3 class="text-lg font-bold text-gray-800 mb-2">Bed {{ bed.bed_label }}</h3>
        </div>
        <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-max mt-2', bed.is_occupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800']">
          {{ bed.is_occupied ? 'Occupied' : 'Available' }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Matches the exact fields from your Django RoomSerializer
interface Room {
  id: number;
  room_number: string;
}

const rooms = ref<Room[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Form state for creating a new room
const newRoomNumber = ref('')
const isSubmitting = ref(false)

const fetchRooms = async () => {
  try {
    loading.value = true
    // Matches path('rooms/', RoomListView.as_view())
    const response = await axios.get('/api/rooms/')
    rooms.value = response.data
  } catch (err: any) {
    error.value = 'Failed to load rooms. Ensure Django server is running.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const addRoom = async () => {
  if (!newRoomNumber.value.trim()) return
  
  try {
    isSubmitting.value = true
    // Matches path('rooms/create/', RoomCreate.as_view())
    const response = await axios.post('/api/rooms/create/', {
      room_number: newRoomNumber.value
    })
    
    // Add the new room directly to the UI without reloading the page
    rooms.value.push(response.data)
    newRoomNumber.value = '' 
  } catch (err: any) {
    console.error('Failed to add room:', err)
    alert('Error adding room. Check console for details.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchRooms()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header & Add Room Form -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Room Management</h2>
      
      <form @submit.prevent="addRoom" class="flex flex-col sm:flex-row gap-3">
        <input 
          v-model="newRoomNumber" 
          type="text" 
          placeholder="Enter Room Number (e.g., 101)" 
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-2 rounded-md shadow-sm font-medium transition-colors whitespace-nowrap"
        >
          {{ isSubmitting ? 'Adding...' : 'Add Room' }}
        </button>
      </form>
    </div>

    <!-- Data States -->
    <div v-if="loading" class="text-gray-500 animate-pulse px-2">
      Loading rooms...
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">
      {{ error }}
    </div>
    
    <div v-else-if="rooms.length === 0" class="text-gray-500 px-2">
      No rooms found. Add your first room above.
    </div>

    <!-- Room Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div 
        v-for="room in rooms" 
        :key="room.id" 
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:border-emerald-500 hover:shadow-md transition-all group"
      >
        <span class="text-xs text-gray-400 uppercase tracking-wider mb-1">Room</span>
        <span class="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
          {{ room.room_number }}
        </span>
      </div>
    </div>
  </div>
</template>
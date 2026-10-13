<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHouse } from '../composables/useHouse'
import type { Bed } from '../composables/useHouse'
import HouseScene from '../components/HouseScene.vue'
import { currentUser } from '../services/session'

const isTenant = currentUser().role === 'tenant'
const { rooms, addBed, renameBed, deleteBed, assignTenant } = useHouse()

const beds = computed(() => rooms.value.flatMap((room) => room.beds.map((bed) => ({ bed, room }))))

// --- PERSISTENT UI STATE (Stores 3D show/hide preference) ---
const show3DView = ref(localStorage.getItem('bhns_show_3d') !== 'false')

const toggle3DView = () => {
  show3DView.value = !show3DView.value
  localStorage.setItem('bhns_show_3d', String(show3DView.value))
}

// --- MODAL STATE ---
const modal = ref({
  isOpen: false,
  type: '' as 'EDIT_BED' | 'VIEW_TENANT' | 'DELETE_BED',
  bedId: null as number | null,
  roomId: null as number | null,
  inputValue: '',
  tenantInfo: ''
})

const handleAddBed = async () => {
  const room = rooms.value.find((r) => r.beds.length < 4)
  if (!room) {
    alert('All rooms are full (4 beds max).')
    return
  }
  await addBed(room.id)
}

const openEditBedModal = (roomId: number, bed: Bed) => {
  modal.value = { isOpen: true, type: 'EDIT_BED', roomId, bedId: bed.dbId, inputValue: bed.label.replace('Bed ', ''), tenantInfo: '' }
}

const openDeleteBedModal = (bed: Bed) => {
  modal.value = { isOpen: true, type: 'DELETE_BED', roomId: null, bedId: bed.dbId, inputValue: '', tenantInfo: '' }
}

const openViewTenantModal = (bed: Bed) => {
  const info = `Occupant: ${bed.tenant}\nRate: ₱${bed.rate.toLocaleString()} / mo`
  modal.value = { isOpen: true, type: 'VIEW_TENANT', roomId: null, bedId: null, inputValue: '', tenantInfo: info }
}

const closeModal = () => {
  modal.value.isOpen = false
}

const submitModal = async () => {
  if (modal.value.type === 'EDIT_BED' && modal.value.roomId && modal.value.bedId) {
    const label = modal.value.inputValue.trim()
    if (!label) return
    await renameBed(modal.value.bedId, modal.value.roomId, label)
  }
  else if (modal.value.type === 'DELETE_BED' && modal.value.bedId) {
    await deleteBed(modal.value.bedId) 
  }
  closeModal()
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-4 gap-4">
      <div>
        <h2 class="text-2xl font-black uppercase tracking-wider">Beds Management</h2>
        <p class="font-mono text-xs text-gray-700">View, assign, and manage beds across boarding house rooms.</p>
      </div>
      <div class="flex gap-2">
        <button @click="toggle3DView" class="border-2 border-black bg-white text-black px-4 py-2 font-mono text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_#000]">
          {{ show3DView ? 'Hide 3D View' : 'Show 3D View' }}
        </button>
        <button v-if="!isTenant" @click="handleAddBed" class="border-2 border-black bg-black text-white px-4 py-2 font-mono text-sm font-bold uppercase hover:bg-teal-700 transition-colors shadow-[4px_4px_0_0_#000]">
          + Add New Bed
        </button>
      </div>
    </div>

    <!-- 3D HOUSE VIEWER (Stored preference) -->
    <div v-if="show3DView" class="border-2 border-black shadow-[6px_6px_0_0_#000] bg-white h-[350px] relative overflow-hidden">
      <div class="absolute top-2 left-2 z-10 font-mono text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0_0_#000] pointer-events-none">
        3D House Overview
      </div>
      <HouseScene />
    </div>

    <!-- Beds Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
      <div
        v-for="{ bed, room } in beds" :key="bed.id"
        class="border-2 border-black p-4 shadow-[4px_4px_0_0_#000] flex flex-col h-full"
        :class="bed.tenant ? 'bg-white' : 'bg-white border-dashed'"
      >
        <div
          class="flex justify-between items-center border-b-2 pb-2 mb-3"
          :class="bed.tenant ? 'border-black' : 'border-dashed border-gray-400'"
        >
          <h3 class="font-bold text-base uppercase">
            BED {{ bed.id }} <span class="text-xs font-mono font-normal">(SINGLE)</span>
          </h3>
          <div
            class="font-mono text-[10px] px-2 py-1 uppercase border border-black"
            :class="bed.tenant ? 'bg-gray-800 text-white' : 'bg-white text-black'"
          >
            [ {{ bed.tenant ? 'OCCUPIED' : 'VACANT' }} ]
          </div>
        </div>

        <div class="flex-grow space-y-2 font-mono text-xs mb-4">
          <p>Rate: <span class="font-bold">₱{{ bed.rate.toLocaleString() }} / mo</span></p>
          <div class="pt-2">
            <p>🛏 ROOM: {{ room.name }} (Floor {{ room.floor }})</p>
            <p v-if="bed.tenant" class="mt-2 text-teal-800 font-bold">👤 OCCUPANT: {{ bed.tenant }}</p>
            <p v-else class="mt-2 text-gray-400">👤 OCCUPANT: -- [ NO TENANT ]</p>
          </div>
        </div>

        <!-- Bed Actions (Edit, Assign, View, Delete) -->
        <div v-if="!isTenant" class="flex flex-col gap-2 mt-auto pt-4 border-t" :class="bed.tenant ? 'border-black' : 'border-dashed border-gray-400'">
          <div class="flex gap-2">
            <button class="flex-1 border-2 border-black bg-[#F4F4F0] py-1 font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors" @click="openEditBedModal(room.id, bed)">[ EDIT ]</button>
            <button v-if="bed.tenant" class="flex-1 border-2 border-black bg-[#F4F4F0] py-1 font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors" @click="openViewTenantModal(bed)">[ VIEW TENANT ]</button>
            <button v-else @click="assignTenant(bed.dbId)" class="flex-1 border-2 border-black bg-black text-white py-1 font-mono text-xs font-bold hover:bg-teal-700 transition-colors">[ ASSIGN ]</button>
          </div>
          <button @click="openDeleteBedModal(bed)" class="w-full border-2 border-red-700 text-red-700 bg-white py-1 font-mono text-xs font-bold hover:bg-red-700 hover:text-white transition-colors">
            [ DELETE BED ]
          </button>
        </div>
      </div>
    </div>

    <!-- NEO-BRUTALIST MODAL -->
    <Teleport to="body">
      <div v-if="modal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm">
          
          <div class="bg-[#EAE8DD] border-b-4 border-black p-4 flex justify-between items-center">
            <h3 class="font-black uppercase tracking-wider text-sm">
              {{ modal.type === 'EDIT_BED' ? 'Edit Bed Name' : modal.type === 'DELETE_BED' ? 'Delete Bed' : 'Tenant Information' }}
            </h3>
            <button @click="closeModal" class="font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>
          
          <div class="p-6 space-y-4 font-mono text-sm">
            
            <div v-if="modal.type === 'EDIT_BED'">
              <label class="block font-bold uppercase mb-1">New Bed Label</label>
              <input 
                v-model="modal.inputValue" 
                type="text"
                class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)] font-bold" 
                @keyup.enter="submitModal"
              />
            </div>

            <div v-if="modal.type === 'VIEW_TENANT'" class="font-bold whitespace-pre-wrap leading-loose">
              {{ modal.tenantInfo }}
            </div>

            <div v-if="modal.type === 'DELETE_BED'" class="text-red-700 font-bold uppercase text-center py-2">
              Are you sure you want to delete this bed? This cannot be undone.
            </div>
            
            <div class="flex gap-2 pt-2">
              <button v-if="modal.type !== 'VIEW_TENANT'" @click="submitModal" :class="modal.type === 'DELETE_BED' ? 'bg-red-700 hover:shadow-[2px_2px_0_0_#B91C1C]' : 'bg-teal-700 hover:shadow-[2px_2px_0_0_#000]'" class="flex-1 text-white border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:translate-y-1 transition-all">
                {{ modal.type === 'DELETE_BED' ? 'Delete' : 'Confirm' }}
              </button>
              <button @click="closeModal" class="flex-1 bg-white text-black border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-gray-200 hover:translate-y-1 transition-all">
                {{ modal.type === 'VIEW_TENANT' ? 'Close' : 'Cancel' }}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
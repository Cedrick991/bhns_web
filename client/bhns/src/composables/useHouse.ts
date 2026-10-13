import { computed } from 'vue'
import axios from 'axios'
import { bedService, roomService, tenancyService } from '../services/api'
import { accountName, bedsInRoom, house, loadHouse, naturalSort, tenancyOfBed } from '../store/house'

export interface Bed {
  id: string
  dbId: number
  label: string
  rate: number
  tenant: string | null
}
export interface Room {
  id: number
  name: string
  floor: number
  rate: number
  beds: Bed[]
}

const letter = (i: number) => String.fromCharCode(65 + i)
const floorOf = (num: string) => {
  const n = parseInt(num, 10)
  return Number.isFinite(n) && n >= 100 ? Math.floor(n / 100) : 1
}

const errMsg = (e: unknown) => {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data
    return d ? (typeof d === 'string' ? d : JSON.stringify(d)) : e.message
  }
  return String(e)
}

/** Runs an API action, alerts on failure. */
const run = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await fn()
  } catch (e) {
    window.alert(errMsg(e))
    return undefined
  }
}

export const refreshHouse = () => loadHouse(['rooms', 'beds', 'tenancies', 'accounts'], true)

let started = false
const ensureLoaded = () => {
  if (started) return
  started = true
  void loadHouse(['rooms', 'beds', 'tenancies', 'accounts'], true)
}

const rooms = computed<Room[]>(() =>
  [...house.rooms]
    .sort((a, b) => naturalSort(a.room_number, b.room_number))
    .map((r) => {
      const beds: Bed[] = bedsInRoom(r.id).map((b) => {
        const t = tenancyOfBed(b.id)
        return {
          id: `${r.room_number}-${b.bed_label}`,
          dbId: b.id,
          label: `Bed ${b.bed_label}`,
          rate: t ? Number(t.agreed_rate) || 0 : 0,
          tenant: b.is_occupied ? (t ? accountName(t.tenant) : 'Occupied') : null,
        }
      })
      return {
        id: r.id,
        name: `Room ${r.room_number}`,
        floor: floorOf(r.room_number),
        rate: Math.max(0, ...beds.map((b) => b.rate)),
        beds,
      }
    }),
)

const floors = computed(() => [...new Set(rooms.value.map((r) => r.floor))].sort((a, b) => a - b))
const totalRooms = computed(() => rooms.value.length)
const totalBeds = computed(() => rooms.value.reduce((n, r) => n + r.beds.length, 0))
const occupiedBeds = computed(() => rooms.value.reduce((n, r) => n + r.beds.filter((b) => b.tenant).length, 0))
const vacantBeds = computed(() => totalBeds.value - occupiedBeds.value)

// Updated to remove the "floor" parameter request
const addRoom = (bedCount = 0) =>
  run(async () => {
    const used = new Set(house.rooms.map((r) => r.room_number))
    let n = 101 // Default to 100 series
    while (used.has(String(n))) n++
    const { data } = await roomService.create({ room_number: String(n) })
    for (let i = 0; i < bedCount; i++) {
      await bedService.create({ room_id: data.id, bed_label: letter(i) })
    }
    await loadHouse(['rooms', 'beds'], true)
    return data
  })

const renameRoom = (id: number, roomNumber: string) =>
  run(async () => {
    await roomService.update(id, { room_number: roomNumber })
    await loadHouse(['rooms'], true)
  })

const deleteRoom = (id: number) =>
  run(async () => {
    await roomService.remove(id) // Changed to remove
    await loadHouse(['rooms', 'beds'], true)
  })

const addBed = async (roomId: number) => {
  const existing = bedsInRoom(roomId).map((b) => b.bed_label)
  if (existing.length >= 4) {
    window.alert('A room holds at most 4 beds.')
    return false
  }
  let i = 0
  while (existing.includes(letter(i))) i++
  const res = await run(async () => {
    await bedService.create({ room_id: roomId, bed_label: letter(i) })
    await loadHouse(['beds'], true)
    return true
  })
  return !!res
}

const renameBed = (bedDbId: number, roomId: number, label: string) =>
  run(async () => {
    await bedService.update(bedDbId, { room_id: roomId, bed_label: label })
    await loadHouse(['beds'], true)
  })

const deleteBed = (bedDbId: number) =>
  run(async () => {
    await bedService.remove(bedDbId) // Changed to remove
    await loadHouse(['beds'], true)
  })

const assignTenant = async (bedDbId: number) => {
  const username = window.prompt('Tenant username:')
  if (!username) return
  const acc = house.accounts.find((a) => a.username === username.trim())
  if (!acc) {
    window.alert('No account with that username.')
    return
  }
  const raw = window.prompt('Monthly rate (₱):', '1500')
  if (raw === null) return
  const rate = Number(raw)
  if (!Number.isFinite(rate) || rate <= 0) {
    window.alert('Enter a valid rate.')
    return
  }
  await run(async () => {
    await tenancyService.create({
      tenant: acc.id,
      bed: bedDbId,
      check_in_date: new Date().toISOString().slice(0, 10),
      agreed_rate: rate.toFixed(2),
    })
    await loadHouse(['tenancies', 'beds'], true)
  })
}

export const useHouse = () => {
  ensureLoaded()
  return {
    rooms, floors, totalRooms, totalBeds, occupiedBeds, vacantBeds,
    addRoom, renameRoom, deleteRoom, addBed, renameBed, deleteBed, assignTenant,
  }
}
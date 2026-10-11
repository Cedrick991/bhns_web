<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// Hide navbar on the login and register pages
const showNavbar = computed(() => route.name !== 'login' && route.name !== 'register')

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh')
  localStorage.removeItem('role')
  delete axios.defaults.headers.common['Authorization']
  router.push('/login')
}
</script>

<template>
  <header v-if="showNavbar" class="bg-white shadow-sm border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4rem] flex flex-wrap items-center justify-between py-3 gap-4">
      <h1 class="text-xl font-bold text-gray-800">BHNS Dashboard</h1>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <RouterLink to="/rooms" class="text-gray-600 hover:text-emerald-600 font-medium transition-colors" active-class="text-emerald-600 font-bold">Rooms</RouterLink>
        <RouterLink to="/beds" class="text-gray-600 hover:text-emerald-600 font-medium transition-colors" active-class="text-emerald-600 font-bold">Beds</RouterLink>
        <RouterLink to="/tenancies" class="text-gray-600 hover:text-emerald-600 font-medium transition-colors" active-class="text-emerald-600 font-bold">Tenancies</RouterLink>
        <RouterLink to="/accounts" class="text-gray-600 hover:text-emerald-600 font-medium transition-colors" active-class="text-emerald-600 font-bold">Accounts</RouterLink>
        <RouterLink to="/invoices" class="text-gray-600 hover:text-emerald-600 font-medium transition-colors" active-class="text-emerald-600 font-bold">Invoices</RouterLink>
        <RouterLink to="/invoice-items" class="text-gray-600 hover:text-emerald-600 font-medium transition-colors" active-class="text-emerald-600 font-bold">Charges</RouterLink>
        <RouterLink to="/payments" class="text-gray-600 hover:text-emerald-600 font-medium transition-colors" active-class="text-emerald-600 font-bold">Payments</RouterLink>

        <button
          @click="handleLogout"
          class="ml-4 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <RouterView />
  </main>
</template>
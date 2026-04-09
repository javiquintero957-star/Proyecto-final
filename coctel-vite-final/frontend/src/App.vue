<template>
  <div class="app-shell">
    <header class="app-header">
      <nav class="app-nav">
        <button :class="{ active: currentRoute === 'login' }" @click="navigate('login')">Login</button>
        <button :class="{ active: currentRoute === 'dashboard' }" @click="navigate('dashboard')">Dashboard</button>
      </nav>
    </header>

    <main class="app-main">
      <component :is="currentView" @navigate="handleNavigate" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'

const views = {
  login: LoginView,
  dashboard: DashboardView,
}

const currentRoute = ref('login')
const currentView = ref(views[currentRoute.value])

function navigate(route) {
  if (views[route]) {
    currentRoute.value = route
    currentView.value = views[route]
  }
}

function handleNavigate(route) {
  navigate(route)
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #eff6ff;
  color: #0f172a;
}

.app-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 22px 18px 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.brand h1 {
  margin: 0;
  font-size: 1.65rem;
}

.brand p {
  margin: 6px 0 0;
  color: #475569;
  font-size: 0.95rem;
}

.app-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.app-nav button {
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.app-nav button:hover {
  background: #f8fafc;
}

.app-nav button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 18px 40px;
}
</style>

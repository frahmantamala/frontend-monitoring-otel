<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-gray-900">
          Frontend Monitoring
        </h1>
        <p class="text-gray-600 mt-2">
          Real e-commerce app with OpenTelemetry monitoring - showing how to filter noise and track meaningful metrics
        </p>
      </div>
    </header>

    <!-- Navigation -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex space-x-6">
          <NuxtLink 
            to="/shop" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Shop Demo
          </NuxtLink>
          <NuxtLink 
            to="/dashboard" 
            class="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-sm font-medium"
          >
            Monitoring Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/errors" 
            class="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-sm font-medium"
          >
            Error Handling
          </NuxtLink>
          <a 
            href="#demo" 
            class="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
          >
            Basic Demo
          </a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Status indicators -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-3">System Status</h2>
        <div class="flex items-center space-x-6 text-sm">
          <div class="flex items-center">
            <div :class="`w-2 h-2 rounded-full mr-2 ${isRealUser ? 'bg-green-500' : 'bg-red-500'}`"></div>
            <span>{{ isRealUser ? 'Real User Detected' : 'Bot/Automated Traffic' }}</span>
          </div>
          <div class="flex items-center">
            <div :class="`w-2 h-2 rounded-full mr-2 ${telemetryEnabled ? 'bg-green-500' : 'bg-gray-400'}`"></div>
            <span>{{ telemetryEnabled ? 'Telemetry Active' : 'Telemetry Disabled' }}</span>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Real E-commerce App</h3>
          <p class="text-gray-600 text-sm mb-4">
            Functional shop using FakeStore API - real products, cart, checkout flow
          </p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>Product data from FakeStore API</li>
            <li>User auth via ReqRes API</li>
            <li>Search and cart operations</li>
          </ul>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-3">OpenTelemetry Monitoring</h3>
          <p class="text-gray-600 text-sm mb-4">
            Real API calls instrumented with OpenTelemetry spans and metrics
          </p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>Live API call tracking</li>
            <li>User journey instrumentation</li>
            <li>Business metrics correlation</li>
          </ul>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Noise Filtering</h3>
          <p class="text-gray-600 text-sm mb-4">
            Bot detection and filtering eliminates junk data from monitoring
          </p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>Bot traffic elimination</li>
            <li>Error categorization</li>
            <li>Business context tagging</li>
          </ul>
        </div>
      </div>

      <!-- Interactive Demo -->
      <div id="demo" class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-medium text-gray-900 mb-4">
          Interactive Demo
        </h2>
        <p class="text-gray-600 text-sm mb-6">
          Test the monitoring system by triggering different events. Check browser console for telemetry output.
        </p>

        <!-- Demo Buttons -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button 
            @click="simulateApiCall('critical')"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            data-track="critical-api"
          >
            Critical API
          </button>
          
          <button 
            @click="simulateApiCall('normal')"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            data-track="normal-api"
          >
            Normal API
          </button>
          
          <button 
            @click="simulateError()"
            class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm"
            data-track="error-simulation"
          >
            Trigger Error
          </button>
          
          <button 
            @click="simulateJunkRequest()"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            Junk Request
          </button>
        </div>

        <!-- Metrics -->
        <div class="border border-gray-200 rounded p-4">
          <h4 class="font-medium text-gray-900 mb-3">Metrics</h4>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ metricsStore.apiCalls }}</div>
              <div class="text-xs text-gray-500">API Calls</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ metricsStore.userInteractions }}</div>
              <div class="text-xs text-gray-500">Interactions</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-600">{{ metricsStore.errorsFiltered }}</div>
              <div class="text-xs text-gray-500">Filtered</div>
            </div>
          </div>
        </div>

        <!-- Console -->
        <div class="mt-4">
          <h4 class="font-medium text-gray-900 mb-2">Console Output</h4>
          <div class="bg-black text-green-400 p-3 rounded font-mono text-xs h-32 overflow-y-auto">
            <div v-for="log in consoleLogs" :key="log.id" class="mb-1">
              {{ log.message }}
            </div>
            <div v-if="consoleLogs.length === 0" class="text-gray-500">
              Click buttons above to see output...
            </div>
          </div>
        </div>
      </div>

      <!-- Best Practices -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Best Practices</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li>Filter bot traffic before collection</li>
            <li>Tag requests with business context</li>
            <li>Sample non-critical metrics</li>
            <li>Focus on user journey events</li>
            <li>Use structured logging</li>
          </ul>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Avoid These Mistakes</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li>Tracking every network request</li>
            <li>Including third-party errors</li>
            <li>Mixing dev/prod data</li>
            <li>Logging sensitive information</li>
            <li>Vanity metrics in dashboards</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMetricsStore } from '~/stores/metrics'

// Reactive state
const isRealUser = ref(false)
const telemetryEnabled = ref(false)
const consoleLogs = ref([])

// Use Pinia store
const metricsStore = useMetricsStore()

// Check if user is detected as real
onMounted(() => {
  // Check various signals for real user detection
  const hasUserAgent = navigator.userAgent && !/(bot|crawler|spider)/i.test(navigator.userAgent)
  const hasReasonableScreen = window.screen.width * window.screen.height > 100000
  const isNotHeadless = !navigator.webdriver
  
  isRealUser.value = hasUserAgent && hasReasonableScreen && isNotHeadless
  telemetryEnabled.value = isRealUser.value
  
  // Initialize metrics store
  metricsStore.initialize(isRealUser.value)
  
  if (isRealUser.value) {
    addConsoleLog('[OTEL] Initialized for real user session')
    addConsoleLog('[FILTER] Smart filtering enabled')
  } else {
    addConsoleLog('[FILTER] Bot detected - telemetry disabled')
  }
})

function addConsoleLog(message) {
  consoleLogs.value.unshift({
    id: Date.now(),
    message: `[${new Date().toLocaleTimeString()}] ${message}`
  })
  
  // Keep only last 10 logs
  if (consoleLogs.value.length > 10) {
    consoleLogs.value = consoleLogs.value.slice(0, 10)
  }
}

function simulateApiCall(type) {
  const url = type === 'critical' ? '/api/checkout' : '/api/products'
  const method = 'GET'
  const duration = Math.random() * 500 + 100 // Random duration 100-600ms
  
  // Track the API call using the store
  metricsStore.trackApiCall(url, method, duration, 200)
  metricsStore.trackUserInteraction('button_click', 'api-simulation')
  
  addConsoleLog(`[API] ${method} ${url} - ${type} priority`)
  addConsoleLog(`[SPAN] Added context: feature=${type === 'critical' ? 'checkout' : 'catalog'}`)
  addConsoleLog(`[METRICS] Response time: ${duration.toFixed(0)}ms`)
}

function simulateError() {
  const errorMessage = 'Simulated checkout validation error'
  
  // Track the error using the store
  metricsStore.trackError(errorMessage, 'user_action')
  metricsStore.trackUserInteraction('button_click', 'error-simulation')
  
  addConsoleLog('[ERROR] Tracking user action error')
  addConsoleLog('[SPAN] Error category: user_action_error')
  addConsoleLog(`[ERROR] ${errorMessage}`)
}

function simulateJunkRequest() {
  // Track filtered request using the store
  metricsStore.trackFiltered('Third-party domain / Extension related')
  
  addConsoleLog('[FILTER] Junk request detected and filtered')
  addConsoleLog('[FILTER] Request blocked from telemetry')
  addConsoleLog('[FILTER] Reason: Third-party domain / Extension related')
}

// Set page metadata
useHead({
  title: 'Frontend Monitoring',
  meta: [
    { name: 'description', content: 'Interactive demo showcasing intelligent frontend monitoring with OpenTelemetry' }
  ]
})
</script>
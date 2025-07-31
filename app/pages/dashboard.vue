<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">🎯 Domain-Driven Monitoring Dashboard</h1>
            <p class="text-gray-600 mt-1">Layered instrumentation across business domains</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div :class="`w-2 h-2 rounded-full mr-2 ${userContext.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`"></div>
              <span class="text-sm text-gray-600">{{ userContext.userSegment }}</span>
            </div>
            <select 
              v-model="selectedDomain" 
              class="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Domains</option>
              <option v-for="domain in domains" :key="domain.name" :value="domain.name">
                {{ domain.name }} ({{ domain.priority }})
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 py-8">
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div 
          v-for="domain in filteredDomains" 
          :key="domain.name"
          class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold capitalize">{{ domain.name }} Domain</h3>
            <span 
              :class="`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(domain.priority)}`"
            >
              {{ domain.priority }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">SLA Target</span>
              <span class="text-sm font-medium">{{ domain.slaTarget }}ms</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Error Threshold</span>
              <span class="text-sm font-medium">{{ domain.errorThreshold }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Features</span>
              <span class="text-sm font-medium">{{ domain.features.length }}</span>
            </div>
            
            <!-- Domain Metrics -->
            <div class="pt-3 border-t">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ getDomainMetric(domain.name, 'requests') }}</div>
                  <div class="text-xs text-gray-500">Requests</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ getDomainMetric(domain.name, 'avg_duration') }}ms</div>
                  <div class="text-xs text-gray-500">Avg Duration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Journey Tracking -->
      <div class="bg-white rounded-lg shadow-sm border mb-8">
        <div class="p-6 border-b">
          <h2 class="text-xl font-semibold">🛤️ User Journey Simulation</h2>
          <p class="text-gray-600 mt-1">Test different business flows with domain-specific instrumentation</p>
        </div>
        
        <div class="p-6">
          <div class="grid md:grid-cols-3 gap-6 mb-6">
            <!-- Authentication Journey -->
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-3">Authentication Journey</h3>
              <div class="space-y-2 mb-4">
                <div 
                  v-for="(step, index) in authJourney.steps" 
                  :key="step.name"
                  :class="`flex items-center text-sm p-2 rounded ${getJourneyStepColor(step.name, authJourney.currentStep)}`"
                >
                  <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-xs">
                    {{ index + 1 }}
                  </div>
                  <span>{{ step.name.replace(/_/g, ' ') }}</span>
                </div>
              </div>
              <button 
                @click="simulateAuthJourney"
                :disabled="authJourney.inProgress"
                class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded font-medium"
              >
                {{ authJourney.inProgress ? 'In Progress...' : 'Start Login Flow' }}
              </button>
            </div>

            <!-- Ecommerce Journey -->
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-3">🛒 Purchase Journey</h3>
              <div class="space-y-2 mb-4">
                <div 
                  v-for="(step, index) in ecommerceJourney.steps" 
                  :key="step.name"
                  :class="`flex items-center text-sm p-2 rounded ${getJourneyStepColor(step.name, ecommerceJourney.currentStep)}`"
                >
                  <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-xs">
                    {{ index + 1 }}
                  </div>
                  <span>{{ step.name.replace(/_/g, ' ') }}</span>
                </div>
              </div>
              <button 
                @click="simulateEcommerceJourney"
                :disabled="ecommerceJourney.inProgress"
                class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded font-medium"
              >
                {{ ecommerceJourney.inProgress ? 'In Progress...' : 'Start Purchase Flow' }}
              </button>
            </div>

            <!-- Content Journey -->
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-3">🔍 Search Journey</h3>
              <div class="space-y-2 mb-4">
                <div 
                  v-for="(step, index) in contentJourney.steps" 
                  :key="step.name"
                  :class="`flex items-center text-sm p-2 rounded ${getJourneyStepColor(step.name, contentJourney.currentStep)}`"
                >
                  <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-xs">
                    {{ index + 1 }}
                  </div>
                  <span>{{ step.name.replace(/_/g, ' ') }}</span>
                </div>
              </div>
              <button 
                @click="simulateContentJourney"
                :disabled="contentJourney.inProgress"
                class="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 px-4 rounded font-medium"
              >
                {{ contentJourney.inProgress ? 'In Progress...' : 'Start Search Flow' }}
              </button>
            </div>
          </div>

          <!-- Journey Metrics -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-3">📊 Journey Performance</h4>
            <div class="grid md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-xl font-bold text-blue-600">{{ journeyMetrics.auth.completed }}</div>
                <div class="text-xs text-gray-500">Auth Completions</div>
              </div>
              <div class="text-center">
                <div class="text-xl font-bold text-green-600">{{ journeyMetrics.ecommerce.completed }}</div>
                <div class="text-xs text-gray-500">Purchase Completions</div>
              </div>
              <div class="text-center">
                <div class="text-xl font-bold text-purple-600">{{ journeyMetrics.content.completed }}</div>
                <div class="text-xs text-gray-500">Search Completions</div>
              </div>
              <div class="text-center">
                <div class="text-xl font-bold text-red-600">{{ journeyMetrics.total.failures }}</div>
                <div class="text-xs text-gray-500">Total Failures</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Business Metrics Dashboard -->
      <div class="bg-white rounded-lg shadow-sm border mb-8">
        <div class="p-6 border-b">
          <h2 class="text-xl font-semibold">Business Impact Metrics</h2>
          <p class="text-gray-600 mt-1">Domain-specific KPIs with business context</p>
        </div>
        
        <div class="p-6">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="text-center p-4 bg-red-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600">{{ businessMetrics.revenue.conversion_rate }}%</div>
              <div class="text-sm text-gray-600">Conversion Rate</div>
              <div class="text-xs text-gray-500 mt-1">Revenue Impact</div>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ businessMetrics.engagement.login_success_rate }}%</div>
              <div class="text-sm text-gray-600">Login Success Rate</div>
              <div class="text-xs text-gray-500 mt-1">Engagement Impact</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ businessMetrics.performance.avg_page_load }}ms</div>
              <div class="text-sm text-gray-600">Avg Page Load</div>
              <div class="text-xs text-gray-500 mt-1">Performance Impact</div>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <div class="text-2xl font-bold text-yellow-600">{{ businessMetrics.reliability.uptime }}%</div>
              <div class="text-sm text-gray-600">Service Uptime</div>
              <div class="text-xs text-gray-500 mt-1">Reliability Impact</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Telemetry Feed -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold">Live Telemetry Stream</h2>
              <p class="text-gray-600 mt-1">Real-time instrumentation events with business context</p>
            </div>
            <button 
              @click="clearTelemetryFeed"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Clear Feed
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="h-96 overflow-y-auto bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <div 
              v-for="event in telemetryFeed" 
              :key="event.id"
              :class="`mb-2 ${getTelemetryEventColor(event.severity)}`"
            >
              <span class="text-gray-400">[{{ event.timestamp }}]</span>
              <span :class="`font-medium ${getDomainColor(event.domain)}`">[{{ event.domain.toUpperCase() }}]</span>
              <span class="text-white">{{ event.message }}</span>
              <div v-if="event.metadata" class="text-gray-400 text-xs mt-1 ml-4">
                {{ JSON.stringify(event.metadata, null, 2) }}
              </div>
            </div>
            <div v-if="telemetryFeed.length === 0" class="text-gray-500 text-center py-8">
              Start a user journey to see live telemetry events...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInstrumentation } from '~/composables/useInstrumentation'

// Initialize instrumentation
const { 
  instrumentationConfig, 
  instrumentAuth, 
  instrumentEcommerce, 
  instrumentContent,
  createUserContext 
} = useInstrumentation()

// Reactive state
const selectedDomain = ref('all')
const userContext = ref(createUserContext({
  userSegment: 'premium_user',
  isAuthenticated: true
}))

// Domain data
const domains = instrumentationConfig.domains
const filteredDomains = computed(() => {
  return selectedDomain.value === 'all' 
    ? domains 
    : domains.filter(d => d.name === selectedDomain.value)
})

// Journey state
const authJourney = ref({
  steps: [
    { name: 'load_login_page' },
    { name: 'enter_credentials' },
    { name: 'submit_login' },
    { name: 'redirect_dashboard' }
  ],
  currentStep: null,
  inProgress: false
})

const ecommerceJourney = ref({
  steps: [
    { name: 'add_to_cart' },
    { name: 'view_cart' },
    { name: 'enter_shipping' },
    { name: 'select_payment' },
    { name: 'complete_purchase' }
  ],
  currentStep: null,
  inProgress: false
})

const contentJourney = ref({
  steps: [
    { name: 'search_query' },
    { name: 'view_results' },
    { name: 'filter_results' },
    { name: 'select_product' }
  ],
  currentStep: null,
  inProgress: false
})

// Metrics
const domainMetrics = ref({
  authentication: { requests: 0, avg_duration: 0, errors: 0 },
  ecommerce: { requests: 0, avg_duration: 0, errors: 0 },
  content: { requests: 0, avg_duration: 0, errors: 0 }
})

const journeyMetrics = ref({
  auth: { completed: 0, failed: 0 },
  ecommerce: { completed: 0, failed: 0 },
  content: { completed: 0, failed: 0 },
  total: { failures: 0 }
})

const businessMetrics = ref({
  revenue: { conversion_rate: 3.2 },
  engagement: { login_success_rate: 94.8 },
  performance: { avg_page_load: 1240 },
  reliability: { uptime: 99.7 }
})

const telemetryFeed = ref([])

// Helper functions
const getPriorityColor = (priority) => {
  const colors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800'
  }
  return colors[priority] || colors.low
}

const getDomainColor = (domain) => {
  const colors = {
    authentication: 'text-blue-400',
    ecommerce: 'text-green-400',
    content: 'text-purple-400'
  }
  return colors[domain] || 'text-gray-400'
}

const getJourneyStepColor = (stepName, currentStep) => {
  if (stepName === currentStep) return 'bg-blue-100 border-blue-300'
  return 'bg-gray-50'
}

const getTelemetryEventColor = (severity) => {
  const colors = {
    info: 'text-green-400',
    warn: 'text-yellow-400', 
    error: 'text-red-400',
    critical: 'text-red-500'
  }
  return colors[severity] || 'text-gray-400'
}

const getDomainMetric = (domain, metric) => {
  return domainMetrics.value[domain]?.[metric] || 0
}

const addTelemetryEvent = (domain, message, severity = 'info', metadata = null) => {
  const event = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toLocaleTimeString(),
    domain,
    message,
    severity,
    metadata
  }
  
  telemetryFeed.value.unshift(event)
  
  // Keep only last 50 events
  if (telemetryFeed.value.length > 50) {
    telemetryFeed.value = telemetryFeed.value.slice(0, 50)
  }
}

const clearTelemetryFeed = () => {
  telemetryFeed.value = []
}

// Journey simulations
const simulateAuthJourney = async () => {
  authJourney.value.inProgress = true
  const instrumentor = instrumentAuth(userContext.value)
  
  try {
    addTelemetryEvent('authentication', 'Starting login user journey', 'info')
    
    for (const step of authJourney.value.steps) {
      authJourney.value.currentStep = step.name
      
      await instrumentor.instrumentUserJourney('user_login_flow', step.name, async () => {
        addTelemetryEvent('authentication', `Executing step: ${step.name}`, 'info', {
          journey: 'user_login_flow',
          step: step.name,
          user_segment: userContext.value.userSegment
        })
        
        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
        
        if (step.name === 'submit_login') {
          await instrumentor.instrumentApiCall('login', '/api/auth/login', 'POST', {
            journeyName: 'user_login_flow',
            stepName: step.name
          })
        }
        
        return { success: true }
      })
      
      // Update metrics
      domainMetrics.value.authentication.requests++
      domainMetrics.value.authentication.avg_duration = 
        (domainMetrics.value.authentication.avg_duration * (domainMetrics.value.authentication.requests - 1) + 1000) / 
        domainMetrics.value.authentication.requests
    }
    
    journeyMetrics.value.auth.completed++
    addTelemetryEvent('authentication', 'Login journey completed successfully', 'info')
    
    // Record business metric
    instrumentor.recordBusinessMetric('login_attempts', 1, { success: 'true' })
    
  } catch (error) {
    journeyMetrics.value.auth.failed++
    journeyMetrics.value.total.failures++
    addTelemetryEvent('authentication', `Login journey failed: ${error.message}`, 'error')
  } finally {
    authJourney.value.currentStep = null
    authJourney.value.inProgress = false
  }
}

const simulateEcommerceJourney = async () => {
  ecommerceJourney.value.inProgress = true
  const instrumentor = instrumentEcommerce(userContext.value)
  
  try {
    addTelemetryEvent('ecommerce', '🛒 Starting purchase user journey', 'info')
    
    for (const step of ecommerceJourney.value.steps) {
      ecommerceJourney.value.currentStep = step.name
      
      await instrumentor.instrumentUserJourney('purchase_flow', step.name, async () => {
        addTelemetryEvent('ecommerce', `Executing step: ${step.name}`, 'info', {
          journey: 'purchase_flow',
          step: step.name,
          user_segment: userContext.value.userSegment
        })
        
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
        
        if (step.name === 'add_to_cart') {
          await instrumentor.instrumentApiCall('checkout', '/api/cart', 'POST', {
            journeyName: 'purchase_flow',
            stepName: step.name
          })
        } else if (step.name === 'complete_purchase') {
          await instrumentor.instrumentApiCall('checkout', '/api/checkout', 'POST', {
            journeyName: 'purchase_flow',
            stepName: step.name
          })
        }
        
        return { success: true }
      })
      
      domainMetrics.value.ecommerce.requests++
      domainMetrics.value.ecommerce.avg_duration = 
        (domainMetrics.value.ecommerce.avg_duration * (domainMetrics.value.ecommerce.requests - 1) + 1500) / 
        domainMetrics.value.ecommerce.requests
    }
    
    journeyMetrics.value.ecommerce.completed++
    addTelemetryEvent('ecommerce', 'Purchase journey completed successfully', 'info')
    
    // Record business metrics
    instrumentor.recordBusinessMetric('purchase_value', 99.99, { payment_method: 'credit_card' })
    businessMetrics.value.revenue.conversion_rate = Math.min(99.9, businessMetrics.value.revenue.conversion_rate + 0.1)
    
  } catch (error) {
    journeyMetrics.value.ecommerce.failed++
    journeyMetrics.value.total.failures++
    addTelemetryEvent('ecommerce', `Purchase journey failed: ${error.message}`, 'error')
  } finally {
    ecommerceJourney.value.currentStep = null
    ecommerceJourney.value.inProgress = false
  }
}

const simulateContentJourney = async () => {
  contentJourney.value.inProgress = true
  const instrumentor = instrumentContent(userContext.value)
  
  try {
    addTelemetryEvent('content', '🔍 Starting search user journey', 'info')
    
    for (const step of contentJourney.value.steps) {
      contentJourney.value.currentStep = step.name
      
      await instrumentor.instrumentUserJourney('product_discovery', step.name, async () => {
        addTelemetryEvent('content', `Executing step: ${step.name}`, 'info', {
          journey: 'product_discovery',
          step: step.name,
          user_segment: userContext.value.userSegment
        })
        
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800))
        
        if (step.name === 'search_query') {
          await instrumentor.instrumentApiCall('search', '/api/search', 'GET', {
            journeyName: 'product_discovery',
            stepName: step.name
          })
        }
        
        return { success: true }
      })
      
      domainMetrics.value.content.requests++
      domainMetrics.value.content.avg_duration = 
        (domainMetrics.value.content.avg_duration * (domainMetrics.value.content.requests - 1) + 800) / 
        domainMetrics.value.content.requests
    }
    
    journeyMetrics.value.content.completed++
    addTelemetryEvent('content', 'Search journey completed successfully', 'info')
    
    // Record business metrics
    instrumentor.recordBusinessMetric('search_success_rate', 94.5, { query_type: 'product' })
    
  } catch (error) {
    journeyMetrics.value.content.failed++
    journeyMetrics.value.total.failures++
    addTelemetryEvent('content', `Search journey failed: ${error.message}`, 'error')
  } finally {
    contentJourney.value.currentStep = null
    contentJourney.value.inProgress = false
  }
}

// Page metadata
useHead({
  title: 'Domain-Driven Monitoring Dashboard',
  meta: [
    { name: 'description', content: 'Advanced monitoring dashboard with layered domain instrumentation' }
  ]
})
</script>
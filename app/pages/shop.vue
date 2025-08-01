<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/" class="text-2xl font-bold text-gray-900">
              ShopDemo
            </NuxtLink>
            <nav class="hidden md:flex space-x-6">
              <a href="#" class="text-gray-600 hover:text-gray-900">Products</a>
              <a href="#" class="text-gray-600 hover:text-gray-900">Categories</a>
              <a href="#" class="text-gray-600 hover:text-gray-900">Deals</a>
            </nav>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Search -->
            <div class="relative">
              <input
                v-model="searchQuery"
                @keyup.enter="performSearch"
                type="text"
                placeholder="Search products..."
                class="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <button 
                @click="performSearch"
                class="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                🔍
              </button>
            </div>
            
            <!-- Cart -->
            <button 
              @click="toggleCart"
              class="relative p-2 text-gray-600 hover:text-gray-900"
            >
              🛒
              <span 
                v-if="cartItems.length > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {{ cartItems.length }}
              </span>
            </button>
            
            <!-- User -->
            <div class="flex items-center space-x-2">
              <div v-if="user" class="flex items-center space-x-2">
                <img :src="user.avatar" :alt="user.first_name" class="w-8 h-8 rounded-full">
                <span class="text-sm text-gray-700">{{ user.first_name }}</span>
              </div>
              <button 
                v-else 
                @click="simulateLogin"
                :disabled="isLoggingIn"
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                {{ isLoggingIn ? 'Logging in...' : 'Login' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8">
      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Search Results for "{{ lastSearchQuery }}" ({{ searchResults.length }} items)
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in searchResults" 
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
            @view-product="viewProduct"
          />
        </div>
      </div>

      <!-- Featured Products -->
      <div v-else>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
        <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-lg shadow-sm animate-pulse">
            <div class="h-48 bg-gray-200 rounded-t-lg"></div>
            <div class="p-4">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in products" 
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
            @view-product="viewProduct"
          />
        </div>
      </div>

      <!-- Recent Activity Feed (Monitoring Demo) -->
      <div class="mt-12 bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">🔍 Live Monitoring Feed</h3>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">Live</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm mt-1">API calls and user interactions being tracked</p>
        </div>
        
        <div class="p-6">
          <div class="h-64 overflow-y-auto bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <div 
              v-for="log in monitoringLogs" 
              :key="log.id"
              :class="`mb-1 ${getLogColor(log.type)}`"
            >
              <span class="text-gray-400">[{{ log.timestamp }}]</span>
              <span :class="`font-medium ${getDomainColor(log.domain)}`">[{{ log.domain.toUpperCase() }}]</span>
              <span class="text-white">{{ log.message }}</span>
            </div>
            <div v-if="monitoringLogs.length === 0" class="text-gray-500 text-center py-8">
              Interact with the shop to see live monitoring data...
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Cart Sidebar -->
    <div v-if="showCart" class="fixed inset-0 z-50 overflow-hidden">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="toggleCart"></div>
      <div class="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Shopping Cart</h3>
            <button @click="toggleCart" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
        
        <div class="p-6">
          <div v-if="cartItems.length === 0" class="text-center text-gray-500 py-8">
            Your cart is empty
          </div>
          
          <div v-else>
            <div v-for="item in cartItems" :key="item.id" class="flex items-center space-x-4 mb-4">
              <img :src="item.image" :alt="item.title" class="w-16 h-16 object-cover rounded">
              <div class="flex-1">
                <h4 class="font-medium text-sm">{{ item.title.substring(0, 40) }}...</h4>
                <p class="text-gray-600 text-sm">${{ item.price }}</p>
              </div>
            </div>
            
            <div class="border-t pt-4 mt-6">
              <div class="flex justify-between mb-4">
                <span class="font-semibold">Total: ${{ cartTotal.toFixed(2) }}</span>
              </div>
              <button 
                @click="proceedToCheckout"
                :disabled="isCheckingOut"
                class="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {{ isCheckingOut ? 'Processing...' : 'Checkout' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess" class="fixed inset-0 z-60 flex items-center justify-center">
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="bg-white rounded-lg p-8 max-w-md mx-4 z-10">
        <div class="text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Order Placed Successfully!</h3>
          <p class="text-gray-600 mb-4">Order ID: {{ lastOrder?.orderId }}</p>
          <p class="text-gray-600 mb-6">Total: ${{ lastOrder?.total }}</p>
          <button 
            @click="closeSuccess"
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApiClient } from '~/composables/useApiClient'
import { useInstrumentation } from '~/composables/useInstrumentation'
import { useErrorHandling } from '~/composables/useErrorHandling'

// Initialize API client, instrumentation, and error handling
const apiClient = useApiClient()
const { instrumentEcommerce, instrumentAuth, instrumentContent, createUserContext } = useInstrumentation()
const errorHandler = useErrorHandling()

// Reactive state
const products = ref([])
const searchResults = ref([])
const searchQuery = ref('')
const lastSearchQuery = ref('')
const cartItems = ref([])
const showCart = ref(false)
const showSuccess = ref(false)
const lastOrder = ref(null)
const user = ref(null)
const loading = ref(true)
const isLoggingIn = ref(false)
const isCheckingOut = ref(false)
const monitoringLogs = ref([])

// User context for instrumentation
const userContext = ref(createUserContext())

// Computed properties
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.price, 0)
})

// Monitoring helpers
const addMonitoringLog = (domain, message, type = 'info') => {
  const log = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toLocaleTimeString(),
    domain,
    message,
    type
  }
  
  monitoringLogs.value.unshift(log)
  
  // Keep only last 20 logs
  if (monitoringLogs.value.length > 20) {
    monitoringLogs.value = monitoringLogs.value.slice(0, 20)
  }
}

const getLogColor = (type) => {
  const colors = {
    info: 'text-green-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    success: 'text-blue-400'
  }
  return colors[type] || 'text-gray-400'
}

const getDomainColor = (domain) => {
  const colors = {
    ecommerce: 'text-green-400',
    auth: 'text-blue-400',
    content: 'text-purple-400',
    analytics: 'text-yellow-400'
  }
  return colors[domain] || 'text-gray-400'
}

// API functions with instrumentation
const loadProducts = async () => {
  loading.value = true
  const instrumentor = instrumentEcommerce(userContext.value)
  
  try {
    addMonitoringLog('ecommerce', 'Loading featured products...')
    
    const result = await instrumentor.instrumentApiCall('browse', '/api/products', 'GET', {
      customAttributes: { section: 'featured', limit: 8 }
    })
    
    // Use API with error handling
    const productsData = await apiClient.makeApiCall('load_products', () => 
      apiClient.ecommerce.getProducts(8)
    )
    
    // Validate and sanitize products
    const validatedProducts = productsData.map(product => 
      errorHandler.validateApiResponse(product, errorHandler.API_SCHEMAS.product, '/api/products')
    )
    
    products.value = validatedProducts
    addMonitoringLog('ecommerce', `Loaded ${productsData.length} products successfully`, 'success')
    
  } catch (error) {
    addMonitoringLog('ecommerce', `Failed to load products: ${error.message}`, 'error')
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  const instrumentor = instrumentContent(userContext.value)
  lastSearchQuery.value = searchQuery.value
  
  try {
    addMonitoringLog('content', `🔍 Searching for "${searchQuery.value}"...`)
    
    await instrumentor.instrumentUserJourney('product_discovery', 'search_query', async () => {
      const results = await apiClient.makeApiCall('search_products', () => 
        apiClient.ecommerce.searchProducts(searchQuery.value)
      )
      
      searchResults.value = results
      
      // Track search analytics
      await apiClient.analytics.trackEvent('search_performed', {
        query: searchQuery.value,
        results_count: results.length,
        user_id: user.value?.id,
        timestamp: new Date().toISOString()
      })
      
      return results
    })
    
    addMonitoringLog('content', `Found ${searchResults.value.length} results for "${searchQuery.value}"`, 'success')
    
  } catch (error) {
    addMonitoringLog('content', `Search failed: ${error.message}`, 'error')
    console.error('Search failed:', error)
  }
}

const simulateLogin = async () => {
  isLoggingIn.value = true
  const instrumentor = instrumentAuth(userContext.value)
  
  try {
    addMonitoringLog('auth', 'Attempting user login...')
    
    await instrumentor.instrumentUserJourney('user_login_flow', 'submit_login', async () => {
      const loginResult = await apiClient.scenarios.simulateLogin()
      
      // Get user profile after login
      const userProfile = await apiClient.makeApiCall('get_profile', () => 
        apiClient.auth.getProfile(2) // ReqRes user ID 2
      )
      
      user.value = userProfile.data
      userContext.value = createUserContext({
        userId: user.value.id.toString(),
        isAuthenticated: true,
        userSegment: 'authenticated_user'
      })
      
      return { login: loginResult, profile: userProfile }
    })
    
    addMonitoringLog('auth', `Login successful for ${user.value.first_name}`, 'success')
    
  } catch (error) {
    addMonitoringLog('auth', `Login failed: ${error.message}`, 'error')
    console.error('Login failed:', error)
  } finally {
    isLoggingIn.value = false
  }
}

const addToCart = async (product) => {
  const instrumentor = instrumentEcommerce(userContext.value)
  
  try {
    addMonitoringLog('ecommerce', `🛒 Adding "${product.title.substring(0, 30)}..." to cart`)
    
    await instrumentor.instrumentApiCall('cart', '/api/cart/add', 'POST', {
      customAttributes: { 
        product_id: product.id,
        product_category: product.category,
        price: product.price
      }
    })
    
    // Use API
    await apiClient.makeApiCall('add_to_cart', () => 
      apiClient.ecommerce.addToCart(product.id, 1)
    )
    
    cartItems.value.push(product)
    addMonitoringLog('ecommerce', `Added to cart successfully`, 'success')
    
    // Track analytics
    await apiClient.analytics.trackEvent('product_added_to_cart', {
      product_id: product.id,
      product_title: product.title,
      price: product.price,
      category: product.category,
      user_id: user.value?.id
    })
    
  } catch (error) {
    addMonitoringLog('ecommerce', `Failed to add to cart: ${error.message}`, 'error')
    console.error('Add to cart failed:', error)
  }
}

const viewProduct = async (product) => {
  const instrumentor = instrumentEcommerce(userContext.value)
  
  try {
    addMonitoringLog('ecommerce', `👁️ Viewing product: ${product.title.substring(0, 30)}...`)
    
    await instrumentor.instrumentApiCall('product', `/api/products/${product.id}`, 'GET', {
      customAttributes: { 
        product_id: product.id,
        product_category: product.category
      }
    })
    
    // Track analytics
    await apiClient.analytics.trackEvent('product_viewed', {
      product_id: product.id,
      product_title: product.title,
      category: product.category,
      price: product.price,
      user_id: user.value?.id
    })
    
    addMonitoringLog('ecommerce', `Product view tracked`, 'success')
    
  } catch (error) {
    addMonitoringLog('ecommerce', `Product view tracking failed: ${error.message}`, 'error')
    console.error('Product view failed:', error)
  }
}

const proceedToCheckout = async () => {
  isCheckingOut.value = true
  const instrumentor = instrumentEcommerce(userContext.value)
  
  try {
    addMonitoringLog('ecommerce', '💳 Starting checkout process...')
    
    await instrumentor.instrumentUserJourney('purchase_flow', 'complete_purchase', async () => {
      const order = await apiClient.scenarios.simulateCheckout()
      lastOrder.value = order
      return order
    })
    
    addMonitoringLog('ecommerce', `Checkout completed! Order: ${lastOrder.value.orderId}`, 'success')
    
    // Clear cart and show success
    cartItems.value = []
    showCart.value = false
    showSuccess.value = true
    
  } catch (error) {
    addMonitoringLog('ecommerce', `Checkout failed: ${error.message}`, 'error')
    console.error('Checkout failed:', error)
  } finally {
    isCheckingOut.value = false
  }
}

const toggleCart = () => {
  showCart.value = !showCart.value
}

const closeSuccess = () => {
  showSuccess.value = false
  lastOrder.value = null
}

// Initialize
onMounted(async () => {
  addMonitoringLog('ecommerce', 'ShopDemo application initialized')
  await loadProducts()
})

// Page metadata
useHead({
  title: 'ShopDemo - E-commerce with Monitoring',
  meta: [
    { name: 'description', content: 'e-commerce application with OpenTelemetry monitoring' }
  ]
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
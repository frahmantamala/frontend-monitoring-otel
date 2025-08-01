<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Error Handling Demo</h1>
            <p class="text-gray-600 mt-1">
              How to handle backend property changes and API failures in production
            </p>
          </div>
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">← Back</NuxtLink>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Scenario Selector -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Simulate Backend Breaking Changes</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <button 
            @click="loadProduct('normal')"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
          >
            Normal Response
          </button>
          <button 
            @click="loadProduct('missing_property')"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Missing Properties
          </button>
          <button 
            @click="loadProduct('renamed_property')"
            class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
          >
            Renamed Properties
          </button>
          <button 
            @click="loadProduct('type_change')"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
          >
            Type Changes
          </button>
          <button 
            @click="loadProduct('nested_structure_change')"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            Nested Changes
          </button>
          <button 
            @click="loadProduct('null_values')"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          >
            Null Values
          </button>
        </div>
        <p class="text-sm text-gray-600">
          Each scenario simulates backend changes that commonly break frontend apps
        </p>
      </div>

      <!-- Product Display -->
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <!-- Raw Data -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Raw API Response</h3>
          <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-64">
            <pre>{{ JSON.stringify(rawProduct, null, 2) }}</pre>
          </div>
        </div>

        <!-- Safe Product Display -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Safe Rendering (With Error Handling)</h3>
          <div v-if="safeProduct" class="border border-gray-200 rounded p-4">
            <div class="flex">
              <img 
                :src="errorHandler.safeGet(safeProduct, 'image', '/placeholder.jpg')" 
                :alt="errorHandler.safeGet(safeProduct, 'title', 'Unknown Product')"
                class="w-20 h-20 object-cover rounded mr-4"
                @error="handleImageError"
              >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">
                  {{ errorHandler.safeGet(safeProduct, 'title', 'Unknown Product') }}
                </h4>
                <p class="text-gray-600 text-sm mt-1">
                  {{ errorHandler.safeGet(safeProduct, 'category', 'uncategorized') }}
                </p>
                <div class="flex items-center justify-between mt-2">
                  <span class="font-bold text-lg text-gray-900">
                    ${{ errorHandler.safeGet(safeProduct, 'price', '0.00') }}
                  </span>
                  <div class="text-sm text-gray-600">
                    Rating: {{ errorHandler.safeGet(safeProduct, 'rating.rate', 'N/A') }} 
                    ({{ errorHandler.safeGet(safeProduct, 'rating.count', '0') }} reviews)
                  </div>
                </div>
                <p class="text-gray-600 text-sm mt-2">
                  {{ errorHandler.safeGet(safeProduct, 'description', 'No description available').substring(0, 100) }}...
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Click a scenario button to see error handling in action
          </div>
        </div>
      </div>

      <!-- Error Log -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Error Tracking & Monitoring</h3>
        <div class="bg-black text-green-400 p-4 rounded font-mono text-xs h-48 overflow-y-auto">
          <div v-for="log in errorLogs" :key="log.id" class="mb-1">
            <span class="text-gray-400">[{{ log.timestamp }}]</span>
            <span :class="getLogColor(log.level)">[{{ log.level.toUpperCase() }}]</span>
            <span class="text-white">{{ log.message }}</span>
            <div v-if="log.details" class="text-gray-400 text-xs ml-4 mt-1">
              {{ JSON.stringify(log.details, null, 2) }}
            </div>
          </div>
          <div v-if="errorLogs.length === 0" class="text-gray-500">
            No errors yet - try the scenarios above
          </div>
        </div>
      </div>

      <!-- Schema Validation Results -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Schema Validation Results</h3>
        <div v-if="validationResults" class="space-y-3">
          <div class="flex items-center">
            <div :class="`w-3 h-3 rounded-full mr-3 ${validationResults.isValid ? 'bg-green-500' : 'bg-red-500'}`"></div>
            <span class="font-medium">
              {{ validationResults.isValid ? 'Schema Valid' : 'Schema Validation Failed' }}
            </span>
          </div>
          
          <div v-if="validationResults.errors.length > 0">
            <h4 class="font-medium text-red-700 mb-2">Validation Errors:</h4>
            <ul class="text-sm text-red-600 space-y-1">
              <li v-for="error in validationResults.errors" :key="error">• {{ error }}</li>
            </ul>
          </div>
          
          <div v-if="validationResults.fixedProperties.length > 0">
            <h4 class="font-medium text-blue-700 mb-2">Auto-Fixed Properties:</h4>
            <ul class="text-sm text-blue-600 space-y-1">
              <li v-for="fix in validationResults.fixedProperties" :key="fix">• {{ fix }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useErrorHandling } from '~/composables/useErrorHandling'
import { useApiClient } from '~/composables/useApiClient'

// Initialize error handling and API client
const errorHandler = useErrorHandling()
const apiClient = useApiClient()

// Reactive state
const rawProduct = ref(null)
const safeProduct = ref(null)
const errorLogs = ref([])
const validationResults = ref(null)

// Add error log entry
const addErrorLog = (level, message, details = null) => {
  errorLogs.value.unshift({
    id: Date.now() + Math.random(),
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
    details
  })
  
  // Keep only last 20 logs
  if (errorLogs.value.length > 20) {
    errorLogs.value = errorLogs.value.slice(0, 20)
  }
}

const getLogColor = (level) => {
  const colors = {
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    success: 'text-green-400'
  }
  return colors[level] || 'text-gray-400'
}

// Load product with different error scenarios
const loadProduct = async (scenario) => {
  try {
    addErrorLog('info', `Loading product with scenario: ${scenario}`)
    
    // Get a product from the API
    const originalProduct = await apiClient.makeApiCall('get_product', () => 
      apiClient.ecommerce.getProduct(1)
    )
    
    let brokenProduct = originalProduct
    
    // Apply breakage scenario
    if (scenario !== 'normal') {
      brokenProduct = errorHandler.simulateBackendBreakage(originalProduct, scenario)
      addErrorLog('warn', `Applied backend breakage: ${scenario}`, {
        originalKeys: Object.keys(originalProduct),
        brokenKeys: Object.keys(brokenProduct)
      })
    }
    
    rawProduct.value = brokenProduct
    
    // Validate the response against expected schema
    const validatedProduct = errorHandler.validateApiResponse(
      brokenProduct, 
      errorHandler.API_SCHEMAS.product,
      '/api/products/1'
    )
    
    // Track validation results
    const errors = []
    const fixedProperties = []
    
    // Check what was fixed
    for (const [key, config] of Object.entries(errorHandler.API_SCHEMAS.product)) {
      const original = brokenProduct[key]
      const validated = validatedProduct[key]
      
      if (original !== validated) {
        fixedProperties.push(`${key}: ${JSON.stringify(original)} → ${JSON.stringify(validated)}`)
      }
      
      if (config.required && (original === null || original === undefined)) {
        errors.push(`Missing required property: ${key}`)
      }
    }
    
    validationResults.value = {
      isValid: errors.length === 0,
      errors,
      fixedProperties
    }
    
    safeProduct.value = validatedProduct
    
    if (errors.length > 0) {
      addErrorLog('error', `Schema validation failed with ${errors.length} errors`, errors)
    } else {
      addErrorLog('success', 'Schema validation passed')
    }
    
    addErrorLog('info', 'Product loaded with error handling applied')
    
  } catch (error) {
    addErrorLog('error', `Failed to load product: ${error.message}`, {
      error: error.message,
      stack: error.stack
    })
    
    // Even on complete failure, show fallback
    safeProduct.value = errorHandler.sanitizeApiResponse({}, errorHandler.API_SCHEMAS.product)
    rawProduct.value = { error: error.message }
    
    validationResults.value = {
      isValid: false,
      errors: [`Complete API failure: ${error.message}`],
      fixedProperties: ['Used complete fallback data']
    }
  }
}

// Handle image loading errors
const handleImageError = (event) => {
  addErrorLog('warn', 'Image failed to load, using placeholder', {
    failedSrc: event.target.src
  })
  event.target.src = '/placeholder.jpg'
}

// Error boundary setup
const errorBoundary = errorHandler.createErrorBoundary('ErrorsPage')

// Apply error boundary
onErrorCaptured(errorBoundary.onErrorCaptured)

// Page metadata
useHead({
  title: 'Error Handling Demo - Frontend Monitoring',
  meta: [
    { name: 'description', content: 'Demonstrating production error handling for backend API changes' }
  ]
})
</script>
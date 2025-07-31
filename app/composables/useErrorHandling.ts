/**
 * Error handling for missing backend properties
 */

import { useInstrumentation } from '~/composables/useInstrumentation'

export const useErrorHandling = () => {
  const { createUserContext, instrumentEcommerce } = useInstrumentation()
  const userContext = ref(createUserContext())
  
  // Common property access patterns that break
  const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    try {
      return path.split('.').reduce((current, key) => {
        if (current === null || current === undefined) {
          throw new Error(`Property path broken at '${key}'`)
        }
        return current[key]
      }, obj) ?? defaultValue
    } catch (error) {
      trackPropertyError(path, error, obj)
      return defaultValue
    }
  }

  // Schema validation for API responses
  const validateApiResponse = (data: any, expectedSchema: any, endpoint: string) => {
    const errors: string[] = []
    const instrumentor = instrumentEcommerce(userContext.value)
    
    try {
      for (const [key, config] of Object.entries(expectedSchema)) {
        const { type, required, fallback } = config as any
        
        if (required && !(key in data)) {
          errors.push(`Missing required property: ${key}`)
          continue
        }
        
        if (key in data && data[key] !== null) {
          const actualType = typeof data[key]
          if (actualType !== type) {
            errors.push(`Property ${key} expected ${type}, got ${actualType}`)
          }
        }
      }
      
      if (errors.length > 0) {
        instrumentor.recordBusinessMetric('schema_validation_errors', errors.length, {
          endpoint,
          error_types: errors.join(', ')
        })
        
        console.error(`[SCHEMA] Validation failed for ${endpoint}:`, errors)
        
        // Return sanitized data with fallbacks
        return sanitizeApiResponse(data, expectedSchema)
      }
      
      return data
    } catch (error: any) {
      console.error(`[SCHEMA] Validation error for ${endpoint}:`, error.message)
      return sanitizeApiResponse(data, expectedSchema)
    }
  }

  // Sanitize API response with fallbacks
  const sanitizeApiResponse = (data: any, schema: any) => {
    const sanitized = { ...data }
    
    for (const [key, config] of Object.entries(schema)) {
      if (!(key in sanitized) || sanitized[key] === null || sanitized[key] === undefined) {
        sanitized[key] = (config as any).fallback
      }
    }
    
    return sanitized
  }

  // Track property access errors
  const trackPropertyError = (path: string, error: any, originalObject: any) => {
    const instrumentor = instrumentEcommerce(userContext.value)
    
    // Log to monitoring
    instrumentor.recordBusinessMetric('property_access_errors', 1, {
      property_path: path,
      error_type: error.message,
      object_keys: Object.keys(originalObject || {}).join(','),
      timestamp: new Date().toISOString()
    })
    
    console.error(`[PROPERTY] Safe access failed: ${path}`, {
      error: error.message,
      availableKeys: Object.keys(originalObject || {}),
      originalObject
    })
  }

  // Real-world API schemas that might break
  const API_SCHEMAS = {
    product: {
      id: { type: 'number', required: true, fallback: 0 },
      title: { type: 'string', required: true, fallback: 'Unknown Product' },
      price: { type: 'number', required: true, fallback: 0 },
      description: { type: 'string', required: false, fallback: 'No description available' },
      category: { type: 'string', required: false, fallback: 'uncategorized' },
      image: { type: 'string', required: false, fallback: '/placeholder.jpg' },
      rating: { type: 'object', required: false, fallback: { rate: 0, count: 0 } },
      // These might be removed by backend without notice
      stock: { type: 'number', required: false, fallback: 0 },
      brand: { type: 'string', required: false, fallback: 'Generic' },
      variants: { type: 'object', required: false, fallback: {} }
    },
    
    user: {
      id: { type: 'number', required: true, fallback: 0 },
      email: { type: 'string', required: true, fallback: 'unknown@example.com' },
      first_name: { type: 'string', required: true, fallback: 'Unknown' },
      last_name: { type: 'string', required: true, fallback: 'User' },
      avatar: { type: 'string', required: false, fallback: '/default-avatar.png' },
      // Commonly removed/renamed by backend
      profile: { type: 'object', required: false, fallback: {} },
      preferences: { type: 'object', required: false, fallback: {} },
      subscription: { type: 'object', required: false, fallback: { plan: 'free' } }
    },
    
    order: {
      id: { type: 'string', required: true, fallback: 'unknown' },
      status: { type: 'string', required: true, fallback: 'pending' },
      total: { type: 'number', required: true, fallback: 0 },
      items: { type: 'object', required: true, fallback: [] },
      // These often change without frontend updates
      shipping: { type: 'object', required: false, fallback: {} },
      payment_method: { type: 'string', required: false, fallback: 'unknown' },
      tracking_number: { type: 'string', required: false, fallback: null }
    }
  }

  // Simulate real backend changes that break frontend
  const simulateBackendBreakage = (data: any, breakageType: string) => {
    const broken = JSON.parse(JSON.stringify(data))
    
    switch (breakageType) {
      case 'missing_property':
        // Backend removes a property frontend expects
        delete broken.category
        delete broken.rating
        console.log('[BACKEND] Simulated removal of category and rating properties')
        break
        
      case 'renamed_property':
        // Backend renames property without notice
        if (broken.first_name) {
          broken.firstName = broken.first_name
          delete broken.first_name
        }
        console.log('[BACKEND] Simulated renaming first_name -> firstName')
        break
        
      case 'type_change':
        // Backend changes property type
        if (typeof broken.price === 'number') {
          broken.price = broken.price.toString() // number -> string
        }
        console.log('[BACKEND] Simulated price type change: number -> string')
        break
        
      case 'nested_structure_change':
        // Backend changes nested object structure
        if (broken.rating && typeof broken.rating === 'object') {
          broken.rating = broken.rating.rate // object -> number
        }
        console.log('[BACKEND] Simulated nested structure change: rating object -> number')
        break
        
      case 'null_values':
        // Backend starts returning null for some properties
        broken.description = null
        broken.image = null
        console.log('[BACKEND] Simulated null values for description and image')
        break
    }
    
    return broken
  }

  // Error boundary component logic
  const createErrorBoundary = (componentName: string) => {
    return {
      onErrorCaptured(error: any, instance: any, info: string) {
        const instrumentor = instrumentEcommerce(userContext.value)
        
        // Track component errors
        instrumentor.recordBusinessMetric('component_errors', 1, {
          component: componentName,
          error_message: error.message,
          error_info: info,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
        
        console.error(`[COMPONENT] Error in ${componentName}:`, {
          error: error.message,
          info,
          stack: error.stack
        })
        
        // Don't propagate error - show fallback UI instead
        return false
      }
    }
  }

  // Network error handling
  const handleNetworkError = async (error: any, context: { endpoint: string, method: string }) => {
    const instrumentor = instrumentEcommerce(userContext.value)
    
    let errorCategory = 'unknown'
    let userFriendlyMessage = 'Something went wrong'
    let shouldRetry = false
    
    // Categorize different types of network errors
    if (error.message.includes('Failed to fetch')) {
      errorCategory = 'network_failure'
      userFriendlyMessage = 'Network connection problem'
      shouldRetry = true
    } else if (error.message.includes('timeout')) {
      errorCategory = 'request_timeout'
      userFriendlyMessage = 'Request timed out'
      shouldRetry = true
    } else if (error.name === 'AbortError') {
      errorCategory = 'request_cancelled'
      userFriendlyMessage = 'Request was cancelled'
      shouldRetry = false
    } else if (error.status) {
      // HTTP errors
      if (error.status >= 500) {
        errorCategory = 'server_error'
        userFriendlyMessage = 'Server error - please try again'
        shouldRetry = true
      } else if (error.status === 404) {
        errorCategory = 'not_found'
        userFriendlyMessage = 'Requested resource not found'
        shouldRetry = false
      } else if (error.status === 401) {
        errorCategory = 'unauthorized'
        userFriendlyMessage = 'Please log in again'
        shouldRetry = false
      }
    }
    
    // Track the error
    instrumentor.recordBusinessMetric('network_errors', 1, {
      category: errorCategory,
      endpoint: context.endpoint,
      method: context.method,
      status: error.status || 0,
      should_retry: shouldRetry.toString()
    })
    
    console.error(`[NETWORK] ${errorCategory} - ${context.method} ${context.endpoint}:`, {
      error: error.message,
      status: error.status,
      shouldRetry
    })
    
    return {
      errorCategory,
      userFriendlyMessage,
      shouldRetry,
      originalError: error
    }
  }

  return {
    safeGet,
    validateApiResponse,
    sanitizeApiResponse,
    trackPropertyError,
    simulateBackendBreakage,
    createErrorBoundary,
    handleNetworkError,
    API_SCHEMAS,
    
    // Utility functions for common error scenarios
    safeAccess: (obj: any, path: string, fallback: any = null) => safeGet(obj, path, fallback),
    
    withFallback: (value: any, fallback: any) => {
      return value !== null && value !== undefined ? value : fallback
    },
    
    isValidResponse: (data: any, schema: any) => {
      try {
        validateApiResponse(data, schema, 'validation')
        return true
      } catch {
        return false
      }
    }
  }
}
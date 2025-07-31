/**
 * API Client using free mock APIs
 * This makes the monitoring demo feel like a production application
 */

const API_ENDPOINTS = {
  users: 'https://jsonplaceholder.typicode.com/users',
  posts: 'https://jsonplaceholder.typicode.com/posts',
  
  auth: 'https://reqres.in/api',
  
  products: 'https://fakestoreapi.com/products',
  carts: 'https://fakestoreapi.com/carts',
  
  facts: 'https://catfact.ninja/facts',
  
  exchange: 'https://api.exchangerate-api.com/v4/latest/USD'
}

export const useApiClient = () => {
  
  const authApi = {
    async login(email: string, password: string) {
      const response = await fetch(`${API_ENDPOINTS.auth}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`)
      }
      
      return await response.json()
    },

    async register(userData: any) {
      const response = await fetch(`${API_ENDPOINTS.auth}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`)
      }
      
      return await response.json()
    },

    async getProfile(userId: number) {
      const response = await fetch(`${API_ENDPOINTS.auth}/users/${userId}`)
      
      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.status}`)
      }
      
      return await response.json()
    }
  }

  // E-commerce APIs (using FakeStore)
  const ecommerceApi = {
    async getProducts(limit = 10) {
      const response = await fetch(`${API_ENDPOINTS.products}?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Products fetch failed: ${response.status}`)
      }
      
      return await response.json()
    },

    async getProduct(id: number) {
      const response = await fetch(`${API_ENDPOINTS.products}/${id}`)
      
      if (!response.ok) {
        throw new Error(`Product fetch failed: ${response.status}`)
      }
      
      return await response.json()
    },

    async searchProducts(query: string) {
      // Simulate search by fetching all products and filtering
      const products = await this.getProducts(20)
      return products.filter((product: any) => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      )
    },

    async addToCart(productId: number, quantity = 1) {
      // Simulate adding to cart
      const response = await fetch(`${API_ENDPOINTS.carts}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          date: new Date().toISOString().split('T')[0],
          products: [{ productId, quantity }]
        })
      })
      
      if (!response.ok) {
        throw new Error(`Add to cart failed: ${response.status}`)
      }
      
      return await response.json()
    },

    async checkout(cartData: any) {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate processing time
      
      // Randomly fail 5% of checkouts to simulate real errors
      if (Math.random() < 0.05) {
        throw new Error('Payment processing failed')
      }
      
      return {
        orderId: `order_${Date.now()}`,
        status: 'completed',
        total: cartData.total || 99.99,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Content APIs (using various free APIs)
  const contentApi = {
    async getFacts(limit = 5) {
      const response = await fetch(`${API_ENDPOINTS.facts}?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Facts fetch failed: ${response.status}`)
      }
      
      return await response.json()
    },

    async searchContent(query: string) {
      // Simulate search with realistic delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))
      
      // Get some facts and simulate search results
      const facts = await this.getFacts(10)
      const results = facts.data?.filter((fact: any) => 
        fact.fact.toLowerCase().includes(query.toLowerCase())
      ) || []
      
      return {
        results,
        total: results.length,
        query,
        took: Math.floor(Math.random() * 50) + 10 // Simulated search time
      }
    },

    async getPopularContent() {
      // Use JSONPlaceholder posts as popular content
      const response = await fetch(`${API_ENDPOINTS.posts}?_limit=10`)
      
      if (!response.ok) {
        throw new Error(`Popular content fetch failed: ${response.status}`)
      }
      
      return await response.json()
    }
  }

  // Analytics/Business APIs
  const analyticsApi = {
    async getExchangeRates() {
      const response = await fetch(API_ENDPOINTS.exchange)
      
      if (!response.ok) {
        throw new Error(`Exchange rates fetch failed: ${response.status}`)
      }
      
      return await response.json()
    },

    async trackEvent(eventType: string, eventData: any) {
      // Simulate analytics tracking
      console.log('Analytics Event Tracked:', { eventType, eventData })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return {
        success: true,
        eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Utility function to simulate network conditions
  const simulateNetworkConditions = async (baseDelay = 0) => {
    // Simulate various network conditions
    const conditions = [
      { name: 'fast', delay: 50, probability: 0.7 },
      { name: 'slow', delay: 1000, probability: 0.2 },
      { name: 'timeout', delay: 5000, probability: 0.05 },
      { name: 'intermittent', delay: 2000, probability: 0.05 }
    ]
    
    const random = Math.random()
    let cumulative = 0
    
    for (const condition of conditions) {
      cumulative += condition.probability
      if (random <= cumulative) {
        if (condition.name === 'timeout') {
          throw new Error('Request timeout')
        }
        await new Promise(resolve => setTimeout(resolve, baseDelay + condition.delay))
        break
      }
    }
  }

  // Generic API call wrapper with monitoring hooks
  const makeApiCall = async (
    name: string,
    apiCall: () => Promise<any>,
    options: {
      retryCount?: number
      timeout?: number
      trackMetrics?: boolean
    } = {}
  ) => {
    const startTime = Date.now()
    const { retryCount = 0, timeout = 10000, trackMetrics = true } = options
    
    try {
      // Simulate realistic network conditions
      await simulateNetworkConditions()
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      })
      
      const result = await Promise.race([apiCall(), timeoutPromise])
      const duration = Date.now() - startTime
      
      if (trackMetrics) {
        // This will be picked up by our instrumentation
        console.log(`API Success: ${name} (${duration}ms)`)
      }
      
      return result
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      if (trackMetrics) {
        console.log(`API Error: ${name} (${duration}ms) - ${error.message}`)
      }
      
      // Retry logic for certain errors
      if (retryCount > 0 && (error.message.includes('timeout') || error.message.includes('fetch'))) {
        console.log(`Retrying ${name} (${retryCount} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return makeApiCall(name, apiCall, { ...options, retryCount: retryCount - 1 })
      }
      
      throw error
    }
  }

  return {
    auth: authApi,
    ecommerce: ecommerceApi,
    content: contentApi,
    analytics: analyticsApi,
    makeApiCall,
    
    // Predefined realistic scenarios
    scenarios: {
      // Realistic user login flow
      async simulateLogin() {
        return makeApiCall('user_login', () => 
          authApi.login('eve.holt@reqres.in', 'cityslicka')
        )
      },
      
      // Realistic product browsing
      async simulateProductBrowsing() {
        const products = await makeApiCall('browse_products', () => 
          ecommerceApi.getProducts(8)
        )
        
        // Simulate user viewing a specific product
        const randomProduct = products[Math.floor(Math.random() * products.length)]
        const productDetails = await makeApiCall('view_product', () => 
          ecommerceApi.getProduct(randomProduct.id)
        )
        
        return { products, viewedProduct: productDetails }
      },
      
      // Realistic search behavior
      async simulateSearch(query = 'electronics') {
        const searchResults = await makeApiCall('search_products', () => 
          ecommerceApi.searchProducts(query)
        )
        
        // Track search analytics
        await analyticsApi.trackEvent('search_performed', {
          query,
          results_count: searchResults.length,
          user_segment: 'organic'
        })
        
        return searchResults
      },
      
      // Realistic checkout flow with potential failures
      async simulateCheckout() {
        const cartItem = await makeApiCall('add_to_cart', () => 
          ecommerceApi.addToCart(1, 2)
        )
        
        const order = await makeApiCall('checkout', () => 
          ecommerceApi.checkout({ total: 199.98, items: 2 })
        )
        
        await analyticsApi.trackEvent('purchase_completed', {
          order_id: order.orderId,
          total: order.total,
          conversion_funnel: 'organic'
        })
        
        return order
      }
    }
  }
}
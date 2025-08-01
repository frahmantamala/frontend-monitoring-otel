import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { Resource } from '@opentelemetry/resources'
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { ConsoleSpanExporter, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { ZoneContextManager } from '@opentelemetry/context-zone'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { metrics } from '@opentelemetry/api'

/**
 * Smart Filter Class - The core of our noise reduction strategy
 * This is what makes our monitoring portfolio-worthy: intelligent filtering!
 */
class SmartFilter {
  private botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
    /whatsapp/i, /telegram/i, /slack/i, /headless/i
  ]

  private extensionPatterns = [
    /extension:\/\//i, /chrome-extension:\/\//i, /moz-extension:\/\//i,
    /safari-extension:\/\//i, /resource:\/\//i, /about:blank/i
  ]

  private irrelevantErrors = [
    'Script error.',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed',
    'Loading chunk',
    'ChunkLoadError',
    'Loading CSS chunk',
    'TypeError: Failed to fetch'
  ]

  private thirdPartyDomains = [
    'google-analytics.com', 'googletagmanager.com', 'facebook.com',
    'twitter.com', 'linkedin.com', 'doubleclick.net', 'adsystem.amazon'
  ]

  /**
   * Check if current user agent is likely a bot
   */
  isBot(): boolean {
    const userAgent = navigator.userAgent
    return this.botPatterns.some(pattern => pattern.test(userAgent))
  }

  /**
   * Check if URL is from browser extension
   */
  isExtensionRelated(url: string): boolean {
    return this.extensionPatterns.some(pattern => pattern.test(url))
  }

  /**
   * Check if error message is actionable for developers
   */
  isRelevantError(error: string): boolean {
    return !this.irrelevantErrors.some(pattern => 
      error.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  /**
   * Check if we should track this URL (filter out third-party noise)
   */
  shouldTrackUrl(url: string): boolean {
    const urlObj = new URL(url, window.location.origin)
    
    // Only track your own domain requests
    const isOwnDomain = urlObj.hostname === window.location.hostname
    const isNotExtension = !this.isExtensionRelated(url)
    const isNotDataUrl = !url.startsWith('data:')
    const isNotBlob = !url.startsWith('blob:')
    const isNotThirdParty = !this.thirdPartyDomains.some(domain => 
      urlObj.hostname.includes(domain)
    )
    
    return isOwnDomain && isNotExtension && isNotDataUrl && isNotBlob && isNotThirdParty
  }

  /**
   * Advanced user detection - multiple signals
   */
  isRealUserSession(): boolean {
    // Basic bot detection
    if (this.isBot()) return false
    
    // Check screen size (bots often have tiny or huge screens)
    const screenSize = window.screen.width * window.screen.height
    if (screenSize < 100000 || screenSize > 10000000) return false
    
    // Check for user interaction indicators
    const hasInteracted = document.body.classList.contains('user-interacted')
    const hasMovedMouse = sessionStorage.getItem('mouse-moved') === 'true'
    const hasScrolled = sessionStorage.getItem('user-scrolled') === 'true'
    const hasTyped = sessionStorage.getItem('user-typed') === 'true'
    
    // In development, always allow
    if (process.dev) return true
    
    // users typically interact with the page
    return hasInteracted || hasMovedMouse || hasScrolled || hasTyped
  }

  /**
   * Business-critical user journey detection
   */
  isCriticalUserJourney(url: string): boolean {
    const criticalPaths = [
      '/api/auth', '/api/checkout', '/api/payment',
      '/api/user', '/api/profile', '/api/orders'
    ]
    return criticalPaths.some(path => url.includes(path))
  }
}

const smartFilter = new SmartFilter()

// Set up user detection listeners
// These run once to identify human behavior
document.addEventListener('click', () => {
  document.body.classList.add('user-interacted')
  console.log('👆 user interaction detected')
}, { once: true })

document.addEventListener('mousemove', () => {
  sessionStorage.setItem('mouse-moved', 'true')
  console.log('🖱️ Mouse movement detected')
}, { once: true })

document.addEventListener('scroll', () => {
  sessionStorage.setItem('user-scrolled', 'true')
  console.log('📜 User scroll detected')
}, { once: true })

document.addEventListener('keydown', () => {
  sessionStorage.setItem('user-typed', 'true')
  console.log('⌨️ Keyboard input detected')
}, { once: true })

/**
 * Extract business context from URL for better categorization
 */
function extractBusinessContext(url: string): { feature: string; priority: string } {
  if (url.includes('/api/auth')) return { feature: 'authentication', priority: 'critical' }
  if (url.includes('/api/checkout')) return { feature: 'checkout', priority: 'critical' }
  if (url.includes('/api/payment')) return { feature: 'payment', priority: 'critical' }
  if (url.includes('/api/search')) return { feature: 'search', priority: 'high' }
  if (url.includes('/api/profile')) return { feature: 'profile', priority: 'medium' }
  if (url.includes('/api/products')) return { feature: 'catalog', priority: 'medium' }
  return { feature: 'general', priority: 'low' }
}

/**
 * Initialize OpenTelemetry - Only for Users!
 * This is the key to avoiding junk data in your monitoring
 */
if (smartFilter.isRealUserSession()) {
  console.log('🔬 Initializing OpenTelemetry for user session')
  
  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'frontend-monitoring-demo',
    [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    user_agent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    connection_type: (navigator as any).connection?.effectiveType || 'unknown',
    is_mobile: /Mobi|Android/i.test(navigator.userAgent)
  })

  // Tracing setup with console exporter for demo
  // In production, you'd use OTLP exporter to send to your backend
  const provider = new WebTracerProvider({
    resource,
    sampler: {
      shouldSample: () => ({ decision: 1 }) // Sample 100% for demo
    }
  })

  provider.addSpanProcessor(
    new BatchSpanProcessor(new ConsoleSpanExporter(), {
      maxExportBatchSize: 10,
      maxQueueSize: 100,
      scheduledDelayMillis: 1000
    })
  )

  provider.register({
    contextManager: new ZoneContextManager()
  })

  // Metrics setup
  const meterProvider = new MeterProvider({
    resource
  })
  metrics.setGlobalMeterProvider(meterProvider)

  // Register instrumentations with smart filtering
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/.*/],
        clearTimingResources: true,
        applyCustomAttributesOnSpan: (span, request, result) => {
          const url = typeof request === 'string' ? request : request.url
          
          // Smart filtering: Only instrument relevant URLs
          if (!smartFilter.shouldTrackUrl(url)) {
            span.end() // End span immediately for irrelevant requests
            return
          }

          const context = extractBusinessContext(url)
          const method = typeof request === 'string' ? 'GET' : request.method

          // Add business context to spans
          span.setAttributes({
            'http.url': url,
            'http.method': method,
            'user.session_type': 'real_user',
            'app.feature': context.feature,
            'app.priority': context.priority,
            'user.viewport': `${window.innerWidth}x${window.innerHeight}`,
            'is_critical_journey': smartFilter.isCriticalUserJourney(url)
          })

          // Add response status if available
          if (result && 'status' in result) {
            span.setAttributes({
              'http.status_code': result.status,
              'http.response_size': result.headers?.get('content-length') || 0
            })
          }

          console.log(`📊 Tracked API call: ${context.feature} (${context.priority} priority)`)
        },
        ignoreUrls: [
          // Ignore common noise URLs
          /\/favicon\.ico/,
          /\.css$/,
          /\.js$/,
          /\.png$/,
          /\.jpg$/,
          /\.gif$/,
          /analytics/,
          /tracking/
        ]
      }),

      new UserInteractionInstrumentation({
        eventNames: ['click', 'submit', 'keydown'],
        shouldPreventSpanCreation: (eventType, element) => {
          if (!element) return true
          
          // Only track meaningful interactions
          const isButton = element.tagName === 'BUTTON'
          const isLink = element.tagName === 'A'
          const isForm = element.tagName === 'FORM'
          const isInput = element.tagName === 'INPUT'
          const hasDataTrack = element.hasAttribute('data-track')
          const hasBusinessValue = element.classList.contains('track-interaction')
          
          // Skip tracking for non-essential interactions
          const shouldTrack = isButton || isLink || isForm || 
                             (isInput && eventType === 'submit') || 
                             hasDataTrack || hasBusinessValue
          
          if (shouldTrack) {
            console.log(`👆 Tracked user interaction: ${eventType} on ${element.tagName}`)
          }
          
          return !shouldTrack
        }
      }),

      new DocumentLoadInstrumentation({
        applyCustomAttributesOnSpan: (span) => {
          const loadTime = performance.now()
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          span.setAttributes({
            'page.url': window.location.href,
            'page.referrer': document.referrer || 'direct',
            'user.viewport': `${window.innerWidth}x${window.innerHeight}`,
            'user.connection': (navigator as any).connection?.effectiveType || 'unknown',
            'page.load_time': loadTime,
            'navigation.type': navigation?.type || 'navigate',
            'dom.content_loaded': navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
            'page.fully_loaded': navigation?.loadEventEnd - navigation?.loadEventStart || 0
          })
          
          console.log(`📄 Page load tracked: ${window.location.pathname} (${loadTime.toFixed(2)}ms)`)
        }
      })
    ]
  })

  // Custom metrics for business KPIs
  const meter = metrics.getMeter('frontend-demo-metrics')
  
  // Track page views with business context
  const pageViewCounter = meter.createCounter('page_views', {
    description: 'Number of page views by users'
  })
  
  // Track user engagement
  const engagementGauge = meter.createUpDownCounter('user_engagement', {
    description: 'User engagement score based on interactions'
  })

  // Track these on page load
  pageViewCounter.add(1, {
    page: window.location.pathname,
    referrer: document.referrer || 'direct',
    user_type: 'real_user'
  })

  console.log('OpenTelemetry initialized with smart filtering enabled')
  console.log('🎯 Only tracking users and business-critical metrics')
  
} else {
  console.log('🤖 Bot/automated traffic detected - telemetry disabled')
  console.log('💡 This prevents junk data in your monitoring dashboards!')
}

export default defineNuxtPlugin(() => {
  // Plugin setup complete
  console.log('Frontend Monitoring Plugin Loaded')
})
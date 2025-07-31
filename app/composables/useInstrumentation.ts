import { trace, metrics, context } from '@opentelemetry/api'
import type { 
  BusinessDomain, 
  BusinessFeature, 
  TelemetryEvent, 
  UserContext, 
  BusinessContext,
  InstrumentationConfig 
} from '~/types/monitoring'

/**
 * Domain-driven instrumentation composable
 * Provides layered monitoring for different business domains
 */
export const useInstrumentation = () => {
  const tracer = trace.getTracer('frontend-monitoring')
  const meter = metrics.getMeter('frontend-monitoring')
  
  // Domain configurations
  const instrumentationConfig: InstrumentationConfig = {
    domains: [
      {
        name: 'authentication',
        priority: 'critical',
        slaTarget: 2000,
        errorThreshold: 0.1,
        features: [
          {
            name: 'login',
            domain: 'authentication', 
            endpoints: ['/api/auth/login', '/api/auth/verify'],
            userJourneys: [
              {
                name: 'user_login_flow',
                criticalPath: true,
                conversionTracking: true,
                steps: [
                  { name: 'load_login_page', expectedDuration: 1000, required: true },
                  { name: 'enter_credentials', interaction: 'form_input', expectedDuration: 5000, required: true },
                  { name: 'submit_login', endpoint: '/api/auth/login', expectedDuration: 2000, required: true },
                  { name: 'redirect_dashboard', expectedDuration: 1500, required: true }
                ]
              }
            ],
            customMetrics: [
              {
                name: 'login_attempts',
                type: 'counter',
                description: 'Number of login attempts',
                labels: ['success', 'failure_reason'],
                businessImpact: 'engagement'
              },
              {
                name: 'login_duration',
                type: 'histogram',
                description: 'Time taken for complete login flow',
                labels: ['user_segment'],
                businessImpact: 'engagement'
              }
            ]
          }
        ]
      },
      {
        name: 'ecommerce', 
        priority: 'critical',
        slaTarget: 3000,
        errorThreshold: 0.05,
        features: [
          {
            name: 'checkout',
            domain: 'ecommerce',
            endpoints: ['/api/cart', '/api/checkout', '/api/payment'],
            userJourneys: [
              {
                name: 'purchase_flow',
                criticalPath: true,
                conversionTracking: true,
                steps: [
                  { name: 'add_to_cart', endpoint: '/api/cart', expectedDuration: 1000, required: true },
                  { name: 'view_cart', expectedDuration: 800, required: true },
                  { name: 'enter_shipping', expectedDuration: 10000, required: true },
                  { name: 'select_payment', expectedDuration: 5000, required: true },
                  { name: 'complete_purchase', endpoint: '/api/checkout', expectedDuration: 3000, required: true }
                ]
              }
            ],
            customMetrics: [
              {
                name: 'cart_abandonment_rate',
                type: 'gauge',
                description: 'Percentage of carts abandoned at each step',
                labels: ['step', 'user_segment'],
                businessImpact: 'revenue'
              },
              {
                name: 'purchase_value',
                type: 'histogram',
                description: 'Purchase amounts distribution',
                labels: ['payment_method', 'user_segment'],
                businessImpact: 'revenue'
              }
            ]
          }
        ]
      },
      {
        name: 'content',
        priority: 'medium',
        slaTarget: 2000,
        errorThreshold: 1.0,
        features: [
          {
            name: 'search',
            domain: 'content',
            endpoints: ['/api/search', '/api/products'],
            userJourneys: [
              {
                name: 'product_discovery',
                criticalPath: false,
                conversionTracking: true,
                steps: [
                  { name: 'search_query', endpoint: '/api/search', expectedDuration: 1500, required: true },
                  { name: 'view_results', expectedDuration: 800, required: true },
                  { name: 'filter_results', expectedDuration: 1000, required: false },
                  { name: 'select_product', expectedDuration: 500, required: false }
                ]
              }
            ],
            customMetrics: [
              {
                name: 'search_success_rate',
                type: 'gauge',
                description: 'Percentage of searches returning results',
                labels: ['query_type'],
                businessImpact: 'engagement'
              }
            ]
          }
        ]
      }
    ],
    sampling: {
      defaultRate: 0.1,
      domainRates: {
        'authentication': 1.0,
        'ecommerce': 1.0,
        'content': 0.3
      },
      criticalPathRate: 1.0,
      errorRate: 1.0
    },
    filtering: {
      botPatterns: [/bot/i, /crawler/i, /spider/i],
      noiseUrls: [/\.css$/, /\.js$/, /\.png$/, /favicon/],
      sensitiveFields: ['password', 'token', 'card_number'],
      allowedDomains: [window?.location?.hostname || 'localhost']
    },
    alerting: {
      errorRateThreshold: 5.0,
      latencyThreshold: 5000,
      availabilityThreshold: 99.9,
      businessMetricThresholds: {
        'cart_abandonment_rate': 70.0,
        'login_success_rate': 95.0
      }
    }
  }

  // Domain-specific instrumentors
  const domainInstrumentors = new Map()

  class DomainInstrumentor {
    constructor(
      private domain: BusinessDomain,
      private userContext: UserContext,
      private tracer: any,
      private meter: any
    ) {
      this.initializeMetrics()
    }

    private initializeMetrics() {
      // Create domain-specific metrics
      this.domain.features.forEach(feature => {
        feature.customMetrics.forEach(metricConfig => {
          const metricName = `${this.domain.name}.${feature.name}.${metricConfig.name}`
          
          switch (metricConfig.type) {
            case 'counter':
              this.meter.createCounter(metricName, {
                description: metricConfig.description
              })
              break
            case 'histogram':
              this.meter.createHistogram(metricName, {
                description: metricConfig.description
              })
              break
            case 'gauge':
              this.meter.createUpDownCounter(metricName, {
                description: metricConfig.description
              })
              break
          }
        })
      })
    }

    async instrumentApiCall(
      featureName: string, 
      endpoint: string, 
      method: string = 'GET',
      options: {
        journeyName?: string
        stepName?: string
        expectedDuration?: number
        customAttributes?: Record<string, any>
      } = {}
    ) {
      const feature = this.domain.features.find(f => f.name === featureName)
      if (!feature) {
        console.warn(`Feature ${featureName} not found in domain ${this.domain.name}`)
        return
      }

      const spanName = `${this.domain.name}.${featureName}.api_call`
      const span = this.tracer.startSpan(spanName)

      const startTime = Date.now()
      
      try {
        // Set span attributes with business context
        span.setAttributes({
          'domain.name': this.domain.name,
          'domain.priority': this.domain.priority,
          'feature.name': featureName,
          'http.method': method,
          'http.url': endpoint,
          'user.session_id': this.userContext.sessionId,
          'user.segment': this.userContext.userSegment,
          'user.device_type': this.userContext.deviceType,
          'business.sla_target': this.domain.slaTarget,
          'business.critical_path': options.journeyName ? 
            feature.userJourneys.find(j => j.name === options.journeyName)?.criticalPath || false : false,
          ...options.customAttributes
        })

        if (options.journeyName) {
          span.setAttributes({
            'journey.name': options.journeyName,
            'journey.step': options.stepName || 'unknown'
          })
        }

        // Simulate API call (in real app, this would be actual fetch)
        const response = await this.simulateApiCall(endpoint, method)
        const duration = Date.now() - startTime

        // Record metrics
        const durationMetric = this.meter.createHistogram(`${this.domain.name}.${featureName}.duration`)
        durationMetric.record(duration, {
          endpoint,
          method,
          status: response.status.toString(),
          user_segment: this.userContext.userSegment
        })

        // Check SLA violations
        if (duration > this.domain.slaTarget) {
          span.setAttributes({
            'sla.violated': true,
            'sla.target': this.domain.slaTarget,
            'sla.actual': duration
          })
          
          console.warn(`SLA violation in ${this.domain.name}.${featureName}: ${duration}ms > ${this.domain.slaTarget}ms`)
        }

        span.setAttributes({
          'http.status_code': response.status,
          'http.response_time': duration
        })

        return { success: true, duration, response }

      } catch (error: any) {
        span.recordException(error)
        span.setStatus({ code: 2, message: error.message })
        
        // Record error metrics
        const errorCounter = this.meter.createCounter(`${this.domain.name}.${featureName}.errors`)
        errorCounter.add(1, {
          error_type: error.name,
          endpoint,
          user_segment: this.userContext.userSegment
        })

        throw error
      } finally {
        span.end()
      }
    }

    async instrumentUserJourney(journeyName: string, stepName: string, stepFunction: () => Promise<any>) {
      const feature = this.domain.features.find(f => 
        f.userJourneys.some(j => j.name === journeyName)
      )
      
      if (!feature) {
        console.warn(`Journey ${journeyName} not found in domain ${this.domain.name}`)
        return stepFunction()
      }

      const journey = feature.userJourneys.find(j => j.name === journeyName)!
      const step = journey.steps.find(s => s.name === stepName)
      
      const spanName = `${this.domain.name}.${feature.name}.journey.${stepName}`
      const span = this.tracer.startSpan(spanName)

      const startTime = Date.now()

      try {
        span.setAttributes({
          'domain.name': this.domain.name,
          'feature.name': feature.name,
          'journey.name': journeyName,
          'journey.step': stepName,
          'journey.critical_path': journey.criticalPath,
          'journey.conversion_tracking': journey.conversionTracking,
          'step.required': step?.required || false,
          'step.expected_duration': step?.expectedDuration || 0,
          'user.session_id': this.userContext.sessionId
        })

        const result = await stepFunction()
        const duration = Date.now() - startTime

        // Record journey step metrics
        const stepDurationMetric = this.meter.createHistogram(`${this.domain.name}.journey.step_duration`)
        stepDurationMetric.record(duration, {
          journey: journeyName,
          step: stepName,
          feature: feature.name,
          user_segment: this.userContext.userSegment
        })

        // Check if step exceeded expected duration
        if (step && duration > step.expectedDuration) {
          span.setAttributes({
            'step.duration_exceeded': true,
            'step.expected': step.expectedDuration,
            'step.actual': duration
          })
        }

        return result

      } catch (error: any) {
        span.recordException(error)
        span.setStatus({ code: 2, message: error.message })

        // Record journey failure
        const journeyFailureCounter = this.meter.createCounter(`${this.domain.name}.journey.failures`)
        journeyFailureCounter.add(1, {
          journey: journeyName,
          step: stepName,
          error_type: error.name
        })

        throw error
      } finally {
        span.end()
      }
    }

    recordBusinessMetric(metricName: string, value: number, labels: Record<string, string> = {}) {
      const feature = this.domain.features.find(f => 
        f.customMetrics.some(m => m.name === metricName)
      )
      
      if (!feature) {
        console.warn(`Metric ${metricName} not found in domain ${this.domain.name}`)
        return
      }

      const metricConfig = feature.customMetrics.find(m => m.name === metricName)!
      const fullMetricName = `${this.domain.name}.${feature.name}.${metricName}`
      
      const enrichedLabels = {
        ...labels,
        domain: this.domain.name,
        feature: feature.name,
        business_impact: metricConfig.businessImpact,
        user_segment: this.userContext.userSegment
      }

      switch (metricConfig.type) {
        case 'counter':
          const counter = this.meter.createCounter(fullMetricName)
          counter.add(value, enrichedLabels)
          break
        case 'histogram':
          const histogram = this.meter.createHistogram(fullMetricName)
          histogram.record(value, enrichedLabels)
          break
        case 'gauge':
          const gauge = this.meter.createUpDownCounter(fullMetricName)
          gauge.add(value, enrichedLabels)
          break
      }
    }

    private async simulateApiCall(endpoint: string, method: string) {
      const baseLatency = this.domain.priority === 'critical' ? 100 : 200
      const jitter = Math.random() * 300
      const duration = baseLatency + jitter

      await new Promise(resolve => setTimeout(resolve, duration))

      const errorProbability = this.domain.errorThreshold / 100
      if (Math.random() < errorProbability) {
        throw new Error(`Simulated ${this.domain.name} API error`)
      }

      return {
        status: 200,
        duration,
        data: { success: true }
      }
    }
  }

  // Initialize instrumentor for a domain
  const getDomainInstrumentor = (domainName: string, userContext: UserContext): DomainInstrumentor => {
    const cacheKey = `${domainName}-${userContext.sessionId}`
    
    if (!domainInstrumentors.has(cacheKey)) {
      const domain = instrumentationConfig.domains.find(d => d.name === domainName)
      if (!domain) {
        throw new Error(`Domain ${domainName} not configured`)
      }
      
      const instrumentor = new DomainInstrumentor(domain, userContext, tracer, meter)
      domainInstrumentors.set(cacheKey, instrumentor)
    }
    
    return domainInstrumentors.get(cacheKey)
  }

  const instrumentAuth = (userContext: UserContext) => 
    getDomainInstrumentor('authentication', userContext)
  
  const instrumentEcommerce = (userContext: UserContext) => 
    getDomainInstrumentor('ecommerce', userContext)
  
  const instrumentContent = (userContext: UserContext) => 
    getDomainInstrumentor('content', userContext)

  return {
    instrumentationConfig,
    getDomainInstrumentor,
    instrumentAuth,
    instrumentEcommerce,
    instrumentContent,
    
    // Helper to create user context
    createUserContext: (overrides: Partial<UserContext> = {}): UserContext => ({
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isAuthenticated: false,
      userSegment: 'anonymous',
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      ...overrides
    })
  }
}
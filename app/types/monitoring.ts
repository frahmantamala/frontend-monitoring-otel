// Core monitoring types for domain-driven instrumentation
export interface BusinessDomain {
  name: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  slaTarget: number // milliseconds
  errorThreshold: number // percentage
  features: BusinessFeature[]
}

export interface BusinessFeature {
  name: string
  domain: string
  endpoints: string[]
  userJourneys: UserJourney[]
  customMetrics: CustomMetric[]
}

export interface UserJourney {
  name: string
  steps: JourneyStep[]
  criticalPath: boolean
  conversionTracking: boolean
}

export interface JourneyStep {
  name: string
  endpoint?: string
  interaction?: string
  expectedDuration: number
  required: boolean
}

export interface CustomMetric {
  name: string
  type: 'counter' | 'histogram' | 'gauge'
  description: string
  labels: string[]
  businessImpact: 'revenue' | 'engagement' | 'performance' | 'reliability'
}

export interface InstrumentationConfig {
  domains: BusinessDomain[]
  sampling: SamplingConfig
  filtering: FilteringConfig
  alerting: AlertingConfig
}

export interface SamplingConfig {
  defaultRate: number
  domainRates: Record<string, number>
  criticalPathRate: number
  errorRate: number
}

export interface FilteringConfig {
  botPatterns: RegExp[]
  noiseUrls: RegExp[]
  sensitiveFields: string[]
  allowedDomains: string[]
}

export interface AlertingConfig {
  errorRateThreshold: number
  latencyThreshold: number
  availabilityThreshold: number
  businessMetricThresholds: Record<string, number>
}

// Telemetry event types
export interface TelemetryEvent {
  timestamp: number
  domain: string
  feature: string
  eventType: 'span' | 'metric' | 'log' | 'error'
  severity: 'info' | 'warn' | 'error' | 'critical'
  data: Record<string, any>
  userContext: UserContext
  businessContext: BusinessContext
}

export interface UserContext {
  sessionId: string
  userId?: string
  isAuthenticated: boolean
  userSegment: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  location?: string
}

export interface BusinessContext {
  feature: string
  journey?: string
  step?: string
  conversionFunnel?: string
  experimentId?: string
  abTestVariant?: string
}
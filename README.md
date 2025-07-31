# Real E-commerce App with Smart Frontend Monitoring

[![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-1.24-326CE5?logo=opentelemetry)](https://opentelemetry.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

> **Real Production Demo**: Fully functional e-commerce application using real APIs (FakeStore, ReqRes, JSONPlaceholder) with enterprise-grade OpenTelemetry monitoring that eliminates noise and focuses on business outcomes.

## 🎯 Problem Statement

Traditional frontend monitoring tools like Datadog RUM often suffer from:
- **Signal vs Noise**: 80% of collected data is junk (bot traffic, extensions, third-party errors)
- **No Business Context**: Metrics without connection to actual business outcomes
- **Vanity Metrics**: Dashboards full of data that doesn't drive decisions
- **Overwhelming Alerts**: False positives from irrelevant errors

## Solution

This a **robust, layered monitoring architecture** that:

### **Smart Filtering Engine**
- **Bot Detection**: Multi-signal approach to filter automated traffic
- **Domain Filtering**: Only track your own application requests
- **Error Categorization**: Separate actionable errors from browser noise
- **Extension Filtering**: Ignore browser extension interference

### **Domain-Driven Instrumentation**
- **Business Context**: Every metric tied to business domains (auth, ecommerce, content)
- **User Journey Tracking**: Complete funnel analysis with conversion tracking
- **SLA Monitoring**: Domain-specific performance targets and alerting
- **Custom Business Metrics**: Revenue, engagement, performance, reliability KPIs

### **Layered Architecture**
```
Business Metrics Layer    (Revenue, Conversion, Engagement)
Domain Feature Layer      (Login, Checkout, Search)
User Journey Layer       (Multi-step flow tracking)
Technical Telemetry Layer (API calls, errors, performance)
Smart Filtering Layer     (Bot detection, noise reduction)
```

## Features

### **Real E-commerce Application**
- **FakeStore API Integration** - Product catalog with 20+ items across categories
- **ReqRes Authentication** - Working login system with user profiles
- **Full Shopping Cart** - Add to cart, checkout flow with payment simulation
- **Product Search** - Live search functionality across product database
- **Realistic Checkout** - Multi-step purchase flow with success/failure scenarios

### **Production-Grade Monitoring**
- **Real API Instrumentation** - Every API call tracked with OpenTelemetry spans
- **Business Context Tagging** - Revenue, engagement, performance impact classification
- **User Journey Tracking** - Complete funnel analysis from browse to purchase
- **Smart Bot Filtering** - Eliminates automated traffic before data collection
- **Live Telemetry Stream** - Watch real monitoring data as you interact
- **SLA Monitoring** - Domain-specific performance targets and alerting

### **Three Experience Levels**
- **Live Shop Demo** - E-commerce experience with monitoring
- **Advanced Dashboard** - Domain-driven instrumentation showcase  
- **Basic Demo** - Simple filtering concepts demonstration

## Technical Architecture

### **Technology Stack**
- **Frontend**: Nuxt 4 + TypeScript + Tailwind CSS
- **Monitoring**: OpenTelemetry Web SDK with custom instrumentations
- **State Management**: Pinia for metrics and telemetry data
- **UI/UX**: Responsive design with real-time updates

### **Key Design Patterns**
1. **Domain-Driven Design**: Monitoring organized by business domains
2. **Layered Instrumentation**: Multiple abstraction levels for different concerns
3. **Builder Pattern**: Flexible telemetry event construction
4. **Strategy Pattern**: Pluggable filtering and sampling strategies
5. **Observer Pattern**: Real-time metric updates and alerting

## Project Structure

```
frontend-monitoring-otel/
├── app/
│   ├── components/           # Reusable Vue components
│   ├── composables/         
│   │   └── useInstrumentation.ts  # Domain-driven monitoring logic
│   ├── pages/
│   │   ├── index.vue        # Landing page with basic demo
│   │   └── dashboard.vue    # Advanced monitoring dashboard
│   ├── plugins/
│   │   └── otel.client.ts   # OpenTelemetry initialization
│   ├── stores/
│   │   └── metrics.ts       # Pinia store for telemetry data
│   └── types/
│       └── monitoring.ts    # TypeScript interfaces
├── assets/                  # Static assets
├── public/                  # Public files
├── nuxt.config.ts          # Nuxt configuration
└── package.json            # Dependencies
```

## 🛠️ Setup & Installation

### **Prerequisites**
- Node.js 18+ 
- Yarn or npm

### **Quick Start**
```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Open browser
open http://localhost:3000
```

### **Build for Production**
```bash
# Build the application
yarn build

# Preview production build
yarn preview
```

## Usage Examples

### **Basic Smart Filtering**
```typescript
// Real user detection prevents bot noise
if (smartFilter.isRealUserSession()) {
  // Only initialize telemetry for real users
  initializeOpenTelemetry()
}
```

### **Domain-Specific Instrumentation**
```typescript
// Authentication domain
const authInstrumentor = instrumentAuth(userContext)
await authInstrumentor.instrumentUserJourney('user_login_flow', 'submit_login', async () => {
  return await authInstrumentor.instrumentApiCall('login', '/api/auth/login')
})

// E-commerce domain
const ecommerceInstrumentor = instrumentEcommerce(userContext)
await ecommerceInstrumentor.recordBusinessMetric('cart_abandonment_rate', 25.5, {
  step: 'payment_selection',
  user_segment: 'premium'
})
```

## Monitoring Best Practices

### **DO: Smart Data Collection**
- Filter bot traffic before data collection
- Tag every request with business context
- Use sampling to reduce noise on non-critical paths
- Focus on user journey-critical events
- Implement circuit breakers for telemetry failures

### **DON'T: Common Anti-Patterns**
- Don't track every single network request
- Don't include third-party script errors in your metrics
- Don't mix development/staging data with production
- Don't log PII or sensitive information
- Don't create dashboards full of vanity metrics

## Business Impact

This monitoring system tracks metrics that directly correlate with business outcomes:

### **Revenue Impact**
- Conversion rate by user segment
- Cart abandonment at each funnel step
- Payment success rates
- Average order value trends

### **Engagement Impact**  
- Feature adoption rates
- User session quality scores
- Search success rates

### **Performance Impact**
- Core Web Vitals for business pages
- API response times for critical endpoints
- Error rates that affect user experience
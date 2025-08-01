import { defineStore } from 'pinia'

export const useMetricsStore = defineStore('metrics', {
  state: () => ({
    // Real-time metrics
    pageViews: 0,
    apiCalls: 0,
    userInteractions: 0,
    errorsTracked: 0,
    errorsFiltered: 0,
    
    // Performance metrics
    avgPageLoadTime: 0,
    avgApiResponseTime: 0,
    
    // User session data
    sessionStartTime: Date.now(),
    isRealUser: false,
    telemetryEnabled: false,
    
    // Recent activities log
    recentActivities: [] as Array<{
      id: string
      timestamp: number
      type: 'page_view' | 'api_call' | 'user_interaction' | 'error' | 'filtered'
      description: string
      metadata?: Record<string, any>
    }>
  }),

  getters: {
    sessionDuration: (state) => {
      return Math.round((Date.now() - state.sessionStartTime) / 1000)
    },
    
    totalTrackedEvents: (state) => {
      return state.pageViews + state.apiCalls + state.userInteractions + state.errorsTracked
    },
    
    filteringEfficiency: (state) => {
      const total = state.totalTrackedEvents + state.errorsFiltered
      return total > 0 ? Math.round((state.errorsFiltered / total) * 100) : 0
    },

    recentActivitiesFormatted: (state) => {
      return state.recentActivities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20)
        .map(activity => ({
          ...activity,
          timeAgo: formatTimeAgo(activity.timestamp),
          formattedTime: new Date(activity.timestamp).toLocaleTimeString()
        }))
    }
  },

  actions: {
    // Initialize metrics store
    initialize(isRealUser: boolean) {
      this.isRealUser = isRealUser
      this.telemetryEnabled = isRealUser
      this.addActivity('session_start', `Session started - ${isRealUser ? 'User' : 'Bot'} detected`)
    },

    // Track page view
    trackPageView(url: string, loadTime?: number) {
      if (!this.telemetryEnabled) {
        this.trackFiltered('Page view blocked - bot traffic')
        return
      }

      this.pageViews++
      if (loadTime) {
        this.avgPageLoadTime = this.avgPageLoadTime === 0 
          ? loadTime 
          : (this.avgPageLoadTime + loadTime) / 2
      }

      this.addActivity('page_view', `Page viewed: ${url}`, {
        url,
        loadTime
      })
    },

    // Track API call
    trackApiCall(url: string, method: string, duration?: number, status?: number) {
      if (!this.telemetryEnabled) {
        this.trackFiltered(`API call blocked: ${method} ${url}`)
        return
      }

      this.apiCalls++
      if (duration) {
        this.avgApiResponseTime = this.avgApiResponseTime === 0 
          ? duration 
          : (this.avgApiResponseTime + duration) / 2
      }

      this.addActivity('api_call', `API call: ${method} ${url}`, {
        url,
        method,
        duration,
        status
      })
    },

    // Track user interaction
    trackUserInteraction(type: string, element?: string) {
      if (!this.telemetryEnabled) {
        this.trackFiltered(`User interaction blocked: ${type}`)
        return
      }

      this.userInteractions++
      this.addActivity('user_interaction', `User ${type}${element ? ` on ${element}` : ''}`, {
        type,
        element
      })
    },

    // Track error
    trackError(message: string, type: 'javascript' | 'network' | 'user_action' = 'javascript') {
      if (!this.telemetryEnabled) {
        this.trackFiltered(`Error blocked: ${message}`)
        return
      }

      this.errorsTracked++
      this.addActivity('error', `Error: ${message}`, {
        type,
        message
      })
    },

    // Track filtered events
    trackFiltered(reason: string) {
      this.errorsFiltered++
      this.addActivity('filtered', `Filtered: ${reason}`)
    },

    // Add activity to log
    addActivity(type: string, description: string, metadata?: Record<string, any>) {
      const activity = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: type as any,
        description,
        metadata
      }

      this.recentActivities.push(activity)
      
      // Keep only recent 100 activities
      if (this.recentActivities.length > 100) {
        this.recentActivities = this.recentActivities.slice(-100)
      }
    },

    // Reset metrics (for demo purposes)
    resetMetrics() {
      this.pageViews = 0
      this.apiCalls = 0
      this.userInteractions = 0
      this.errorsTracked = 0
      this.errorsFiltered = 0
      this.avgPageLoadTime = 0
      this.avgApiResponseTime = 0
      this.recentActivities = []
      this.sessionStartTime = Date.now()
    },

    // Export metrics data
    exportMetrics() {
      return {
        session: {
          startTime: this.sessionStartTime,
          duration: this.sessionDuration,
          isRealUser: this.isRealUser,
          telemetryEnabled: this.telemetryEnabled
        },
        metrics: {
          pageViews: this.pageViews,
          apiCalls: this.apiCalls,
          userInteractions: this.userInteractions,
          errorsTracked: this.errorsTracked,
          errorsFiltered: this.errorsFiltered,
          totalTrackedEvents: this.totalTrackedEvents,
          filteringEfficiency: this.filteringEfficiency
        },
        performance: {
          avgPageLoadTime: this.avgPageLoadTime,
          avgApiResponseTime: this.avgApiResponseTime
        },
        activities: this.recentActivitiesFormatted
      }
    }
  }
})

// Helper function to format time ago
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  app: {
    head: {
      title: 'Frontend Monitoring with OpenTelemetry - Portfolio Demo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A comprehensive demo showcasing clean frontend monitoring with OpenTelemetry, smart filtering, and meaningful metrics collection.' }
      ]
    }
  },
  ssr: false
})

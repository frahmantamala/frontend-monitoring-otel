<template>
  <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
    <div class="aspect-square overflow-hidden rounded-t-lg">
      <img 
        :src="safeGet('image', '/placeholder.jpg')" 
        :alt="safeGet('title', 'Unknown Product')"
        class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
        @click="$emit('view-product', product)"
        @error="handleImageError"
      >
    </div>
    <div class="p-4">
      <h3 class="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600" 
          @click="$emit('view-product', product)">
        {{ safeGet('title', 'Unknown Product') }}
      </h3>
      <div class="flex items-center justify-between">
        <span class="text-xl font-bold text-gray-900">
          ${{ formatPrice(safeGet('price', 0)) }}
        </span>
        <button 
          @click="$emit('add-to-cart', product)"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add to Cart
        </button>
      </div>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {{ safeGet('category', 'uncategorized') }}
        </span>
        <div v-if="safeGet('rating.rate')" class="text-xs text-gray-600">
          ★ {{ safeGet('rating.rate', 0).toFixed(1) }} ({{ safeGet('rating.count', 0) }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['product'])
defineEmits(['add-to-cart', 'view-product'])

// Safe property access
const safeGet = (path, fallback = null) => {
  try {
    return path.split('.').reduce((obj, key) => obj?.[key], props.product) ?? fallback
  } catch {
    return fallback
  }
}

// Format price safely
const formatPrice = (price) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
}

// Handle image loading errors
const handleImageError = (event) => {
  console.log('[IMAGE] Failed to load product image, using placeholder')
  event.target.src = '/placeholder.jpg'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
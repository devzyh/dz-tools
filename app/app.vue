<script setup lang="ts">
onMounted(() => {
  if (import.meta.client && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
})
</script>

<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

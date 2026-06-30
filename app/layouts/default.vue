<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <NuxtLoadingIndicator
      color="#409eff"
      :height="2"
      :duration="1000"
      :throttle="50"
      style="top: 60px"
    />
    <main class="app-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 0;
}
</style>

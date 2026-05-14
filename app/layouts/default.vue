<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'

const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const router = useRouter()
router.beforeEach(() => {
  loading.value = true
  if (timer) clearTimeout(timer)
})
router.afterEach(() => {
  timer = setTimeout(() => { loading.value = false }, 300)
})
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <div class="loading-bar" :class="{ active: loading }" />
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

.loading-bar {
  height: 2px;
  background: var(--el-color-primary, #409eff);
  width: 0;
  opacity: 0;
  transition: width 0.3s ease-out, opacity 0.3s ease-out;

  &.active {
    width: 40%;
    opacity: 1;
    transition: width 3s ease-out, opacity 0s;
  }
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 0;
}
</style>

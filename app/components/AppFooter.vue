<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-divider" />
    <p class="footer-text">
      &copy; {{ new Date().getFullYear() }} {{ appConfig.title }}. {{ $t('footer.copyright') }}.
    </p>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  text-align: center;
  padding: 16px;
}

.footer-divider {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.footer-text {
  color: #909399;
  font-size: 14px;
}
</style>

<script setup lang="ts">
// Tool logic
</script>

<template>
  <div class="tool-form">
    <!-- Input area -->
    <div class="tool-actions">
      <el-button type="primary">执行</el-button>
    </div>
    <!-- Output area -->
  </div>
</template>

<style scoped lang="scss">
.tool-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

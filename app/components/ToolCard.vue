<script setup lang="ts">
import * as Icons from '@element-plus/icons-vue'

const props = defineProps<{
  title: string
  description: string
  href: string
  icon?: string
}>()
</script>

<template>
  <NuxtLink :to="href" class="tool-card">
    <div class="tool-icon-wrapper">
      <el-icon :size="18" class="tool-icon">
        <component :is="icon ? (Icons as any)[icon] : Icons.Edit" />
      </el-icon>
    </div>
    <div class="tool-info">
      <div class="tool-title">{{ title }}</div>
      <div class="tool-desc">{{ description }}</div>
    </div>
  </NuxtLink>
</template>

<style scoped lang="scss">
.tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  text-decoration: none;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.12);
  }
}

.tool-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.tool-icon {
  color: #409eff;
}

.tool-info {
  min-width: 0;
}

.tool-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  description: string
  href: string
  icon?: string
}>()

/**
 * 将 meta 中的 EP 图标名(PascalCase)映射为 Iconify ep 集合的 kebab-case 名称
 */
const iconName = computed(() => {
  const name = props.icon ?? 'Edit'
  return `i-ep-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`
})
</script>

<template>
  <NuxtLink :to="href" class="tool-card">
    <div class="tool-icon-wrapper">
      <UIcon :name="iconName" class="size-[18px] tool-icon" />
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
  border: 1px solid var(--ui-border);
  background: var(--ui-bg-elevated);
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
  text-decoration: none;

  &:hover {
    border-color: var(--ui-primary);
    box-shadow: 0 2px 12px color-mix(in srgb, var(--ui-primary) 12%, transparent);
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
  background: var(--ui-bg-accented);
}

.tool-icon {
  color: var(--ui-primary);
}

.tool-info {
  min-width: 0;
}

.tool-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ui-text-highlighted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-desc {
  font-size: 12px;
  color: var(--ui-text-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

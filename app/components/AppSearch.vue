<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

defineProps<{ compact?: boolean }>()

const route = useRoute()
const { allTools } = useToolRegistry()
const linksData = (await import('~/data/links.json')).default

interface SearchItem {
  title: string
  description: string
  path: string
  type: 'tool' | 'link'
}

const allSearchItems = computed(() => [
  ...allTools.map(tool => ({
    title: tool.meta.title,
    description: tool.meta.description,
    path: `/${tool.slug}`,
    type: 'tool' as const,
  })),
  ...(linksData as { links: { title: string; href: string; description?: string }[] }[]).flatMap(group =>
    group.links.map(link => ({
      title: link.title,
      description: link.description ?? '',
      path: link.href,
      type: 'link' as const,
    })),
  ),
])

const query = ref('')
const activeItemIndex = ref(-1)
const showDropdown = ref(false)
const searchInputRef = ref()

const filteredItems = computed(() => {
  if (!query.value.trim()) return []
  const items = allSearchItems.value
  if (!Array.isArray(items)) return []
  const q = query.value.toLowerCase()
  return items.filter(item =>
    item.title.toLowerCase().includes(q)
    || (item.description || '').toLowerCase().includes(q)
    || item.path.toLowerCase().includes(q),
  )
})

watch(query, () => {
  activeItemIndex.value = -1
  showDropdown.value = true
})

watch(() => route.path, () => {
  query.value = ''
  showDropdown.value = false
})

function handleKeydown(e: KeyboardEvent) {
  if (!showDropdown.value && e.key === 'ArrowDown') {
    showDropdown.value = true
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeItemIndex.value = (activeItemIndex.value + 1) % filteredItems.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeItemIndex.value = activeItemIndex.value <= 0 ? filteredItems.value.length - 1 : activeItemIndex.value - 1
  }
  if (e.key === 'Enter') {
    if (activeItemIndex.value >= 0 && activeItemIndex.value < filteredItems.value.length) {
      handleNavigate(filteredItems.value[activeItemIndex.value])
    }
  } else if (e.key === 'Escape') {
    showDropdown.value = false
    searchInputRef.value?.blur()
  }
}

function handleNavigate(item: SearchItem) {
  showDropdown.value = false
  query.value = ''
  if (item.type === 'tool') {
    navigateTo(item.path)
  } else {
    window.open(item.path, '_blank')
  }
}
</script>

<template>
  <div class="header-search" @mouseleave="showDropdown = false">
    <el-input
      ref="searchInputRef"
      v-model="query"
      :placeholder="$t('search.placeholder')"
      :prefix-icon="Search"
      clearable
      @focus="showDropdown = true"
      @keydown="handleKeydown"
    />
    <div v-if="showDropdown && filteredItems.length > 0" class="search-dropdown">
      <div
        v-for="(item, index) in filteredItems"
        :key="item.path"
        class="search-item"
        :class="{ active: index === activeItemIndex }"
        @mousedown.prevent="handleNavigate(item)"
        @mouseenter="activeItemIndex = index"
      >
        {{ item.title }}
      </div>
    </div>
    <div v-if="showDropdown && query.trim() && filteredItems.length === 0" class="search-dropdown">
      <div class="search-empty">{{ $t('search.empty') }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-search {
  position: relative;
  display: flex;
  align-items: center;

  :deep(.el-input__wrapper) {
    border-radius: 18px;
  }
}

.search-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  z-index: 9999;
  margin-top: 4px;
}

.search-item {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.search-empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>

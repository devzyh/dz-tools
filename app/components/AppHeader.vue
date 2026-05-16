<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const route = useRoute()
const activeIndex = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path.startsWith('/links')) return '/links'
  if (path.startsWith('/about')) return '/about'
  return ''
})

const { allTools } = useToolRegistry()
const linksData = (await import('~/data/links.json')).default

const { locale, setLocale, t } = useI18n()
const switchLocale = () => {
  const next = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
  setLocale(next)
}

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

function handleSelect(path: string) {
  navigateTo(path)
  menuOpen.value = false
}

const menuOpen = ref(false)
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
  menuOpen.value = false
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

function handleFocus() {
  showDropdown.value = true
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <header class="app-header">
    <div class="header-brand" @click="handleSelect('/')">
      <strong>DZ Tools</strong>
    </div>
    <nav class="header-nav" :class="{ open: menuOpen }">
      <a class="nav-link" :class="{ active: activeIndex === '/' }" @click="handleSelect('/')">{{ $t('nav.home') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/links' }" @click="handleSelect('/links')">{{ $t('nav.links') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/about' }" @click="handleSelect('/about')">{{ $t('nav.about') }}</a>
    </nav>
    <div class="header-right">
      <button v-if="useAppConfig().showLangSwitch" class="lang-switch" @click="switchLocale">{{ locale === 'zh-CN' ? 'EN' : '中' }}</button>
      <div class="header-search desktop-search" @mouseleave="showDropdown = false">
        <el-input
          ref="searchInputRef"
          v-model="query"
          :placeholder="$t('search.placeholder')"
          :prefix-icon="Search"
          clearable
          class="search-input"
          @focus="handleFocus"
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
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-bar" :class="{ open: menuOpen }" />
      </button>
    </div>
    <div class="mobile-menu" :class="{ open: menuOpen }">
      <a class="nav-link" :class="{ active: activeIndex === '/' }" @click="handleSelect('/')">{{ $t('nav.home') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/links' }" @click="handleSelect('/links')">{{ $t('nav.links') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/about' }" @click="handleSelect('/about')">{{ $t('nav.about') }}</a>
      <div class="mobile-search" @mouseleave="showDropdown = false">
        <el-input
          v-model="query"
          :placeholder="$t('search.placeholder')"
          :prefix-icon="Search"
          clearable
          @focus="handleFocus"
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
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-brand {
  font-size: 18px;
  cursor: pointer;
  color: var(--el-text-color-primary);
  margin-right: 24px;
}

.header-nav {
  display: flex;
  gap: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 12px;
}

.lang-switch {
  background: none;
  border: none;
  padding: 4px 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }
}

.header-search {
  position: relative;
  display: flex;
  align-items: center;

  :deep(.el-input__wrapper) {
    border-radius: 18px;
  }
}

.desktop-search .search-input {
  width: 200px;
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

.nav-link {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;

  &:hover {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }

  &.active {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 20px;
  position: relative;

  .menu-bar {
    &,
    &::before,
    &::after {
      display: block;
      width: 100%;
      height: 2px;
      background: var(--el-text-color-primary);
      border-radius: 1px;
      transition: transform 0.3s, opacity 0.3s;
      position: absolute;
      left: 0;
    }

    & { top: 9px; }
    &::before { content: ''; top: -7px; }
    &::after { content: ''; top: 7px; }

    &.open {
      background: transparent;
      &::before { transform: rotate(45deg); top: 0; }
      &::after { transform: rotate(-45deg); top: 0; }
    }
  }
}

.mobile-menu {
  display: none;
}

.mobile-search {
  margin-top: 8px;
  position: relative;
}

@media (max-width: 768px) {
  .header-nav,
  .desktop-search {
    display: none;
  }

  .menu-toggle {
    display: block;
  }

  .mobile-menu {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    flex-direction: column;
    padding: 8px 20px;

    &.open {
      display: flex;
    }
  }

  .mobile-menu .nav-link {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-extra-light);
  }
}
</style>

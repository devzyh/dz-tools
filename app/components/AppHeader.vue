<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const route = useRoute()
const activeIndex = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path.startsWith('/links')) return '/links'
  if (path.startsWith('/about')) return '/about'
  return ''
})

const { locale, setLocale } = useI18n()
const switchLocale = () => {
  const next = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
  setLocale(next)
}

function handleSelect(path: string) {
  navigateTo(path)
  menuOpen.value = false
}

const menuOpen = ref(false)

watch(() => route.path, () => {
  menuOpen.value = false
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <header class="app-header">
    <div class="header-brand" @click="handleSelect('/')">
      <strong>DZ Tools</strong>
    </div>
    <nav class="header-nav">
      <a class="nav-link" :class="{ active: activeIndex === '/' }" @click="handleSelect('/')">{{ $t('nav.home') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/links' }" @click="handleSelect('/links')">{{ $t('nav.links') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/about' }" @click="handleSelect('/about')">{{ $t('nav.about') }}</a>
    </nav>
    <div class="header-right">
      <button v-if="useAppConfig().showLangSwitch" class="lang-switch" @click="switchLocale">{{ locale === 'zh-CN' ? 'EN' : '中' }}</button>
      <div class="desktop-search">
        <AppSearch />
      </div>
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-bar" :class="{ open: menuOpen }" />
      </button>
    </div>
    <div class="mobile-menu" :class="{ open: menuOpen }">
      <a class="nav-link" :class="{ active: activeIndex === '/' }" @click="handleSelect('/')">{{ $t('nav.home') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/links' }" @click="handleSelect('/links')">{{ $t('nav.links') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/about' }" @click="handleSelect('/about')">{{ $t('nav.about') }}</a>
      <div class="mobile-search">
        <AppSearch />
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

.desktop-search {
  width: 200px;
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

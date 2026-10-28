<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const { cacheEnabled, setCacheEnabled } = useAppSettings()

const settingsOpen = ref(false)
const settingsWrapRef = ref<HTMLDivElement>()

/**
 * 切换设置面板显隐
 */
function toggleSettings() {
  settingsOpen.value = !settingsOpen.value
}

/**
 * 点击设置面板外部时关闭面板
 */
function handleDocClick(e: MouseEvent) {
  if (!settingsWrapRef.value?.contains(e.target as Node)) settingsOpen.value = false
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

const route = useRoute()
const activeIndex = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path.startsWith('/links')) return '/links'
  if (path.startsWith('/books')) return '/books'
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

watch(
  () => route.path,
  () => {
    menuOpen.value = false
    settingsOpen.value = false
  },
)

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
      <a class="nav-link" :class="{ active: activeIndex === '/' }" @click="handleSelect('/')">{{
        $t('nav.home')
      }}</a>
      <a
        class="nav-link"
        :class="{ active: activeIndex === '/links' }"
        @click="handleSelect('/links')"
        >{{ $t('nav.links') }}</a
      >
      <a
        class="nav-link"
        :class="{ active: activeIndex === '/books' }"
        @click="handleSelect('/books')"
        >{{ $t('nav.excerpt') }}</a
      >
      <a
        class="nav-link"
        :class="{ active: activeIndex === '/about' }"
        @click="handleSelect('/about')"
        >{{ $t('nav.about') }}</a
      >
    </nav>
    <div class="header-right">
      <button v-if="useAppConfig().showLangSwitch" class="lang-switch" @click="switchLocale">
        {{ locale === 'zh-CN' ? 'EN' : '中' }}
      </button>
      <div class="desktop-search">
        <AppSearch />
      </div>
      <div ref="settingsWrapRef" class="settings-wrap">
        <button class="settings-btn" :aria-label="$t('settings.title')" @click="toggleSettings">
          <UIcon name="i-ep-setting" class="size-4" />
        </button>
        <div v-if="settingsOpen" class="settings-panel">
          <div class="settings-title">{{ $t('settings.title') }}</div>
          <div class="settings-item">
            <div class="settings-item-info">
              <div class="settings-item-label">{{ $t('settings.dataCache') }}</div>
              <div class="settings-item-desc">{{ $t('settings.dataCacheDesc') }}</div>
            </div>
            <USwitch :model-value="cacheEnabled" @update:model-value="setCacheEnabled" />
          </div>
        </div>
      </div>
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-bar" :class="{ open: menuOpen }" />
      </button>
    </div>
    <div class="mobile-menu" :class="{ open: menuOpen }">
      <a class="nav-link" :class="{ active: activeIndex === '/' }" @click="handleSelect('/')">{{
        $t('nav.home')
      }}</a>
      <a
        class="nav-link"
        :class="{ active: activeIndex === '/links' }"
        @click="handleSelect('/links')"
        >{{ $t('nav.links') }}</a
      >
      <a
        class="nav-link"
        :class="{ active: activeIndex === '/books' }"
        @click="handleSelect('/books')"
        >{{ $t('nav.excerpt') }}</a
      >
      <a
        class="nav-link"
        :class="{ active: activeIndex === '/about' }"
        @click="handleSelect('/about')"
        >{{ $t('nav.about') }}</a
      >
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
  background: var(--ui-bg-elevated);
  border-bottom: 1px solid var(--ui-border);
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-brand {
  font-size: 18px;
  cursor: pointer;
  color: var(--ui-text-highlighted);
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

.lang-switch,
.settings-btn {
  background: none;
  border: none;
  padding: 4px 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ui-text-muted);
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  transition:
    color 0.15s,
    background 0.15s;

  &:hover {
    color: var(--ui-primary);
    background: var(--ui-bg-accented);
  }
}

.settings-wrap {
  position: relative;
  display: inline-flex;
}

.settings-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  padding: 14px 16px;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  z-index: 200;

  .settings-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--ui-text-highlighted);
    margin-bottom: 12px;
  }

  .settings-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .settings-item-label {
    font-size: 14px;
    color: var(--ui-text);
  }

  .settings-item-desc {
    font-size: 12px;
    color: var(--ui-text-muted);
    margin-top: 4px;
    line-height: 1.4;
  }
}

.desktop-search {
  width: 200px;
}

.nav-link {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--ui-text);
  cursor: pointer;
  border-radius: 4px;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    color: var(--ui-text-highlighted);
    background: var(--ui-bg-accented);
  }

  &.active {
    color: var(--ui-primary);
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
      background: var(--ui-text-highlighted);
      border-radius: 1px;
      transition:
        transform 0.3s,
        opacity 0.3s;
      position: absolute;
      left: 0;
    }

    & {
      top: 9px;
    }
    &::before {
      content: '';
      top: -7px;
    }
    &::after {
      content: '';
      top: 7px;
    }

    &.open {
      background: transparent;
      &::before {
        transform: rotate(45deg);
        top: 0;
      }
      &::after {
        transform: rotate(-45deg);
        top: 0;
      }
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
    background: var(--ui-bg-elevated);
    border-bottom: 1px solid var(--ui-border);
    flex-direction: column;
    padding: 8px 20px;

    &.open {
      display: flex;
    }
  }

  .mobile-menu .nav-link {
    padding: 12px 0;
    border-bottom: 1px solid var(--ui-border);
  }
}
</style>

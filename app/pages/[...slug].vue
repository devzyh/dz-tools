<script setup lang="ts">
import { isTool, isGroup } from '~/tools/types'

const route = useRoute()
const appConfig = useAppConfig()
const slug = (Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug) as string
const { resolve: resolveEntry, findGroup, getToolComponent } = useToolRegistry()

const entry = resolveEntry(slug)
const { cacheEnabled } = useAppSettings()

let ToolComponent: ReturnType<typeof defineAsyncComponent> | null = null
if (entry && isTool(entry)) {
  const loader = getToolComponent(entry.group, entry.slug)
  if (loader) {
    ToolComponent = defineAsyncComponent(loader)
  }
}

if (entry) {
  const title = entry.meta.title
  const description = entry.meta.description || ''
  usePageSeo({
    title: `${title} - ${appConfig.title}`,
    description,
    path: `/${slug}`,
    type: isTool(entry) ? 'WebApplication' : 'website',
  })
}
</script>

<template>
  <div class="slug-page">
    <!-- Tool page -->
    <template v-if="entry && isTool(entry)">
      <nav class="tool-breadcrumb">
        <NuxtLink to="/">首页</NuxtLink>
        <span class="separator">/</span>
        <NuxtLink :to="`/${entry.group}`">{{ findGroup(entry.group)?.meta.title }}</NuxtLink>
        <span class="separator">/</span>
        <span class="current">{{ entry.meta.title }}</span>
      </nav>
      <template v-if="entry.meta.showHeader !== false">
        <h1 class="tool-title">{{ entry.meta.title }}</h1>
        <p class="tool-desc">{{ entry.meta.description }}</p>
      </template>
      <ClientOnly>
        <div v-if="!cacheEnabled" class="cache-tip">{{ $t('settings.cacheDisabledTip') }}</div>
      </ClientOnly>
      <div class="tool-content">
        <component :is="ToolComponent" v-if="ToolComponent" />
      </div>
    </template>

    <!-- Group overview page -->
    <template v-else-if="entry && isGroup(entry)">
      <div class="group-header">
        <h2 class="group-title">{{ entry.meta.title }}</h2>
        <span v-if="entry.meta.description" class="group-desc">{{ entry.meta.description }}</span>
        <span class="group-count">{{ entry.tools.length }}</span>
      </div>
      <div class="tool-grid">
        <ToolCard
          v-for="tool in entry.tools"
          :key="tool.slug"
          :title="tool.meta.title"
          :description="tool.meta.description"
          :href="`/${tool.slug}`"
          :icon="tool.meta.icon"
        />
      </div>
    </template>

    <!-- 404 -->
    <template v-else>
      <ClientOnly>
        <div class="page-missing">
          <UIcon name="i-ep-warning" class="missing-icon" />
          <div class="missing-title">页面不存在</div>
          <UButton color="primary" @click="clearError({ redirect: '/' })">返回首页</UButton>
        </div>
      </ClientOnly>
    </template>
  </div>
</template>

<style scoped lang="scss">
.slug-page {
  padding-bottom: 0;
}

.tool-breadcrumb {
  font-size: 13px;
  color: #909399;
  margin-bottom: 16px;

  a {
    color: #909399;
    text-decoration: none;

    &:hover {
      color: #409eff;
    }
  }

  .separator {
    margin: 0 6px;
  }

  .current {
    color: #606266;
  }
}

.cache-tip {
  font-size: 13px;
  color: var(--ui-warning);
  background: color-mix(in srgb, var(--ui-warning) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-warning) 25%, transparent);
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
}

.page-missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
}

.missing-icon {
  width: 48px;
  height: 48px;
  color: var(--ui-warning);
}

.missing-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.tool-title {
  font-size: 22px;
  color: #303133;
  margin-bottom: 8px;
}

.tool-desc {
  color: #909399;
  font-size: 14px;
  margin-bottom: 24px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  line-height: 1;
}

.group-desc {
  font-size: 13px;
  color: #909399;
}

.group-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 1px 8px;
  border-radius: 10px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
</style>

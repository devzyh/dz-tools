<script setup lang="ts">
import { site } from '~/config/site'
import { isTool, isGroup } from '~/tools/types'

const route = useRoute()
const slug = route.params.slug as string
const { resolve: resolveEntry, findGroup } = useToolRegistry()

const entry = resolveEntry(slug)

let ToolComponent: ReturnType<typeof defineAsyncComponent> | null = null
if (entry && isTool(entry)) {
  const toolName = entry.slug.charAt(0).toUpperCase() + entry.slug.slice(1)
  const modules = import.meta.glob('~/tools/*/*.vue', { eager: false })
  const componentPath = `/tools/${entry.group}/${toolName}Tool.vue`
  if (modules[componentPath]) {
    ToolComponent = defineAsyncComponent(modules[componentPath])
  }
}

if (entry) {
  const title = isTool(entry) ? entry.meta.title : (entry as any).meta.title
  const description = isTool(entry) ? entry.meta.description : (entry as any).meta.description || ''
  usePageSeo({
    title: `${title} - ${site.title}`,
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
        <el-result icon="warning" title="页面不存在">
          <template #extra>
            <el-button type="primary" @click="clearError({ redirect: '/' })">返回首页</el-button>
          </template>
        </el-result>
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

<script setup lang="ts">
import { site } from '~/config/site'

const { allGroups } = useToolRegistry()

usePageSeo({
  title: `${site.title} - 开发者在线工具`,
  description: site.description,
  path: '/',
})
</script>

<template>
  <div class="home-page">
    <div v-for="group in allGroups" :key="group.slug" class="tool-group">
      <div class="group-header">
        <NuxtLink :to="`/${group.slug}`" class="group-title">{{ group.meta.title }}</NuxtLink>
        <span v-if="group.meta.description" class="group-desc">{{ group.meta.description }}</span>
        <span class="group-count">{{ group.tools.length }}</span>
      </div>
      <div class="tool-grid">
        <ToolCard
          v-for="tool in group.tools"
          :key="tool.slug"
          :title="tool.meta.title"
          :description="tool.meta.description"
          :href="`/${tool.slug}`"
          :icon="tool.meta.icon"
        />
      </div>
    </div>

    <el-empty v-if="allGroups.length === 0" description="暂无工具" />
  </div>
</template>

<style scoped lang="scss">
.home-page {
  padding-bottom: 24px;
}

.tool-group + .tool-group {
  margin-top: 36px;
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
  text-decoration: none;

  &:hover {
    color: #409eff;
  }
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

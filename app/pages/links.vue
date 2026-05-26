<script setup lang="ts">
const { title } = useAppConfig()

const linksData = (await import('~/data/links.json')).default

usePageSeo({
  title: `链接 - ${title}`,
  description: `${title} 收录的实用链接`,
  path: '/links',
})

interface LinkItem {
  title: string
  href: string
  description: string
  icon?: string
}

interface LinkGroup {
  title: string
  links: LinkItem[]
}

const linkGroups = linksData as LinkGroup[]

function hideDefaultIcon(img: HTMLImageElement) {
  const svg = img.nextElementSibling
  if (svg) svg.style.display = 'none'
}

const ICON_TIMEOUT = 15_000

function setupIconTimeout(img: HTMLImageElement) {
  const timer = setTimeout(() => {
    if (!img.complete || img.naturalWidth === 0) {
      img.style.opacity = '0'
      img.removeAttribute('src')
    }
  }, ICON_TIMEOUT)
  img.addEventListener('load', () => clearTimeout(timer), { once: true })
  img.addEventListener('error', () => clearTimeout(timer), { once: true })
}

onMounted(() => {
  nextTick(() => {
    document.querySelectorAll<HTMLImageElement>('.links-page .link-icon').forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        img.style.opacity = '1'
        hideDefaultIcon(img)
      } else {
        setupIconTimeout(img)
      }
    })
  })
})

function handleImgLoad(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.opacity = '1'
  hideDefaultIcon(img)
}

function handleImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.opacity = '0'
}
</script>

<template>
  <div class="links-page">
    <div v-for="group in linkGroups" :key="group.title" class="link-group">
      <div class="group-header">
        <h2 class="group-title">{{ group.title }}</h2>
        <span class="group-count">{{ group.links.length }}</span>
      </div>
      <div class="link-grid">
        <a
          v-for="link in group.links"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card"
        >
          <div class="link-icon-wrapper">
            <img
              v-if="link.icon"
              :src="link.icon"
              :alt="link.title"
              class="link-icon"
              fetchpriority="high"
              @load="handleImgLoad"
              @error="handleImgError"
            />
            <svg class="link-icon-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div class="link-info">
            <div class="link-title">{{ link.title }}</div>
            <div class="link-desc">{{ link.description }}</div>
          </div>
        </a>
      </div>
    </div>

    <el-empty v-if="linkGroups.length === 0" description="暂无链接" />
  </div>
</template>

<style scoped lang="scss">
.link-group + .link-group {
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
}

.group-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 1px 8px;
  border-radius: 10px;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #fff;
  text-decoration: none;
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.12);
  }
}

.link-icon-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: #f0f2f5;
}

.link-icon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  z-index: 1;
}

.link-icon-default {
  position: absolute;
  inset: 0;
  width: 20px;
  height: 20px;
  margin: auto;
  color: #c0c4cc;
}

.link-info {
  min-width: 0;
}

.link-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

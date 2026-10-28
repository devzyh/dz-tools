<script setup lang="ts">
const { title } = useAppConfig()

const booksData = (await import('~/data/books.json')).default

usePageSeo({
  title: `阅读 - ${title}`,
  description: '文章与书籍的摘录收藏',
  path: '/books',
})

interface BookItem {
  title: string
  url: string
  source?: string
  quotes: string[]
}

const books = booksData as BookItem[]
</script>

<template>
  <div class="books-wrap">
    <div class="books-hero">
      <h1 class="hero-title">{{ $t('nav.books') }}</h1>
      <p class="hero-desc">阅读中摘下的句子，常读常新</p>
    </div>

    <div class="books-list">
      <article v-for="item in books" :key="item.url" class="books-card">
        <div class="books-head">
          <a :href="item.url" target="_blank" rel="noopener noreferrer" class="books-title">
            {{ item.title }}
          </a>
          <span v-if="item.source" class="books-source">{{ item.source }}</span>
        </div>
        <blockquote v-for="(quote, index) in item.quotes" :key="index" class="books-quote">
          {{ quote }}
        </blockquote>
      </article>
    </div>

    <UEmpty v-if="books.length === 0" icon="i-ep-box" description="暂无内容" />
  </div>
</template>

<style scoped lang="scss">
.books-wrap {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 24px;
}

.books-hero {
  text-align: center;
  padding: 36px 24px 28px;
}

.hero-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.hero-desc {
  font-size: 14px;
  color: #909399;
  margin: 10px 0 0;
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.books-card {
  padding: 16px 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.books-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.books-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: #409eff;
  }
}

.books-source {
  font-size: 12px;
  color: #c0c4cc;
  flex-shrink: 0;
}

.books-quote {
  margin: 12px 0 0;
  padding: 10px 14px;
  border-left: 3px solid #409eff;
  background: #f0f7ff;
  border-radius: 0 6px 6px 0;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;

  & + & {
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .books-hero {
    padding: 24px 16px 20px;
  }

  .books-card {
    padding: 14px 16px;
  }
}
</style>

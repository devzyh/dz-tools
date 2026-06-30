<script setup lang="ts">
const { title, description } = useAppConfig()

usePageSeo({
  title: `关于 - ${title}`,
  description: `关于 ${title}，${description}`,
  path: '/about',
})
</script>

<template>
  <div class="about-page">
    <div class="about-hero">
      <div class="about-icon">
        <img src="/favicon.svg" :alt="title" />
      </div>
      <h1 class="about-title">{{ title }}</h1>
    </div>

    <div class="about-sections">
      <div class="about-card">
        <h2 class="section-title">关于项目</h2>
        <p class="section-text">
          {{ title }} {{ description }}，提供编码转换、文本处理、格式化等常用功能。
          纯前端实现，数据不离开浏览器，安全高效。
        </p>
      </div>

      <div class="about-card">
        <h2 class="section-title">关于我</h2>
        <p class="section-text">
          Yuhang || devzyh<br />
          ZGV2enloQG91dGxvb2suY29t<br />
          用代码解决实际问题，而非创造问题；用数据验证直觉，而非替代直觉。
        </p>
      </div>

      <div class="about-card">
        <h2 class="section-title">技术栈</h2>
        <div class="tech-tags">
          <span class="tech-tag">Java</span>
          <span class="tech-tag">MySQL</span>
          <span class="tech-tag">Vue</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.about-page {
  padding-bottom: 24px;
}

.about-hero {
  text-align: center;
  padding: 48px 24px 40px;
}

.about-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;

  img {
    width: 100%;
    height: 100%;
  }
}

.about-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.about-sections {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid #e4e7ed;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  line-height: 1;
}

.section-text {
  font-size: 14px;
  line-height: 1.7;
  color: #606266;
  margin: 0;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  font-size: 13px;
  color: #409eff;
  background: #ecf5ff;
  padding: 4px 12px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .about-hero {
    padding: 32px 16px 28px;
  }
  .about-title {
    font-size: 24px;
  }
  .about-card {
    padding: 16px;
  }
}
</style>

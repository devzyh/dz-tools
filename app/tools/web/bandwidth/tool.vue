<script setup lang="ts">
import { ref } from 'vue'

/** 进制基数：1000 为十进制（网络带宽惯例），1024 为二进制（存储惯例） */
type Radix = 1000 | 1024

/** 带宽（比特率）单位，order 为相对 base 的幂次 */
const BANDWIDTH_UNITS = [
  { label: 'bps', order: 0 },
  { label: 'Kbps', order: 1 },
  { label: 'Mbps', order: 2 },
  { label: 'Gbps', order: 3 },
  { label: 'Tbps', order: 4 },
] as const

/** 网速（字节率）单位，order 为相对 base 的幂次 */
const SPEED_UNITS = [
  { label: 'B/s', order: 0 },
  { label: 'KB/s', order: 1 },
  { label: 'MB/s', order: 2 },
  { label: 'GB/s', order: 3 },
  { label: 'TB/s', order: 4 },
] as const

/** bit 与 byte 间的固定倍数：1 Byte = 8 bits */
const BITS_PER_BYTE = 8

/** 进制基数 */
const radix = ref<Radix>(1000)

/** 基准值：比特每秒（bps），两侧互转的单一数据源 */
const bpsValue = ref(100 * 1000 ** 2) // 默认 100 Mbps

/** 带宽侧输入框值与单位 */
const bandwidthInput = ref(100)
const bandwidthUnit = ref<(typeof BANDWIDTH_UNITS)[number]['label']>('Mbps')

/** 网速侧输入框值与单位 */
const speedInput = ref(12.5)
const speedUnit = ref<(typeof SPEED_UNITS)[number]['label']>('MB/s')

const radixItems = [
  { label: '1000（带宽）', value: 1000 },
  { label: '1024（存储）', value: 1024 },
]

/** 消除浮点误差，保留 12 位有效数字后去尾零 */
function round(n: number): number {
  return parseFloat(n.toPrecision(12))
}

/** 比特率单位相对 bps 的乘数 */
function bitFactor(order: number): number {
  return radix.value ** order
}

/** 字节率单位相对 bps 的乘数（含 ×8） */
function byteFactor(order: number): number {
  return BITS_PER_BYTE * radix.value ** order
}

/** 按单位标签查找其数量级幂次 */
function orderOf(list: readonly { label: string; order: number }[], label: string): number {
  return list.find((u) => u.label === label)?.order ?? 0
}

/** 带宽侧数值变更：以带宽为准重算网速 */
function onBandwidthChange(value: number | undefined) {
  bandwidthInput.value = value ?? 0
  bpsValue.value = (value ?? 0) * bitFactor(orderOf(BANDWIDTH_UNITS, bandwidthUnit.value))
  speedInput.value = round(bpsValue.value / byteFactor(orderOf(SPEED_UNITS, speedUnit.value)))
}

/** 网速侧数值变更：以网速为准重算带宽 */
function onSpeedChange(value: number | undefined) {
  speedInput.value = value ?? 0
  bpsValue.value = (value ?? 0) * byteFactor(orderOf(SPEED_UNITS, speedUnit.value))
  bandwidthInput.value = round(
    bpsValue.value / bitFactor(orderOf(BANDWIDTH_UNITS, bandwidthUnit.value)),
  )
}

/** 带宽侧单位变更：按基准重算带宽输入框值 */
function onBandwidthUnitChange() {
  bandwidthInput.value = round(
    bpsValue.value / bitFactor(orderOf(BANDWIDTH_UNITS, bandwidthUnit.value)),
  )
}

/** 网速侧单位变更：按基准重算网速输入框值 */
function onSpeedUnitChange() {
  speedInput.value = round(bpsValue.value / byteFactor(orderOf(SPEED_UNITS, speedUnit.value)))
}

/** 进制变更：按基准重算两侧输入框值，等价关系不变 */
function onRadixChange() {
  onBandwidthUnitChange()
  onSpeedUnitChange()
}

/** 复制带宽侧结果 */
function copyBandwidth() {
  copyToClipboard(`${bandwidthInput.value} ${bandwidthUnit.value}`, '已复制')
}

/** 复制网速侧结果 */
function copySpeed() {
  copyToClipboard(`${speedInput.value} ${speedUnit.value}`, '已复制')
}
</script>

<template>
  <div class="bandwidth-tool">
    <!-- 进制开关 -->
    <div class="radix-bar">
      <span class="radix-label">换算进制</span>
      <URadioGroup
        v-model="radix"
        variant="table"
        orientation="horizontal"
        :items="radixItems"
        @update:model-value="onRadixChange"
      />
    </div>

    <!-- 互转主体 -->
    <div class="convert-area">
      <!-- 带宽侧 -->
      <div class="side-panel">
        <div class="panel-title">带宽</div>
        <div class="panel-row">
          <UInputNumber
            :model-value="bandwidthInput"
            :min="0"
            :increment="false"
            :decrement="false"
            class="value-input"
            @update:model-value="onBandwidthChange"
          />
          <USelect
            v-model="bandwidthUnit"
            :items="BANDWIDTH_UNITS.map((u) => u.label)"
            class="unit-select"
            @update:model-value="onBandwidthUnitChange"
          />
        </div>
        <UButton
          variant="link"
          color="neutral"
          icon="i-ep-copy-document"
          label="复制结果"
          class="copy-btn"
          @click="copyBandwidth"
        />
      </div>

      <!-- 等价标识 -->
      <div class="equiv">⇌</div>

      <!-- 网速侧 -->
      <div class="side-panel">
        <div class="panel-title">网速</div>
        <div class="panel-row">
          <UInputNumber
            :model-value="speedInput"
            :min="0"
            :increment="false"
            :decrement="false"
            class="value-input"
            @update:model-value="onSpeedChange"
          />
          <USelect
            v-model="speedUnit"
            :items="SPEED_UNITS.map((u) => u.label)"
            class="unit-select"
            @update:model-value="onSpeedUnitChange"
          />
        </div>
        <UButton
          variant="link"
          color="neutral"
          icon="i-ep-copy-document"
          label="复制结果"
          class="copy-btn"
          @click="copySpeed"
        />
      </div>
    </div>

    <!-- 说明 -->
    <p class="tip">
      带宽与网速为固定 8 倍关系（1 Byte = 8 bits），如 100 Mbps ≈ 12.5
      MB/s。修改任意一侧或切换单位，另一侧实时换算。
    </p>
  </div>
</template>

<style scoped lang="scss">
.bandwidth-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.radix-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radix-label {
  font-size: 13px;
  color: var(--ui-text-muted);
}

.convert-area {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--ui-bg-accented);
  border-radius: 8px;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--ui-text-muted);
}

.panel-row {
  display: flex;
  gap: 8px;
}

.value-input {
  flex: 1;

  :deep(input) {
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
}

.unit-select {
  width: 110px;
}

.copy-btn {
  align-self: flex-start;
  padding: 4px 0;
  height: auto;
}

.equiv {
  font-size: 24px;
  color: var(--ui-text-dimmed);
  text-align: center;
}

.tip {
  margin: 0;
  font-size: 12px;
  color: var(--ui-text-dimmed);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .convert-area {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .equiv {
    transform: rotate(90deg);
  }
}
</style>

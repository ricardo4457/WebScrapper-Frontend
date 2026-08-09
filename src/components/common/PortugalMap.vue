<template>
  <div class="portugal-map">
    <svg
      class="portugal-map__svg"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Mapa de Portugal Continental por distrito e concelho"
    >
      <g
        class="portugal-map__layer portugal-map__layer--distritos"
        :class="{ 'is-hidden': view === 'concelhos' }"
      >
        <path
          v-for="distrito in distritosData.distritos"
          :key="distrito.id"
          :d="distrito.d"
          class="portugal-map__path"
          :class="{
            'is-active': distrito.id === selectedDistrict,
            'is-disabled': !districtsWithData.has(distrito.id),
          }"
          @click="onDistrictClick(distrito)"
        >
          <title>{{ distrito.id }}</title>
        </path>
      </g>

      <g v-if="activeGroup" class="portugal-map__layer portugal-map__layer--concelhos">
        <path
          v-for="concelho in activeGroup.concelhos"
          :key="concelho.id"
          :d="concelho.d"
          class="portugal-map__path"
          :class="{ 'is-active': concelho.id === selectedCity }"
          @click="onConcelhoClick(concelho)"
        >
          <title>{{ concelho.id }}</title>
        </path>
      </g>
    </svg>

    <p v-if="view === 'concelhos'" class="portugal-map__caption">
      {{ activeDistrictName }}, escolhe o concelho
    </p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import distritosData from '@/data/portugal-map/distritos.json'
import concelhosData from '@/data/portugal-map/concelhos.json'

const districtsWithData = new Set(
  concelhosData.distritos.filter((g) => g.concelhos.length).map((g) => g.distrito),
)

const props = defineProps({
  selectedDistrict: { type: String, default: null },
  selectedCity: { type: String, default: null },
})

const emit = defineEmits(['select'])

const FULL_VIEWBOX = distritosData.viewBox.split(' ').map(Number)
const PADDING_RATIO = 0.18
const ANIMATION_MS = 450

const view = ref('distritos')
const activeDistrictName = ref(null)
const viewBox = ref(distritosData.viewBox)

const activeGroup = computed(
  () => concelhosData.distritos.find((g) => g.distrito === activeDistrictName.value) || null,
)

function currentViewBoxArray() {
  return viewBox.value.split(' ').map(Number)
}

// Expands a bounding box to match the SVG's aspect ratio and adds padding,
// so small districts don’t fill the frame edge to edge.
function fitBoxToAspect([xmin, ymin, xmax, ymax]) {
  const boxW = xmax - xmin
  const boxH = ymax - ymin
  const cx = xmin + boxW / 2
  const cy = ymin + boxH / 2

  const targetAspect = FULL_VIEWBOX[2] / FULL_VIEWBOX[3]
  let w = boxW * (1 + PADDING_RATIO)
  let h = boxH * (1 + PADDING_RATIO)

  if (w / h > targetAspect) {
    h = w / targetAspect
  } else {
    w = h * targetAspect
  }

  return [cx - w / 2, cy - h / 2, w, h]
}

function animateViewBox(to) {
  const from = currentViewBoxArray()
  const start = performance.now()
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

  return new Promise((resolve) => {
    function step(now) {
      const t = Math.min((now - start) / ANIMATION_MS, 1)
      const e = ease(t)
      viewBox.value = from.map((v, i) => v + (to[i] - v) * e).join(' ')
      if (t < 1) {
        requestAnimationFrame(step)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

async function onDistrictClick(distrito) {
  if (!districtsWithData.has(distrito.id)) return

  activeDistrictName.value = distrito.id
  view.value = 'concelhos'
  await animateViewBox(fitBoxToAspect(activeGroup.value.bbox))
}

function onConcelhoClick(concelho) {
  emit('select', { district: activeDistrictName.value, city: concelho.id })
}

async function goToOverview() {
  view.value = 'distritos'
  await animateViewBox(FULL_VIEWBOX)
  activeDistrictName.value = null
}

// Keeps the map in sync when the district is selected from the side list
// instead of directly on the map.
watch(
  () => props.selectedDistrict,
  (district) => {
    if (district && district !== activeDistrictName.value && districtsWithData.has(district)) {
      const distrito = distritosData.distritos.find((d) => d.id === district)
      if (distrito) onDistrictClick(distrito)
    } else if (!district && view.value === 'concelhos') {
      goToOverview()
    }
  },
)
</script>

<style scoped>
.portugal-map {
  position: relative;
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
}

.portugal-map__svg {
  width: 100%;
  height: auto;
  display: block;
}

.portugal-map__path {
  fill: #9e9e9e;
  stroke: #fff;
  stroke-width: 24;
  cursor: pointer;
  transition: fill 0.15s ease;
}

.portugal-map__path:hover {
  fill: #757575;
}

.portugal-map__path.is-active {
  fill: rgb(var(--v-theme-primary, 25 118 210));
}

.portugal-map__path.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.portugal-map__path.is-disabled:hover {
  fill: #9e9e9e;
}

.portugal-map__layer {
  transition: opacity 0.2s ease;
}

.portugal-map__layer.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.portugal-map__back {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.portugal-map__caption {
  text-align: center;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
}
</style>

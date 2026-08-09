<template>
  <div class="portugal-map">
    <svg
      class="portugal-map__svg"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Mapa de Portugal Continental por distrito e concelho"
    >
      <g v-if="mode === 'full'" class="portugal-map__layer">
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

      <g v-if="mode === 'concelhos' && activeGroup" class="portugal-map__layer">
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

    <p v-if="mode === 'concelhos' && activeGroup" class="portugal-map__caption">
      {{ selectedDistrict }}, escolhe o concelho
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import distritosData from '@/data/portugal-map/distritos.json'
import concelhosData from '@/data/portugal-map/concelhos.json'

const districtsWithData = new Set(
  concelhosData.distritos.filter((g) => g.concelhos.length).map((g) => g.distrito),
)

const props = defineProps({
  selectedDistrict: { type: String, default: null },
  selectedCity: { type: String, default: null },
  // 'full': distrito overview only, clicking a distrito emits select and the
  // parent step navigates away (DistrictStep).
  // 'concelhos': starts already zoomed on selectedDistrict's concelhos, no
  // distritos layer (CityStep).
  mode: { type: String, default: 'full' },
})

const emit = defineEmits(['select'])

const FULL_VIEWBOX = distritosData.viewBox.split(' ').map(Number)
const PADDING_RATIO = 0.18

const activeGroup = computed(() =>
  props.mode === 'concelhos' && props.selectedDistrict
    ? concelhosData.distritos.find((g) => g.distrito === props.selectedDistrict) || null
    : null,
)

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

const viewBox = computed(() =>
  activeGroup.value ? fitBoxToAspect(activeGroup.value.bbox).join(' ') : distritosData.viewBox,
)

// Selecionar um distrito no mapa passa logo para o step seguinte (Concelho),
// tal como escolher na lista — não há zoom neste mesmo mapa.
function onDistrictClick(distrito) {
  if (!districtsWithData.has(distrito.id)) return
  emit('select', { district: distrito.id, city: null })
}

function onConcelhoClick(concelho) {
  emit('select', { district: props.selectedDistrict, city: concelho.id })
}
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

.portugal-map__caption {
  text-align: center;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
}
</style>

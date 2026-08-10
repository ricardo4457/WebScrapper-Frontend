<template>
  <div class="portugal-map">
    <svg
      v-if="mode === 'overview'"
      key="overview"
      class="portugal-map__svg"
      :viewBox="overviewData.viewBox"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Mapa de Portugal, incluindo Açores e Madeira, por distrito"
    >
      <path
        v-for="distrito in overviewData.mainland"
        :key="distrito.id"
        :d="distrito.d"
        class="portugal-map__path portugal-map__path--overview"
        :class="{
          'is-active': distrito.id === selectedDistrict,
          'is-disabled': !districtsWithData.has(distrito.id),
        }"
        @click="onMainlandDistrictClick(distrito.id)"
      >
        <title>{{ distrito.id }}</title>
      </path>
      <!-- Azores islands -->
      <path
        v-for="(ilha, i) in overviewData.acores"
        :key="`acores-${i}`"
        :d="ilha.d"
        class="portugal-map__path portugal-map__path--overview"
        :class="{ 'is-active': selectedDistrict === 'Açores' }"
        @click="onIslandClick('Açores')"
      >
        <title>Açores</title>
      </path>
      <!-- Madeira islands -->
      <path
        v-for="(ilha, i) in overviewData.madeira"
        :key="`madeira-${i}`"
        :d="ilha.d"
        class="portugal-map__path portugal-map__path--overview"
        :class="{ 'is-active': selectedDistrict === 'Madeira' }"
        @click="onIslandClick('Madeira')"
      >
        <title>Madeira</title>
      </path>
    </svg>
    <!-- Mainland cities -->
    <svg
      v-else-if="mode === 'mainland-concelhos'"
      :key="`mainland-${activeDistrictName}`"
      class="portugal-map__svg"
      :viewBox="mainlandViewBox"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="`Mapa de ${activeDistrictName} por concelho`"
    >
      <g ref="mainlandGroupRef">
        <path
          v-for="concelho in activeMainlandGroup.concelhos"
          :key="concelho.id"
          :d="concelho.d"
          class="portugal-map__path portugal-map__path--mainland"
          :class="{ 'is-active': concelho.id === selectedCity }"
          @click="onConcelhoClick(activeMainlandGroup.distrito, concelho)"
        >
          <title>{{ concelho.id }}</title>
        </path>
      </g>
    </svg>

    <!-- Island municipalities -->
    <svg
      v-else
      :key="`island-${mode}`"
      class="portugal-map__svg"
      :viewBox="islandData.viewBox"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="`Mapa de ${islandData.distrito} por concelho`"
    >
      <path
        v-for="concelho in islandData.concelhos"
        :key="concelho.id"
        :d="concelho.d"
        class="portugal-map__path portugal-map__path--island"
        :class="{ 'is-active': concelho.id === selectedCity }"
        @click="onConcelhoClick(islandData.distrito, concelho)"
      >
        <title>{{ concelho.id }}</title>
      </path>
    </svg>

    <p v-if="mode === 'mainland-concelhos'" class="portugal-map__caption">
      {{ activeDistrictName }}, escolhe o concelho
    </p>
    <p v-else-if="mode === 'acores' || mode === 'madeira'" class="portugal-map__caption">
      {{ islandData.distrito }}, escolhe o concelho
    </p>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import overviewData from '@/data/portugal-map/overview.json'
import concelhosData from '@/data/portugal-map/concelhos.json'
import acoresData from '@/data/portugal-map/acores.json'
import madeiraData from '@/data/portugal-map/madeira.json'

// District step starts in overview mode.
// City step opens the district submap directly.
const districtsWithData = new Set(
  concelhosData.distritos.filter((g) => g.concelhos.length).map((g) => g.distrito),
)

const ISLANDS = { Açores: acoresData, Madeira: madeiraData }

const props = defineProps({
  selectedDistrict: { type: String, default: null },
  selectedCity: { type: String, default: null },
  // District step starts in overview mode.
  // City step opens the district submap directly.
  syncOnMount: { type: Boolean, default: true },
})

// 'select' = final choice (district + city).
// 'district-enter' = district opened, city not chosen yet.
const emit = defineEmits(['select', 'district-enter'])

// Current map mode.
const mode = ref('overview')
const activeDistrictName = ref(null)

const activeMainlandGroup = computed(
  () => concelhosData.distritos.find((g) => g.distrito === activeDistrictName.value) || null,
)

const islandData = computed(() => ISLANDS[mode.value === 'acores' ? 'Açores' : 'Madeira'] || null)

// Mainland municipalities viewBox.
const mainlandGroupRef = ref(null)
const mainlandViewBox = ref(concelhosData.viewBox)

// Update map view without emitting events.
function updateMainlandViewBox() {
  nextTick(() => {
    const el = mainlandGroupRef.value
    if (!el) return
    const bbox = el.getBBox()
    if (!bbox.width || !bbox.height) return
    const paddingX = bbox.width * 0.08
    const paddingY = bbox.height * 0.08
    mainlandViewBox.value = [
      bbox.x - paddingX,
      bbox.y - paddingY,
      bbox.width + paddingX * 2,
      bbox.height + paddingY * 2,
    ].join(' ')
  })
}

// User clicks a mainland district.
function selectMainlandDistrict(name) {
  if (!districtsWithData.has(name)) return
  activeDistrictName.value = name
  mode.value = 'mainland-concelhos'
  updateMainlandViewBox()
}

function selectIsland(name) {
  activeDistrictName.value = name
  mode.value = name === 'Açores' ? 'acores' : 'madeira'
}

// User clicks an island.
function onMainlandDistrictClick(name) {
  selectMainlandDistrict(name)
  emit('district-enter', name)
}

function onIslandClick(name) {
  selectIsland(name)
  emit('district-enter', name)
}

function onConcelhoClick(district, concelho) {
  emit('select', { district, city: concelho.id })
}

function goToOverview() {
  mode.value = 'overview'
  activeDistrictName.value = null
}

// Keep map synced with external district changes.
watch(
  () => props.selectedDistrict,
  (district) => {
    if (!district) {
      goToOverview()
      return
    }
    if (district === 'Açores' || district === 'Madeira') {
      selectIsland(district)
      return
    }
    if (district !== activeDistrictName.value && districtsWithData.has(district)) {
      selectMainlandDistrict(district)
    }
  },
  { immediate: props.syncOnMount },
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
  cursor: pointer;
  transition: fill 0.15s ease;
}

.portugal-map__path:hover {
  fill: #757575;
}

.portugal-map__path.is-active {
  fill: rgb(var(--v-theme-primary, 46 125 50));
}

.portugal-map__path.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.portugal-map__path.is-disabled:hover {
  fill: #9e9e9e;
}

/* Stroke width differs per SVG source. */
.portugal-map__path--overview,
.portugal-map__path--island {
  stroke-width: 1;
}

.portugal-map__path--mainland {
  stroke-width: 24;
}

.portugal-map__caption {
  text-align: center;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
}
</style>

<template>
  <canvas ref="canvasRef" height="280" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  history: { type: Array, required: true }, // [{ price, recorded_at }, ...], recent first
})

const canvasRef = ref(null)
let chart = null

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const currencyFormatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

function buildChartData() {
  // The API returns data from newest to oldest,
  // but the chart is more readable in chronological order
  // (oldest on the left to newest on the right).
  const chronological = [...props.history].reverse()

  return {
    labels: chronological.map((h) => dateFormatter.format(new Date(h.recorded_at))),
    datasets: [
      {
        label: 'Preço (€)',
        data: chronological.map((h) => Number(h.price)),
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.2,
        fill: true,
      },
    ],
  }
}

function renderChart() {
  if (!canvasRef.value) return

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(canvasRef.value, {
    type: 'line',
    data: buildChartData(),
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => currencyFormatter.format(ctx.parsed.y),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => currencyFormatter.format(value),
          },
        },
      },
    },
  })
}

onMounted(renderChart)
watch(() => props.history, renderChart)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="status-banner" :class="`status-banner--${variant}`" role="status">
    <div class="status-banner__icon">
      <span class="status-banner__ring" />
      <v-icon :icon="icon" size="20" />
    </div>

    <div class="status-banner__body">
      <p class="status-banner__message">{{ message }}</p>
      <p class="status-banner__hint">{{ resolvedHint }}</p>
    </div>

    <div class="status-banner__track">
      <span class="status-banner__sweep" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: String, default: 'A recolher informação...' },
  // 'scraping': actively fetching live data from wook.pt (default).
  // 'stale': background refresh, results shown are already usable.
  variant: { type: String, default: 'scraping' },
  hint: { type: String, default: null },
})

const icon = computed(() =>
  props.variant === 'stale' ? 'mdi-cloud-refresh-outline' : 'mdi-book-open-page-variant-outline',
)

const defaultHints = {
  scraping: 'A verificar em tempo real, pode demorar alguns segundos.',
  stale: 'Os dados são atualizados assim que a pesquisa terminar.',
}

const resolvedHint = computed(() => props.hint ?? defaultHints[props.variant])
</script>

<style scoped>
.status-banner {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5, 20px);
  margin-bottom: var(--space-4);
  border-radius: 16px;
  border: 1.5px solid rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.06);
  overflow: hidden;
}

.status-banner--stale {
  border-color: rgba(var(--v-theme-on-surface), 0.2);
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.status-banner__icon {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.status-banner--stale .status-banner__icon {
  background: rgba(var(--v-theme-on-surface), 0.6);
  color: rgb(var(--v-theme-surface));
}

.status-banner__ring {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 2px solid rgb(var(--v-theme-primary));
  animation: status-banner-ping 2s ease-out infinite;
}

.status-banner--stale .status-banner__ring {
  border-color: rgba(var(--v-theme-on-surface), 0.5);
}

.status-banner__body {
  min-width: 0;
  flex: 1;
}

.status-banner__message {
  margin: 0;
  font-weight: 600;
  font-size: 14.5px;
  color: rgb(var(--v-theme-primary));
}

.status-banner--stale .status-banner__message {
  color: rgb(var(--v-theme-on-surface));
}

.status-banner__hint {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.status-banner__track {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: rgba(var(--v-theme-primary), 0.15);
  overflow: hidden;
}

.status-banner--stale .status-banner__track {
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.status-banner__sweep {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40%;
  border-radius: 2px;
  background: rgb(var(--v-theme-primary));
  animation: status-banner-sweep 1.6s ease-in-out infinite;
}

.status-banner--stale .status-banner__sweep {
  background: rgba(var(--v-theme-on-surface), 0.5);
}

@keyframes status-banner-ping {
  0% {
    transform: scale(0.85);
    opacity: 0.55;
  }
  70%,
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

@keyframes status-banner-sweep {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-banner__ring,
  .status-banner__sweep {
    animation: none;
  }
}
</style>

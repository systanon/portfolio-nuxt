<template>
  <div class="solar-system">
    <div class="solar-system__sun"></div>
    <div
      v-for="planet in solarSystem"
      :key="planet.name"
      class="solar-system__orbit"
      :style="{
        width: planet.orbitSize + 'px',
        height: planet.orbitSize + 'px',
      }"
      :ref="setOrbitRef(planet.name)"
    >
      <div
        class="solar-system__orbit-planet"
        :ref="setPlanetRef(planet.name)"
        :style="{
          width: planet.planetSize + 'px',
          height: planet.planetSize + 'px',
          background: planet.gradient,
        }"
      >
        <div
          v-if="planet.rings"
          class="solar-system__planet-rings"
          :style="{
            width: planet.rings.width + 'px',
            height: planet.rings.height + 'px',
            background: planet.rings.gradient,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createSolarSystem } from '~/utils/animations'
import type { PlanetConfig } from '~/utils/animations/solarSystem'

import { solarSystem } from '~/config/solar-system'

const orbitRefs = new Map<string, HTMLElement>()
const planetRefs = new Map<string, HTMLElement>()

const setOrbitRef =
  (name: string) => (el: Element | ComponentPublicInstance | null) => {
    if (el instanceof HTMLElement) {
      orbitRefs.set(name, el)
    }
  }

const setPlanetRef =
  (name: string) => (el: Element | ComponentPublicInstance | null) => {
    if (el instanceof HTMLElement) {
      planetRefs.set(name, el)
    }
  }

onMounted(() => {
  const config: PlanetConfig[] = solarSystem.map((planet) => ({
    orbitEl: orbitRefs.get(planet.name) ?? null,
    duration: planet.duration,
  }))
  createSolarSystem(config)
})
</script>

<style scoped lang="scss">
.solar-system {
  position: relative;
  width: 100%;
  height: 100%;

  &__sun {
    position: absolute;
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, #ffd700, #ff8c00);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 30px rgba(255, 223, 0, 0.6);
  }

  &__orbit {
    position: absolute;
    border: 1px dashed rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: center center;
  }

  &__orbit-planet {
    position: absolute;
    border-radius: 50%;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: center;
  }

  &__planet-rings {
    position: absolute;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

<template>
  <section
    class="default-layout"
    :style="{
      '--x': `${offsetX * 10}px`,
      '--y': `${offsetY * 10}px`,
    }"
  >
    <Comets />
    <AppHeader />

    <main class="default-layout__main">
      <div class="container">
        <NuxtPage />
      </div>
    </main>

    <HomeFooter />
  </section>
</template>

<script lang="ts" setup>
const offsetX = ref(0)
const offsetY = ref(0)
let frame: number | null = null

function handleMouseMove(event: MouseEvent) {
  if (frame) return
  frame = requestAnimationFrame(() => {
    offsetX.value = (event.clientX / window.innerWidth - 0.5) * 2
    offsetY.value = (event.clientY / window.innerHeight - 0.5) * 2
    frame = null
  })
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (frame) cancelAnimationFrame(frame)
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped lang="scss">
.default-layout {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: visible;

  &__main {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding-top: rem(45);
  }

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('~/assets/images/space.webp');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -2;
  }

  &::after {
    content: '';
    top: 17%;
    left: 50%;
    position: absolute;
    width: 100%;
    height: 100%;
    max-width: rem(800);
    max-height: rem(800);
    background-image: url('~/assets/images/earth.webp');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    transform: translateX(-50%);
    z-index: -2;
  }
}

@include media-query('desktop') {
  .default-layout {
    overflow: hidden;

    &::after {
      transform: translate(var(--x), var(--y)) translateX(-50%);
      transition: transform 0.1s ease-out;
      will-change: transform;
    }
  }
}
</style>

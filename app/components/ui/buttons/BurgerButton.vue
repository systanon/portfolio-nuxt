<template>
  <button ref="burgerBtn" class="burger-btn">
    <span ref="line1" class="burger-btn__item" />
    <span ref="line2" class="burger-btn__item" />
    <span ref="line3" class="burger-btn__item" />
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createBurger } from '@/animations'

export interface IBurgerButton {
  play: () => void
  reverse: () => void
}

const play = ref<() => void>(() => {})
const reverse = ref<() => void>(() => {})

const line1 = ref<HTMLSpanElement>()
const line2 = ref<HTMLSpanElement>()
const line3 = ref<HTMLSpanElement>()

onMounted(() => {
  const burger = createBurger([line1!.value!, line2.value!, line3.value!])

  burger.init()

  play.value = burger.play

  reverse.value = burger.reverse
})
defineExpose({ play: () => play.value(), reverse: () => reverse.value() })
</script>

<style lang="scss" scoped>
.burger-btn {
  width: rem(32);
  height: rem(24);
  cursor: pointer;
  z-index: 1001;
  position: relative;
  background: none;
  border: none;

  &__item {
    width: 100%;
    height: 100%;
    position: absolute;
    height: rem(3);
    left: 0;
    background: var(--text-color-primary);
    border-radius: rem(2);
    transform-origin: center;
    will-change: transform, opacity;

    &:nth-child(1) {
      top: 0;
    }
    &:nth-child(2) {
      bottom: 50%;
      transform: translateY(50%);
    }
    &:nth-child(3) {
      bottom: 0;
    }
  }
}
</style>

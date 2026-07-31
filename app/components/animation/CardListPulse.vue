<template>
  <div class="card-list">
    <Card
      v-for="(tech, index) in techList"
      ref="items"
      :key="index"
      class="pulse-item"
      :icon-name="tech.icon"
      :is-hover="isLast(index)"
      :width="tech.width"
      :height="tech.height"
      @click="isLast(index) && router.push('/about-me')"
    >
      <h2>
        {{ tech.text }}
        <UiIcon
          v-if="tech.hasIcon"
          name="arrow"
          color="tertiary"
          size="medium"
        />
      </h2>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type ComponentPublicInstance } from 'vue'
import { createPulse } from '~/animations'
import { animationController } from '~/animations/animationController'

export type Tech = {
  icon: string
  text: string
  width: number
  height: number
  hasIcon?: boolean
}

const props = defineProps<{
  techList: Tech[]
}>()

const router = useRouter()
const items = ref<ComponentPublicInstance[]>([])

const isLast = (index: number) => {
  return index === props.techList.length - 1
}

onMounted(async () => {
  await animationController.waitAll()
  createPulse(items.value)
})
</script>

<style scoped lang="scss">
.card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: rem(15);
}
</style>

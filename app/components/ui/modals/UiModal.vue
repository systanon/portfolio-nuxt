<template>
  <Teleport to="#teleports">
    <div v-bind="$attrs" class="ui-modal">
      <div
        v-if="isOpen"
        ref="backdropRef"
        class="ui-modal__backdrop backdrop"
        @click="close"
      >
        <div ref="dialogRef" class="ui-modal__dialog" @click.stop>
          <template v-if="title">
            <h2>{{ title }}</h2>
            <hr />
          </template>
          <slot></slot>
          <hr />
          <div class="ui-modal__actions">
            <slot name="actions" :close="close" :confirm="confirm">
              <UiButton @click="close" label="Cancel" />
              <UiButton @click="confirm(true)" label="Ok" />
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import UiButton from '~/components/ui/buttons/UiButton.vue'
import { useEscapeKey } from '~/composables/useEscapeKey'
import { createModalAnimation } from '~/utils/animations/'

export type ModalOpen<T = any> = () => Promise<null | T>
export interface IModalOpen<T = boolean> {
  open: ModalOpen<T>
  confirm: (result: T | null) => void
}

const props = withDefaults(
  defineProps<{
    title?: string
    id?: number
  }>(),
  {
    id: Date.now(),
  },
)

const backdropRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)

const isOpen = ref(false)

let resolver: ((...args: any[]) => void) | null = null

const open = async (): Promise<any> => {
  isOpen.value = true
  await nextTick()

  if (backdropRef.value && dialogRef.value) {
    createModalAnimation.init(props.id, backdropRef.value, dialogRef.value)
  }
  createModalAnimation.open(props.id)

  return new Promise((res) => {
    resolver = res
  })
}

const confirm = async (...params: any[]) => {
  if (resolver) resolver(...params)

  await createModalAnimation.close(props.id, () => (isOpen.value = false))
}

const close = () => {
  confirm(null)
}

useEscapeKey(close)

defineExpose({
  open,
  confirm,
})
</script>

<style scoped lang="scss">
.ui-modal {
  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    opacity: 0;
  }
  &__dialog {
    background-color: var(--bg-tertiary);
    width: calc(100% - rem(15));
    max-width: rem(600);
    border-radius: rem(10);
    padding: rem(20);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 101;
    opacity: 0;
  }
  &__actions {
    display: flex;
    gap: 1em;
    justify-content: end;
    text-align: right;
  }
}
</style>

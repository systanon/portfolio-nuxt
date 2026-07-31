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
            <hr >
          </template>
          <slot />
          <hr >
          <div class="ui-modal__actions">
            <slot name="actions" :close="close" :confirm="confirm">
              <UiButton label="Cancel" @click="close" />
              <UiButton label="Ok" @click="confirm(true)" />
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
import { createModalManager } from '~/animations/'

export type ModalOpen<T = unknown> = () => Promise<null | T>
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
    title: '',
    id: Date.now(),
  },
)

const backdropRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)

const isOpen = ref(false)

let resolver: ((...args: unknown[]) => void) | null = null

const open = async (): Promise<unknown> => {
  isOpen.value = true
  await nextTick()

  if (backdropRef.value && dialogRef.value) {
    createModalManager.init(props.id, backdropRef.value, dialogRef.value)
  }
  createModalManager.open(props.id)

  return new Promise((res) => {
    resolver = res
  })
}

const confirm = async (...params: unknown[]) => {
  if (resolver) resolver(...params)

  await createModalManager.close(props.id, () => (isOpen.value = false))
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
    z-index: var(--z-overlay);
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
    z-index: var(--z-modal);
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

<template>
  <div class="note-item">
    <div class="note-item__info">
      <h2 class="note-item__title">{{ note.title }}</h2>
      <p class="note-item__description">{{ note.description }}</p>
    </div>
    <div ref="menuRef" :class="['note-item__menu', { _open: menuOpen }]">
      <UiButtonIcon
        :class="['note-item__menu-btn', { _open: menuOpen }]"
        icon-name="arrow-up-left"
        :with-border="false"
        icon-color="tertiary"
        :aria-expanded="menuOpen"
        aria-haspopup="true"
        :aria-controls="menuActionsId"
        aria-label="Note actions"
        @click="toggleMenu"
      />

      <div
        :id="menuActionsId"
        class="note-item__menu-actions"
        role="group"
        aria-label="Note actions"
      >
        <UiButtonIcon
          class="note-item__menu-item"
          icon-name="edit"
          aria-label="Edit note"
          :with-border="false"
          icon-color="tertiary"
          @click="emit('edit', note)"
        />
        <UiButtonIcon
          class="note-item__menu-item"
          icon-name="trash"
          aria-label="Delete note"
          :with-border="false"
          icon-color="tertiary"
          @click="emit('delete', note)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Note } from '~/types/note'

defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  (e: 'edit' | 'delete', note: Note): void
}>()

const menuActionsId = useId()
const menuOpen: Ref<boolean> = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const toggleMenu = () => (menuOpen.value = !menuOpen.value)
onClickOutside(menuRef, () => (menuOpen.value = false))
</script>

<style scoped lang="scss">
.note-item {
  position: relative;
  padding: rem(15) rem(60) rem(15) rem(15);
  border-radius: rem(16);
  border: var(--todo-checked) solid 1px;
  display: flex;
  gap: rem(16);
  width: 100%;
  height: rem(250);
  background-color: var(--bg-primary);
  color: var(--text-color-secondary);
  overflow: hidden;

  &__info {
    flex: 1 1;
  }

  &__menu {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    transform: translateX(70%);
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    gap: rem(50);
    background-color: var(--bg-tertiary);
    &-btn {
      :deep(.ui-icon) {
        transition: transform 0.3s ease;
        transform: rotate(-45deg);
      }
      &._open {
        :deep(.ui-icon) {
          transform: rotate(135deg);
        }
      }
    }
    &._open {
      transform: translateX(0);
    }

    &-actions {
      display: flex;
      flex-direction: column;
      gap: rem(16);
    }
  }
  :deep(._icon-hover) {
    &:hover {
      color: var(--icon-hover-secondary);
    }
  }
}
</style>

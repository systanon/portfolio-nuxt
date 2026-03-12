<template>
  <div :class="['todo-item', { _checked: todo.completed }]">
    <div class="todo-item__checked">
      <UiCheckbox :modelValue="todo.completed" @change="onToggleComplete" />
    </div>
    <div class="todo-item__info">
      <h2 class="todo-item__title">
        {{ todo.title }}
      </h2>
      <p class="todo-item__description">{{ todo.description }}</p>
      <div class="todo-item__actions">
        <UiButton label="More detail" @click="$emit('detail', todo.id)" />
      </div>
    </div>
    <div ref="menuRef" class="todo-item__menu">
      <UiButtonIcon
        class="todo-item__menu-open"
        iconName="arrow-up-left"
        :withBorder="false"
        @click="toggleMenu"
        iconColor="tertiary"
      />
      <div v-if="menuOpen" class="todo-item__menu-actions">
        <UiButtonIcon
          class="todo-item__menu-item"
          style="--i: 2; --icon-hover-primary: var(--icon-hover-secondary)"
          iconName="edit"
          :withBorder="false"
          iconColor="tertiary"
          @click="$emit('edit', todo)"
        />
        <UiButtonIcon
          class="todo-item__menu-item"
          style="--i: 1; --icon-hover-primary: var(--icon-hover-secondary)"
          iconName="trash"
          :withBorder="false"
          iconColor="tertiary"
          @click="$emit('delete', todo)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import type { Todo } from '~/types/todo'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  (e: 'toggle', data: { id: number; payload: { completed: boolean } }): void
  (e: 'detail', id: number): void
  (e: 'edit', todo: Todo): void
  (e: 'delete', todo: Todo): void
}>()

const menuOpen: Ref<boolean> = ref(false)

const menuRef = ref<HTMLElement | null>(null)

const toggleMenu = () => (menuOpen.value = !menuOpen.value)

const onToggleComplete = () => {
  emit('toggle', {
    id: props.todo.id,
    payload: { completed: !props.todo.completed },
  })
}

onClickOutside(menuRef, () => (menuOpen.value = false))
</script>

<style scoped lang="scss">
.todo-item {
  position: relative;
  padding: rem(15) 0 rem(15) rem(15);
  border-radius: 1rem;
  border: transparent solid 1px;
  display: grid;
  gap: rem(16);
  width: 100%;
  background-color: var(--bg-primary);
  color: var(--text-color-secondary);
  overflow: hidden;

  &__checked {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__info {
    display: flex;
    flex-direction: column;
    gap: rem(25);
  }
  &__title {
    @include break-long-words;
    @include truncate-multi-line(1);
  }

  &__description {
    @include break-long-words;
    @include truncate-multi-line(1);
  }

  &__actions {
    text-align: center;
  }

  &__menu {
    position: absolute;
    bottom: 0;
    right: 0;

    &-open {
      position: relative;
      z-index: 3;
    }

    &-actions {
      position: absolute;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--bg-quaternary);
      z-index: 1;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-item {
      --count: 2;
      --index: var(--i);
      --radius: 85px;
      --start-angle: -176deg;
      --spread: 88deg;

      position: absolute;
      --angle: calc(
        var(--start-angle) + (var(--spread) / (var(--count) - 1)) *
          (var(--index) - 1)
      );

      transform: rotate(var(--angle)) translate(var(--radius))
        rotate(calc(var(--angle) * -1));

      transition: transform 0.3s ease;
      z-index: 10;
    }

    &:before {
      content: '';
      position: absolute;
      width: 200%;
      height: 200%;
      border-radius: 50%;
      background: var(--bg-tertiary);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }
  }

  &._checked {
    border-color: var(--todo-checked);
  }

  :deep(._icon-hover) {
    &:hover {
      color: var(--icon-hover-secondary);
    }
  }
}

@include media-query('mobile') {
  .todo-item {
    grid-template-columns: auto 1fr 0.2fr;
  }
}
</style>

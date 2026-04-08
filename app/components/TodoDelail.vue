<template>
  <div class="todo-detail">
    <h3 class="todo-detail__title">{{ todo.title }}</h3>
    <p class="todo-detail__description">{{ todo.description }}</p>
    <div class="todo-detail__meta">
      <span>Created:</span>
      <span>{{ formatDateTime(todo.created_at) }}</span>
      <span>Updated:</span>
      <span>{{ formatDateTime(todo.updated_at) }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Todo } from '@/types/todo'
import { formatDateTime } from '~/utils/formatDateTime'
defineProps<{
  todo: Todo
}>()
</script>
<style lang="scss" scoped>
.todo-detail {
  &__title {
    text-align: center;
    padding-bottom: rem(25);
  }
  &__description {
    padding-bottom: rem(25);
    line-height: rem(30);
  }
  &__meta {
    display: grid;
    grid-template-columns: auto 1fr;
    row-gap: rem(10);
    column-gap: rem(10);
    text-align: left;
  }
}
</style>

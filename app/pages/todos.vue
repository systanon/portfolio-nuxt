<template>
  <section class="page-todo">
    <h2 class="page-todo__title">This is Todos page</h2>
    <UiButtonIcon
      class="page-todo__create"
      iconName="plus"
      iconColor="tertiary"
    >
      <template #prepend>
        <span class="page-todo__create-text"> Create todo </span>
      </template>
    </UiButtonIcon>
    <section class="page-todo__todos">
      <TodoItem
        v-for="todo of rows"
        :key="todo.id"
        :todo="todo"
        @toggle="toggle"
      />
    </section>
  </section>
</template>

<script lang="ts" setup>
import { useTodoStore } from '~/store/todo'
import type { Todo } from '~/types/todo'
const todoStore = useTodoStore()
const { pages, rows } = storeToRefs(todoStore)
const { getAll, update, create, remove } = todoStore

const toggle = ({
  id,
  payload,
}: {
  id: number
  payload: { completed: boolean }
}) => {
  update(id, payload)
}

onMounted(() => {
  getAll()
  todoStore.initWS()
})

onUnmounted(() => {
  todoStore.destroyWS()
})
</script>

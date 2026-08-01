<template>
  <div class="todo-page">
    <h2 class="todo-page__title">Todo details</h2>
    <template v-if="todo">
      <TodoDelail :todo="todo" />
    </template>
    <template v-else>
      <p>not found</p>
    </template>
  </div>
</template>

<script lang="ts" setup>
import TodoDelail from '@/components/TodoDelail.vue'
import { AppSuccess } from '~/types/app.types'
import { useTodoStore } from '~/store/todo'
definePageMeta({
  name: 'TodoDetail',
})

useSeoMeta({
  title: 'Todo Details',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const { $api } = useNuxtApp()

const todoStore = useTodoStore()

const id = computed(() => Number(route.params.id))

const { data: todo } = await useAsyncData(`todo-${id.value}`, async () => {
  const res = await $api.todo.getOne(id.value)

  if (res instanceof AppSuccess) {
    todoStore.setCurrentTodo(res.data)
    return res.data
  }

  return null
})

onBeforeUnmount(() => {
  todoStore.setCurrentTodo(null)
})
</script>
<style scoped lang="scss">
.todo-page {
  &__title {
    padding-bottom: rem(50);
    text-align: center;
  }
}
</style>

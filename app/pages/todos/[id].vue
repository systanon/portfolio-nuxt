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
import type { Todo } from '~/types/todo'

const route = useRoute()
const app = useApp()

const id = computed(() => Number(route.params.id))

const { data: todo } = await useAsyncData(`todo-${id.value}`, async () => {
  const res = await app.getOneTodo(id.value)

  if (res instanceof AppSuccess) {
    return res.data
  }

  return null
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

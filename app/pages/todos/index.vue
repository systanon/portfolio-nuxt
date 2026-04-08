<template>
  <section class="page-todo">
    <h2 class="page-todo__title">This is Todos page</h2>
    <section class="page-todo__filters">
      <UiInput
        v-model="q"
        class="page-todo__search"
        placeholder="Search todos…"
      />

      <UiSelect
        v-model="completed"
        class="page-todo__select"
        :options="todoCompletedFilters"
      />

      <UiSelect
        v-model="sortOrder"
        class="page-todo__select"
        :options="createdFilters"
      />
    </section>
    <UiButtonIcon
      class="page-todo__create"
      iconName="plus"
      iconColor="tertiary"
      @click="openCreateForm"
    >
      <template #prepend>
        <span class="page-todo__create-text"> Create todo </span>
      </template>
    </UiButtonIcon>
    <template v-if="!loading">
      <section v-if="rows.length" class="page-todo__todos">
        <TodoItem
          v-for="todo of rows"
          :key="todo.id"
          :todo="todo"
          @edit="openEditForm"
          @delete="deleteHandler"
          @toggle="toggle"
          @detail="getDetail"
        />
      </section>
      <section v-else>
        <NoDataFound label="Empty todos" />
      </section>
    </template>
    <Loader v-else />
    <section class="page-todo__pagination">
      <UiPagination
        v-model:page="pagination.page"
        v-model:pages="pages"
        @first-page="firstPage"
        @latest-page="latestPage"
        @btn-page="btnPage"
        @prev-page="prevPage"
        @next-page="nextPage"
      />
    </section>
  </section>
  <UiModal ref="deleteModalRef" title="Delete todo?" class="page-todo__modal">
    <template #default>
      <div class="page-todo__modal-form delete-todo-form">
        <h3>Are you sure you want to delete todo?</h3>
      </div>
    </template>
    <template #actions="{ close, confirm }">
      <UiButton @click="close" label="Cancel" />
      <UiButton @click="confirm" label="Delete todo" />
    </template>
  </UiModal>
  <UiModal ref="editModalRef" title="Update Todo">
    <ItemForm
      ref="editFormRef"
      :title="editingTodo?.title"
      :description="editingTodo?.description"
    />
    <template #actions="{ close }">
      <UiButton @click="close" label="Cancel" />
      <UiButton @click="updateTodo" label="Update todo" />
    </template>
  </UiModal>

  <UiModal ref="createModalRef" title="Create Todo">
    <ItemForm ref="createFormRef" />

    <template #actions="{ close }">
      <UiButton @click="close" label="Cancel" />
      <UiButton @click="createTodo" label="Create todo" />
    </template>
  </UiModal>
</template>

<script lang="ts" setup>
import type { IModalOpen } from '~/components/ui/modals/UiModal.vue'
import { useAppStore } from '~/store/application'
import { useTodoStore } from '~/store/todo'
import { AppError } from '~/types/app-errors'
import type { Todo } from '~/types/todo'
import { todoCompletedFilters, createdFilters } from '~/constants/filters'
definePageMeta({
  name: 'TodoList',
})
const createFormRef = ref()
const editFormRef = ref()
const editingTodo = ref<Todo | undefined>(undefined)

const deleteModalRef = ref<IModalOpen | null>(null)
const editModalRef = ref<IModalOpen | null>(null)
const createModalRef = ref<IModalOpen | null>(null)

const todoStore = useTodoStore()
const appStore = useAppStore()
const { pages, rows } = storeToRefs(todoStore)
const { loading } = storeToRefs(appStore)
const { getAll, update, create, remove } = todoStore
const {
  pagination,
  firstPage,
  prevPage,
  nextPage,
  latestPage,
  btnPage,
  saveQuery,
  requestParams,
} = usePaginatedRoute(pages)

const { q, completed, sortOrder, requestFiltersParams } = useFilters()

const requestAllParams = computed(() => ({
  ...requestParams.value,
  ...requestFiltersParams.value,
}))

const openEditForm = async (todo: Todo) => {
  editingTodo.value = todo
  await editModalRef.value?.open()
  editingTodo.value = undefined
}

const openCreateForm = () => {
  createModalRef.value?.open()
}

const getDetail = (id: number) => {
  navigateTo(`/todos/${id}`)
}

const submitWithModal = async (
  modal: IModalOpen | null,
  action: () => Promise<unknown>,
) => {
  const res = await action()
  if (!(res instanceof AppError)) {
    modal?.confirm(true)
  }
}

const createTodo = async () => {
  const data = await createFormRef.value?.submit()
  if (!data) return

  await submitWithModal(createModalRef.value, () => create(data))
}

const updateTodo = async () => {
  const data = await editFormRef.value?.submit()
  const id = editingTodo.value?.id
  if (!data || !id) return

  await submitWithModal(editModalRef.value, () => update(id as number, data))
}

const deleteHandler = async (todo: Todo) => {
  const { id } = todo
  const modal = deleteModalRef.value
  const confirmed = await modal?.open()
  if (confirmed) {
    const removeResult = await remove(id)
    if (removeResult instanceof AppError) return
  }
}

const toggle = ({
  id,
  payload,
}: {
  id: number
  payload: { completed: boolean }
}) => {
  update(id, payload)
}

watch([q, completed, sortOrder], () => {
  firstPage()
})

useAsyncData(
  () => `todos-${JSON.stringify(requestAllParams.value)}`,
  async () => {
    await getAll(requestAllParams.value)
    saveQuery(requestFiltersParams.value)
    return true
  },
  { watch: [requestAllParams] },
)

onMounted(() => {
  todoStore.initWS()
})

onUnmounted(() => {
  todoStore.destroyWS()
})
</script>

<style scoped lang="scss">
.page-todo {
  display: flex;
  flex-direction: column;
  gap: rem(32);
  height: 100%;

  &__title {
    text-align: center;
  }
  &__filters {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(12);
    align-items: center;
    max-width: rem(720);
    margin: 0 auto;
    width: 100%;
    :deep(.ui-input__field) {
      background-color: var(--backdrop-color);
      color: var(--text-color-secondary);
    }
  }

  &__create {
    margin: 0 auto;
    background-color: var(--backdrop-color);
  }

  &__todos {
    display: grid;
    gap: rem(30);
  }

  &__modal-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  &__pagination {
    margin-top: auto;
  }
}
@include media-query('tablet') {
  .page-todo__filters {
    grid-template-columns: 1fr rem(180) rem(180);
  }
  .page-todo__todos {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

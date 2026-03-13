<template>
  <section class="page-todo">
    <h2 class="page-todo__title">This is Todos page</h2>
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
    <section class="page-todo__todos">
      <TodoItem
        v-for="todo of rows"
        :key="todo.id"
        :todo="todo"
        @edit="openEditForm"
        @delete="deleteHandler"
        @toggle="toggle"
      />
      <UiPaginationMobile
        v-if="isMobile || isTablet"
        v-model:page="pagination.page"
        v-model:pages="pagination.pages"
        @prev-page="prevPage"
        @next-page="nextPage"
      />
      <UiPagination
        v-else
        class="page-todo__pagination"
        v-model:page="pagination.page"
        v-model:pages="pagination.pages"
        @first-page="firstPage"
        @latest-page="latestPage"
        @btn-page="btnPage"
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
import { useTodoStore } from '~/store/todo'
import { AppError } from '~/types/app-errors'
import type { Todo } from '~/types/todo'

const createFormRef = ref()
const editFormRef = ref()
const editingTodo = ref<Todo | undefined>(undefined)

const deleteModalRef = ref<IModalOpen | null>(null)
const editModalRef = ref<IModalOpen | null>(null)
const createModalRef = ref<IModalOpen | null>(null)

const { isTablet, isMobile } = useWindowResize()

const todoStore = useTodoStore()
const { pages, rows } = storeToRefs(todoStore)
const { getAll, update, create, remove } = todoStore
const {
  pagination,
  firstPage,
  prevPage,
  nextPage,
  latestPage,
  btnPage,
  setPages,
  saveQuery,
  requestParams,
} = usePaginatedRoute(pages)
const openEditForm = async (todo: Todo) => {
  editingTodo.value = todo
  await editModalRef.value?.open()
  editingTodo.value = undefined
}

const openCreateForm = () => {
  createModalRef.value?.open()
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
  const id = editingTodo?.value?.id
  if (!data || !id) return

  await submitWithModal(editModalRef.value, () => update(id as number, data))
}

const deleteHandler = async (todo: Todo) => {
  const { id } = todo
  const modal = deleteModalRef.value
  const res = await modal?.open()
  if (res) {
    const res = await remove(id)
    if (res instanceof AppError) return
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

watch(requestParams, (params) => {
  getAll(params)
  saveQuery()
})

onMounted(() => {
  getAll(requestParams.value)
  saveQuery()
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
  &__create {
    margin: 0 auto;
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
}
@include media-query('tablet') {
  .page-todo__todos {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

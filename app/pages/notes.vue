<template>
  <section class="page-note">
    <h2 class="page-note__title">This is Notes page</h2>
    <section class="page-note__filters">
      <UiInput
        v-model="q"
        class="page-note__search"
        placeholder="Search notes…"
      />

      <UiSelect
        v-model="sortOrder"
        class="page-note__select"
        :options="createdFilters"
      />
    </section>
    <UiButtonIcon
      class="page-note__create"
      iconName="plus"
      iconColor="tertiary"
      @click="openCreateForm"
    >
      <template #prepend>
        <span class="page-note__create-text"> Create note </span>
      </template>
    </UiButtonIcon>
    <template v-if="!loading">
      <section v-if="rows.length" class="page-note__items">
        <NoteItem
          v-for="note of rows"
          :key="note.id"
          :note="note"
          @edit="openEditForm"
          @delete="deleteHandler"
        />
      </section>
      <section v-else>
        <NoDataFound label="Empty notes" />
      </section>
    </template>
    <Loader v-else />
    <section class="page-note__pagination">
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
  <UiModal ref="deleteModalRef" title="Delete note?" class="page-note__modal">
    <template #default>
      <div class="page-note__modal-form delete-note-form">
        <h3>Are you sure you want to delete note?</h3>
      </div>
    </template>
    <template #actions="{ close, confirm }">
      <UiButton @click="close" label="Cancel" />
      <UiButton @click="confirm" label="Delete note" />
    </template>
  </UiModal>
  <UiModal ref="editModalRef" title="Update Note">
    <ItemForm
      ref="editFormRef"
      :title="editingNote?.title"
      :description="editingNote?.description"
    />
    <template #actions="{ close }">
      <UiButton @click="close" label="Cancel" />
      <UiButton @click="submitUpdateNote" label="Update note" />
    </template>
  </UiModal>
  <UiModal ref="createModalRef" title="Create Note">
    <ItemForm ref="createFormRef" />

    <template #actions="{ close }">
      <UiButton @click="close" label="Cancel" />
      <UiButton @click="submitCreateNote" label="Create note" />
    </template>
  </UiModal>
</template>

<script lang="ts" setup>
import type { IModalOpen } from '~/components/ui/modals/UiModal.vue'
import { useAppStore } from '~/store/application'
import { useNoteStore } from '~/store/note'
import { AppError } from '~/types/app-errors'
import { createdFilters } from '~/constants/filters'
import type { Note } from '~/types/note'

definePageMeta({
  name: 'NoteList',
  accessMode: 'private',
})

const createFormRef = ref()
const editFormRef = ref()
const editingNote = ref<Note | undefined>(undefined)

const deleteModalRef = ref<IModalOpen | null>(null)
const editModalRef = ref<IModalOpen | null>(null)
const createModalRef = ref<IModalOpen | null>(null)

const noteStore = useNoteStore()
const appStore = useAppStore()
const { pages, rows } = storeToRefs(noteStore)
const { loading } = storeToRefs(appStore)
const { getAll, update, create, remove } = noteStore
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

const openEditForm = async (note: Note) => {
  editingNote.value = note
  await editModalRef.value?.open()
  editingNote.value = undefined
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

const submitCreateNote = async () => {
  const data = await createFormRef.value?.submit()
  if (!data) return

  await submitWithModal(createModalRef.value, () => create(data))
}

const submitUpdateNote = async () => {
  const data = await editFormRef.value?.submit()
  const id = editingNote.value?.id
  if (!data || !id) return

  await submitWithModal(editModalRef.value, () => update(id, data))
}

const deleteHandler = async (note: Note) => {
  const { id } = note
  const modal = deleteModalRef.value
  const confirmed = await modal?.open()
  if (confirmed) {
    const removeResult = await remove(id)
    if (removeResult instanceof AppError) return
  }
}

watch([q, completed, sortOrder], () => {
  firstPage()
})

useAsyncData(
  () => `notes-${JSON.stringify(requestAllParams.value)}`,
  async () => {
    await getAll(requestAllParams.value)
    saveQuery(requestFiltersParams.value)
    return true
  },
  { watch: [requestAllParams] },
)

onMounted(() => {
  noteStore.initWS()
})

onUnmounted(() => {
  noteStore.destroyWS()
})
</script>

<style scoped lang="scss">
.page-note {
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
    max-width: rem(620);
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

  &__items {
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
  .page-note__filters {
    grid-template-columns: 1fr rem(180);
  }
  .page-note__items {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

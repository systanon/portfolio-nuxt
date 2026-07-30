<template>
  <section class="page-profile">
    <h2 class="page-profile__title title">Profile</h2>
    <div class="page-profile__avatar avatar">
      <img :src="avatar" alt="avatar" class="page-profile__avatar-image" >
    </div>

    <div class="page-profile__fields fields">
      <div
        v-for="(field, key) in fields"
        :key="key"
        class="page-profile__fields-item"
      >
        <div class="page-profile__fields-label">
          <h3>{{ labels[key] }}</h3>
        </div>
        <UiInput
          :id="key"
          v-model="field.value"
          :placeholder="labels[key]"
          :type="'text'"
          :validation="v$[key]"
          :icon-name="isEditingMap[key] ? 'close-square' : 'edit'"
          :disabled="!isEditingMap[key]"
          @icon-click="isEditingMap[key] ? cancelEdit(key) : toggleEdit(key)"
        />
        <div class="page-profile__fields-actions">
          <UiButtonIcon
            :disabled="
              !isEditingMap[key] ||
              v$[key].$error ||
              field.value === profile![key]
            "
            :with-border="false"
            icon-name="save"
            @click="submitField(key)"
          />
        </div>
      </div>
    </div>
    <div class="page-profile__actions actions">
      <UiButton label="Delete Account" @click="deleteHandler" />
      <UiButton label="Sign Out" @click="signOutHandler" />
    </div>
  </section>
  <UiModal ref="deleteModalRef" title="Delete account" class="profile__modal">
    <template #default>
      <div class="profile__modal-form">
        <h3>Are you sure you want to delete your account?</h3>
      </div>
    </template>
    <template #actions="{ close, confirm }">
      <UiButton label="Cancel" @click="close" />
      <UiButton label="Delete account" @click="() => confirm(true)" />
    </template>
  </UiModal>
  <UiModal ref="signOutModalRef" title="Sign out" class="profile__modal">
    <template #default>
      <div class="profile__modal-form">
        <h3>Do you really want to sign out?</h3>
      </div>
    </template>
    <template #actions="{ close, confirm }">
      <UiButton label="Cancel" @click="close" />
      <UiButton label="Sign out" @click="() => confirm(true)" />
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import type { ProfileUpdate } from '~/types/user.types'
import avatarFallback from '~/assets/images/avatar.webp'
import type { IModalOpen } from '~/components/ui/modals/UiModal.vue'
import { useAppStore } from '~/store/application'
import { AppSuccess } from '~/types/app.types'

definePageMeta({
  accessMode: 'private',
})

type FieldKey = keyof ProfileUpdate

const appStore = useAppStore()

const { logout } = useAuth()
const { updateProfile } = useProfile()
const { profile } = storeToRefs(appStore)

const avatar = computed(() => profile.value?.avatar || avatarFallback)

const localProfile = reactive<Partial<ProfileUpdate>>({})
const isEditingMap = reactive<Record<FieldKey, boolean>>({
  email: false,
  first_name: false,
  last_name: false,
  phone: false,
  bio: false,
})

const labels = {
  email: 'Email',
  first_name: 'First Name',
  last_name: 'Last Name',
  phone: 'Phone',
  bio: 'Bio',
}

function createField(key: FieldKey) {
  return computed({
    get: () => {
      if (isEditingMap[key]) {
        return localProfile[key] ?? ''
      }
      return profile.value?.[key] ?? ''
    },
    set: (val: string) => {
      localProfile[key] = val
    },
  })
}

const deleteModalRef = ref<IModalOpen | null>(null)
const signOutModalRef = ref<IModalOpen | null>(null)

const fields = {
  email: createField('email'),
  first_name: createField('first_name'),
  last_name: createField('last_name'),
  phone: createField('phone'),
  bio: createField('bio'),
}

const rules = computed(() => ({
  email: { required, email },
  first_name: { required },
  last_name: { required },
  bio: { required },
  phone: { required },
}))

const state = computed(() => {
  const s: Record<FieldKey, string> = {
    email: fields.email.value,
    first_name: fields.first_name.value,
    last_name: fields.last_name.value,
    phone: fields.phone.value,
    bio: fields.bio.value,
  }
  return s
})

const v$ = useVuelidate(rules, state)

function toggleEdit(key: FieldKey) {
  localProfile[key] = profile.value?.[key] ?? ''
  isEditingMap[key] = true
}

function cancelEdit(key: FieldKey) {
  Reflect.deleteProperty(localProfile, key)
  isEditingMap[key] = false
  v$.value[key].$reset()
}

async function submitField(key: FieldKey) {
  const validation = v$.value[key]
  validation.$touch()

  if (validation.$invalid) return

  const newValue = localProfile[key]
  const oldValue = profile.value?.[key]

  if (newValue !== oldValue) {
    const res = await updateProfile({
      [key]: newValue,
    })

    if (res instanceof AppSuccess) {
      appStore.updateField(key, newValue!)
      Reflect.deleteProperty(localProfile, key)
    }
  }

  isEditingMap[key] = false
  validation.$reset()
}

const deleteHandler = async () => {
  const modal = deleteModalRef.value
  const confirmed = await modal?.open()
  if (confirmed) {
    // TODO: call delete account API when available
  }
}

const signOutHandler = async () => {
  const modal = signOutModalRef.value
  const confirmed = await modal?.open()
  if (confirmed) {
    logout()
  }
}
</script>
<style scoped lang="scss">
.page-profile {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    'title'
    'avatar'
    'fields'
    'actions';
  gap: rem(50);
  background-color: var(--bg-primary);
  border-radius: rem(10);
  margin: 0 rem(-15);
  padding: rem(15);
  &__title {
    text-align: center;
  }
  &__avatar {
    width: rem(200);
    height: rem(200);
    border-radius: 50%;
    margin: 0 auto;
    overflow: hidden;
  }
  &__avatar-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  &__fields {
    display: flex;
    text-align: center;
    flex-direction: column;
  }
  &__fields-label > {
    h3 {
      padding: 0.5rem;
      font-size: 1.25rem;
    }
  }
  &__actions {
    display: flex;
    flex-direction: column;
    gap: rem(30);
    align-items: center;
  }
  :deep(.ui-modal__dialog) {
    width: calc(100% - rem(15));
  }

  .title {
    grid-area: title;
  }
  .avatar {
    grid-area: avatar;
  }
  .fields {
    grid-area: fields;
  }
  .actions {
    grid-area: actions;
  }
}

.profile__modal {
  :deep(.ui-modal__dialog) {
    width: calc(100% - rem(15));
  }
}

@include media-query('tablet') {
  .page-profile__fields-item {
    display: grid;
    grid-template-columns: 0.5fr 1fr auto;
    align-items: flex-start;
    gap: 2rem;
  }
  .page-profile__actions {
    flex-direction: row;
    justify-content: end;
  }
}

@include media-query('desktop') {
  .page-profile {
    grid-template-columns: auto 1fr;
    align-items: center;
    grid-template-areas:
      'title title'
      'avatar fields'
      'actions actions';

    &__avatar {
      width: rem(300);
      height: rem(300);
    }
  }
}
</style>

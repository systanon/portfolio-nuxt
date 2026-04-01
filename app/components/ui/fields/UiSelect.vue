<template>
  <BaseField :label="label" :validation="validation">
    <template #default="{ id }">
      <div ref="rootRef" :class="['ui-select', { _disabled: disabled }]">
        <button
          :class="['ui-select__toggler']"
          :disabled="disabled"
          :id="id"
          type="button"
          @click="toggle"
        >
          <span class="ui-select__toggler-text"> {{ selectedValue }}</span>
          <UiIcon
            :class="['ui-select__toggler-icon', { _open: optionsShown }]"
            name="arrow"
            size="small"
          />
        </button>
        <div v-if="optionsShown" class="ui-select__options">
          <ul class="ui-select__list">
            <li
              v-for="(option, index) in options"
              :key="index"
              class="ui-select__list-item"
              @click="selectOption(option)"
            >
              <span
                :class="[
                  'ui-select__list-item-text',
                  { _active: isActive(option) },
                ]"
              >
                {{ option[propLabel] }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </BaseField>
</template>

<script lang="ts" setup>
import type { BaseValidation } from '@vuelidate/core'

export type UISelectOption = Record<string, any>
export type UISelectOptions = UISelectOption[]
const emit = defineEmits<{
  (e: 'list-visible', value: boolean): void
  (e: 'update:modelValue', value: string): void
}>()

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: UISelectOptions
    placeholder?: string
    propValue?: string
    propLabel?: string
    disabled?: boolean
    label?: string
    validation?: BaseValidation
  }>(),
  {
    propValue: 'value',
    propLabel: 'label',
    disabled: false,
  },
)

const optionsShown = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const { modelValueProxy, $v } = useField<string>(props, emit as any)

const selectedValue = computed(() => {
  return (
    props.options.find(
      (item) => item[props.propValue] === modelValueProxy.value,
    )?.[props.propLabel] ??
    props.placeholder ??
    'placeholder'
  )
})

const setShowOptions = (show: boolean) => {
  optionsShown.value = show
  emit('list-visible', show)
}

const toggle = () => {
  if (!props.disabled) {
    setShowOptions(!optionsShown.value)
  }
}

const hide = () => {
  setShowOptions(false)
}

const updateValue = (value: string) => {
  emit('update:modelValue', value)
  hide()
}

const selectOption = (option: UISelectOption) => {
  if (props.disabled) return

  updateValue(option[props.propValue])
}

const isActive = (item: UISelectOption) => {
  return modelValueProxy.value === item[props.propValue]
}

onClickOutside(rootRef, () => {
  if (optionsShown.value) hide()
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && optionsShown.value) hide()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style lang="scss" scoped>
.ui-select {
  display: flex;
  position: relative;
  height: rem(55);
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: rem(6);
  &__toggler {
    padding: rem(0) rem(16);
    width: 100%;
    z-index: 1;
    background-color: transparent;
    display: flex;
    align-items: center;
    gap: rem(5);
    cursor: pointer;
    justify-content: space-between;
    &-text {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: rem(18);
    }
    &-icon {
      flex: 0 0 auto;
      transform: rotate(90deg);
      transition: transform 0.15s ease;
      &._open {
        transform: rotate(-90deg);
      }
    }
  }
  &__options {
    position: absolute;
    background-color: var(--backdrop-color);
    display: grid;
    grid-template-rows: 1fr auto;
    overflow: hidden;
    z-index: 100;
    padding: rem(10);
    top: calc(100% + rem(10));
    width: 100%;
  }
  &__list-item {
    cursor: pointer;
    position: relative;
    user-select: none;
    padding-bottom: rem(3);
    padding-top: rem(3);
    color: var(--text-color-primary);
  }
  &__list-item-text {
    color: var(--text-color-primary);
    &._active {
      color: var(--active-primary);
    }
  }

  &._disabled {
    opacity: var(--disabled-opacity);
    pointer-events: none;
  }
}
</style>

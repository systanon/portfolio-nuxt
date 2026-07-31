<template>
  <BaseField :label="label" :validation="validation">
    <template #default="{ id }">
      <div
        ref="rootRef"
        :class="[
          'ui-select',
          { _disabled: disabled, 'ui-select--error': $v?.$error },
        ]"
      >
        <button
          :id="id"
          ref="togglerRef"
          :class="['ui-select__toggler']"
          :disabled="disabled"
          type="button"
          @click="toggle"
          @keydown="onTogglerKeydown"
        >
          <span class="ui-select__toggler-text">{{ selectedLabel }}</span>
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
              :key="optionKey(option, index)"
              :ref="(el) => (optionRefs[index] = el as HTMLElement | null)"
              :tabindex="index === activeIndex ? 0 : -1"
              class="ui-select__list-item"
              @click="selectOption(option)"
              @keydown="onOptionKeydown($event, index)"
            >
              <span
                :class="[
                  'ui-select__list-item-text',
                  { _active: isHighlighted(option, index) },
                ]"
              >
                {{ formatOptionLabel(option) }}
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

export type UiSelectOption = Record<string, unknown>
export type UiSelectOptions = readonly UiSelectOption[]

interface Props {
  modelValue: string
  options: UiSelectOptions
  placeholder?: string
  propValue?: string
  propLabel?: string
  disabled?: boolean
  label?: string
  validation?: BaseValidation
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: undefined,
  propValue: 'value',
  propLabel: 'label',
  disabled: false,
  label: undefined,
  validation: undefined,
})

const emit = defineEmits<{
  (e: 'list-visible', value: boolean): void
  (e: 'update:modelValue', value: string): void
}>()

const optionsShown = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const togglerRef = ref<HTMLButtonElement | null>(null)
const optionRefs = ref<Array<HTMLElement | null>>([])
const activeIndex = ref(0)

const { modelValueProxy, $v } = useField(props, emit)

function formatOptionLabel(option: UiSelectOption): string {
  const raw = option[props.propLabel]
  return raw == null ? '' : String(raw)
}

function optionKey(option: UiSelectOption, index: number): string {
  const v = option[props.propValue]
  return v == null ? `i-${index}` : String(v)
}

const selectedLabel = computed(() => {
  const match = props.options.find(
    (item) => item[props.propValue] === modelValueProxy.value,
  )
  if (match) return formatOptionLabel(match)
  return props.placeholder ?? ''
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
  modelValueProxy.value = value
  hide()
}

const selectOption = (option: UiSelectOption) => {
  if (props.disabled) return
  updateValue(String(option[props.propValue] ?? ''))
}

const isActive = (item: UiSelectOption) => {
  return modelValueProxy.value === item[props.propValue]
}

const getSelectedIndex = () => {
  return props.options.findIndex(
    (item) => item[props.propValue] === modelValueProxy.value,
  )
}

const focusActiveOption = () => {
  const el = optionRefs.value[activeIndex.value]
  el?.focus()
}

const moveActiveIndex = async (delta: number) => {
  const total = props.options.length
  if (!total) return

  let nextIndex = activeIndex.value + delta
  if (nextIndex < 0) nextIndex = total - 1
  if (nextIndex >= total) nextIndex = 0

  activeIndex.value = nextIndex
  await nextTick()
  focusActiveOption()
}

const isHighlighted = (item: UiSelectOption, index: number) => {
  if (optionsShown.value) return index === activeIndex.value
  return isActive(item)
}

const onTogglerKeydown = async (e: KeyboardEvent) => {
  if (props.disabled) return

  if (e.key === 'Escape' && optionsShown.value) {
    e.preventDefault()
    hide()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!optionsShown.value) {
      setShowOptions(true)
      await nextTick()
      await moveActiveIndex(1)
    } else {
      await moveActiveIndex(1)
    }
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (!optionsShown.value) {
      setShowOptions(true)
      await nextTick()
      await moveActiveIndex(-1)
    } else {
      await moveActiveIndex(-1)
    }
  }
}

const onOptionKeydown = async (e: KeyboardEvent, index: number) => {
  activeIndex.value = index

  if (e.key === 'Escape') {
    e.preventDefault()
    hide()
    return
  }

  if (e.key === 'Tab') {
    hide()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    await moveActiveIndex(1)
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    await moveActiveIndex(-1)
    return
  }

  if (e.key === 'Home') {
    e.preventDefault()
    activeIndex.value = 0
    await nextTick()
    focusActiveOption()
    return
  }

  if (e.key === 'End') {
    e.preventDefault()
    activeIndex.value = props.options.length - 1
    await nextTick()
    focusActiveOption()
    return
  }

  const isSelectKey =
    e.key === 'Enter' ||
    e.key === ' ' ||
    e.code === 'Space' ||
    e.key === 'Spacebar'
  if (isSelectKey) {
    e.preventDefault()
    const option = props.options[activeIndex.value]
    if (option) selectOption(option)
  }
}

onClickOutside(rootRef, () => {
  if (optionsShown.value) hide()
})

watch(optionsShown, async (shown) => {
  if (!shown) {
    await nextTick()
    togglerRef.value?.focus()
    return
  }

  optionRefs.value = []
  activeIndex.value = Math.max(getSelectedIndex(), 0)
  await nextTick()
  focusActiveOption()
})

watch(
  () => modelValueProxy.value,
  async () => {
    if (!optionsShown.value) return
    activeIndex.value = Math.max(getSelectedIndex(), 0)
    await nextTick()
    focusActiveOption()
  },
)

const onKeydown = (e: KeyboardEvent) => {
  if (
    e.key === 'Escape' &&
    optionsShown.value &&
    rootRef.value?.contains(document.activeElement)
  )
    hide()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped lang="scss">
.ui-select {
  display: flex;
  position: relative;
  height: rem(55);
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: rem(6);

  &--error {
    border-color: var(--error);
  }

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
    z-index: var(--z-dropdown);
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

    &:focus-visible {
      outline: 2px solid var(--active-primary);
      outline-offset: rem(2);
      border-radius: rem(6);
    }
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

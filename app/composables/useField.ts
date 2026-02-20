import { computed } from 'vue'
import type { BaseValidation } from '@vuelidate/core'

export function useField<T extends string>(
  props: { modelValue: T; validation?: BaseValidation },
  emit: (e: 'update:modelValue', value: T) => void,
) {
  const modelValueProxy = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })

  const $v = props.validation

  return { modelValueProxy, $v }
}

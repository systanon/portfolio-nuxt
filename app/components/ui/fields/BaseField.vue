<template>
  <div class="base-field">
    <label v-if="label" :for="id" class="base-field__label">
      {{ label }}
    </label>

    <div class="base-field__control">
      <slot :id="id" />
    </div>

    <p v-show="validation?.$error" class="base-field__error">
      <span
        v-for="(error, index) in errorMessages"
        :key="error + index"
        class="base-field__error-text"
      >
        {{ error }}
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue'
import type { BaseValidation } from '@vuelidate/core'

interface Props {
  label?: string
  validation?: BaseValidation
}

defineOptions({ name: 'BaseField', inheritAttrs: false })

const id = useId()

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  validation: undefined,
})

const errorMessages = computed(
  () => props.validation?.$errors?.map((err) => unref(err.$message)) ?? [],
)
</script>

<style scoped lang="scss">
.base-field {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: rem(20);

  &__label {
    margin-bottom: rem(4);
    font-weight: 500;
    color: var(--text-color-secondary);
  }

  &__control {
    position: relative;
    width: 100%;
  }

  &__error {
    position: absolute;
    bottom: 0;
    left: 0;
    font-size: rem(14);

    &-text {
      color: var(--error);
    }
  }
}
</style>

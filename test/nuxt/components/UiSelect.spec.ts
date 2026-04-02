import { describe, it, expect } from 'vitest'
import type { BaseValidation } from '@vuelidate/core'
import type { VueWrapper } from '@vue/test-utils'
import type { ComponentPublicInstance } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiSelect from '../../../app/components/ui/fields/UiSelect.vue'

const stubs = {
  BaseField: {
    props: ['label', 'validation'],
    template: `<div><slot :id="'ui-select-test-id'"></slot></div>`,
  },
  UiIcon: {
    props: ['name', 'size', 'class'],
    template: `<span></span>`,
  },
}

const defaultOptions = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
] as const

function activeOptionText(
  wrapper: VueWrapper<ComponentPublicInstance>,
): string | undefined {
  const items = wrapper.findAll('li.ui-select__list-item')
  const active = items.find((li) =>
    li.get('span.ui-select__list-item-text').classes().includes('_active'),
  )
  return active?.get('span.ui-select__list-item-text').text().trim()
}

describe('UiSelect', () => {
  it('renders empty label when modelValue not matched and no placeholder', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: 'unknown',
        options: [{ value: '1', label: 'One' }],
      },
      global: { stubs },
    })

    expect(wrapper.get('.ui-select__toggler-text').text().trim()).toBe('')
  })

  it('renders placeholder when modelValue not found', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: 'unknown',
        options: [{ value: '1', label: 'One' }],
        placeholder: 'Pick one',
      },
      global: { stubs },
    })

    expect(wrapper.get('.ui-select__toggler-text').text().trim()).toBe(
      'Pick one',
    )
  })

  it('opens list on toggler click and emits list-visible(true)', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: '1',
        options: [
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ],
      },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ui-select__options').exists()).toBe(true)
    expect(wrapper.emitted('list-visible')?.at(-1)).toEqual([true])
  })

  it('highlights selected option on open', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: 'b',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ],
      },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    const active = items.find((li) =>
      li.get('span.ui-select__list-item-text').classes().includes('_active'),
    )

    expect(active?.get('span.ui-select__list-item-text').text().trim()).toBe(
      'B',
    )
  })

  it('emits update:modelValue and hides after option click', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ],
      },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[2]?.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['c'])
    expect(wrapper.find('.ui-select__options').exists()).toBe(false)
    expect(wrapper.emitted('list-visible')?.at(-1)).toEqual([false])
  })

  it('does nothing when disabled', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        disabled: true,
        modelValue: 'a',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ui-select__options').exists()).toBe(false)
    expect(wrapper.emitted('list-visible')).toBeUndefined()

    const items = wrapper.findAll('li.ui-select__list-item')
    expect(items.length).toBe(0)
  })

  it('opens and highlights option via ArrowDown on toggler', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ],
      },
      global: { stubs },
    })

    const toggler = wrapper.get('button.ui-select__toggler')
    await toggler.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    const active = items.find((li) =>
      li.get('span.ui-select__list-item-text').classes().includes('_active'),
    )
    expect(active?.get('span.ui-select__list-item-text').text().trim()).toBe(
      'B',
    )
  })

  it('closes via Escape when list is open', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: 'b',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ],
      },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ui-select__options').exists()).toBe(true)

    await wrapper
      .get('button.ui-select__toggler')
      .trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ui-select__options').exists()).toBe(false)
    expect(wrapper.emitted('list-visible')?.at(-1)).toEqual([false])
  })

  it('supports custom propValue/propLabel', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: '2',
        propValue: 'id',
        propLabel: 'name',
        options: [
          { id: '1', name: 'One' },
          { id: '2', name: 'Two' },
        ],
      },
      global: { stubs },
    })

    expect(wrapper.get('.ui-select__toggler-text').text().trim()).toBe('Two')

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[0]?.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['1'])
  })

  it('applies error class when validation has error', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: 'a',
        options: [...defaultOptions],
        validation: { $error: true } as BaseValidation,
      },
      global: { stubs },
    })

    expect(wrapper.get('.ui-select').classes()).toContain('ui-select--error')
  })

  it('applies disabled modifier on root', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        disabled: true,
        modelValue: 'a',
        options: [...defaultOptions],
      },
      global: { stubs },
    })

    expect(wrapper.get('.ui-select').classes()).toContain('_disabled')
  })

  it('adds open class to toggler icon when list is visible', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'a', options: [...defaultOptions] },
      global: { stubs },
    })

    const icon = () => wrapper.get('.ui-select__toggler-icon')
    expect(icon().classes()).not.toContain('_open')
    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()
    expect(icon().classes()).toContain('_open')
  })

  it('closes list when toggler is clicked again', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'a', options: [...defaultOptions] },
      global: { stubs },
    })

    const toggler = wrapper.get('button.ui-select__toggler')
    await toggler.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ui-select__options').exists()).toBe(true)

    await toggler.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ui-select__options').exists()).toBe(false)
    expect(wrapper.emitted('list-visible')?.at(-1)).toEqual([false])
  })

  it('opens and wraps highlight to last item via ArrowUp on toggler', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'a', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper
      .get('button.ui-select__toggler')
      .trigger('keydown', { key: 'ArrowUp' })
    await wrapper.vm.$nextTick()

    expect(activeOptionText(wrapper)).toBe('C')
  })

  it('moves highlight with ArrowDown while list is open', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'a', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()
    expect(activeOptionText(wrapper)).toBe('A')

    await wrapper
      .get('button.ui-select__toggler')
      .trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    expect(activeOptionText(wrapper)).toBe('B')
  })

  it('ignores ArrowDown on toggler when disabled', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        disabled: true,
        modelValue: 'a',
        options: [...defaultOptions],
      },
      global: { stubs },
    })

    await wrapper
      .get('button.ui-select__toggler')
      .trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ui-select__options').exists()).toBe(false)
    expect(wrapper.emitted('list-visible')).toBeUndefined()
  })

  it('closes list on Tab from an option', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'b', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[0]?.trigger('keydown', { key: 'Tab' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ui-select__options').exists()).toBe(false)
  })

  it('selects value with Enter on focused option', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'a', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[1]?.trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
  })

  it('selects value with Space on focused option', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'a', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[2]?.trigger('keydown', { key: ' ' })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['c'])
  })

  it('moves highlight with Home and End on option', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'c', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[2]?.trigger('keydown', { key: 'Home' })
    await wrapper.vm.$nextTick()
    expect(activeOptionText(wrapper)).toBe('A')

    await items[0]?.trigger('keydown', { key: 'End' })
    await wrapper.vm.$nextTick()
    expect(activeOptionText(wrapper)).toBe('C')
  })

  it('closes via Escape when focus is on an option', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'b', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[1]?.trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ui-select__options').exists()).toBe(false)
    expect(wrapper.emitted('list-visible')?.at(-1)).toEqual([false])
  })

  it('updates active highlight when modelValue changes while open', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'a', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()
    expect(activeOptionText(wrapper)).toBe('A')

    await wrapper.setProps({ modelValue: 'c' })
    await wrapper.vm.$nextTick()

    expect(activeOptionText(wrapper)).toBe('C')
  })

  it('wraps highlight from last option to first with ArrowDown', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'c', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[2]?.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    expect(activeOptionText(wrapper)).toBe('A')
  })

  it('wraps highlight from first option to last with ArrowUp', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: 'a', options: [...defaultOptions] },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li.ui-select__list-item')
    await items[0]?.trigger('keydown', { key: 'ArrowUp' })
    await wrapper.vm.$nextTick()

    expect(activeOptionText(wrapper)).toBe('C')
  })

  it('renders empty list item label when option label is null', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: {
        modelValue: 'x',
        options: [{ value: 'x', label: null }],
      },
      global: { stubs },
    })

    await wrapper.get('button.ui-select__toggler').trigger('click')
    await wrapper.vm.$nextTick()

    expect(
      wrapper.get('li.ui-select__list-item .ui-select__list-item-text').text(),
    ).toBe('')
  })

  it('does not throw when ArrowDown opens an empty options list', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      route: false,
      props: { modelValue: '', options: [] },
      global: { stubs },
    })

    await wrapper
      .get('button.ui-select__toggler')
      .trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ui-select__options').exists()).toBe(true)
    expect(wrapper.findAll('li.ui-select__list-item')).toHaveLength(0)
  })
})


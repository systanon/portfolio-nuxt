import { describe, it, expect } from 'vitest'
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

describe('UiSelect', () => {
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
})

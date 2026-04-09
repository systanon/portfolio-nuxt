import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import NoteItem from '../../../app/components/NoteItem.vue'
import type { Note } from '~/types/note'

const sampleNote: Note = {
  id: 1,
  user_id: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  title: 'Alpha',
  description: 'Beta',
}

describe('NoteItem', () => {
  it('renders title and description', async () => {
    const wrapper = await mountSuspended(NoteItem, {
      route: false,
      props: { note: sampleNote },
    })

    expect(wrapper.get('.note-item__title').text()).toBe('Alpha')
    expect(wrapper.get('.note-item__description').text()).toBe('Beta')
  })

  it('toggles menu and updates aria-expanded on the toggle control', async () => {
    const wrapper = await mountSuspended(NoteItem, {
      route: false,
      props: { note: sampleNote },
    })

    const toggle = wrapper.get('.note-item__menu-btn')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('emits edit with the note when the edit control is activated', async () => {
    const wrapper = await mountSuspended(NoteItem, {
      route: false,
      props: { note: sampleNote },
    })

    await wrapper.get('.note-item__menu-btn').trigger('click')
    const actions = wrapper.findAll('.note-item__menu-item')
    await actions[0]!.trigger('click')

    expect(wrapper.emitted('edit')?.[0]).toEqual([sampleNote])
  })

  it('emits delete with the note when the delete control is activated', async () => {
    const wrapper = await mountSuspended(NoteItem, {
      route: false,
      props: { note: sampleNote },
    })

    await wrapper.get('.note-item__menu-btn').trigger('click')
    const actions = wrapper.findAll('.note-item__menu-item')
    await actions[1]!.trigger('click')

    expect(wrapper.emitted('delete')?.[0]).toEqual([sampleNote])
  })

  it('exposes aria-controls pointing at the actions region', async () => {
    const wrapper = await mountSuspended(NoteItem, {
      route: false,
      props: { note: sampleNote },
    })

    const toggle = wrapper.get('.note-item__menu-btn')
    const controls = toggle.attributes('aria-controls')
    expect(controls).toBeDefined()
    expect(wrapper.find(`#${controls}`).exists()).toBe(true)
  })
})

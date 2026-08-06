import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useRateLimit } from '~/composables/useRateLimit'
import type { IProgressBar } from '~/components/animation/ProgressBar.vue'

function makeProgressBarStub(): IProgressBar {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    seek: vi.fn(),
    reset: vi.fn(),
    getTween: vi.fn(),
  }
}

const RateLimitHost = defineComponent({
  props: {
    rateLimitKey: { type: String, required: true },
  },
  render() {
    return null
  },
  setup(props) {
    return useRateLimit(props.rateLimitKey)
  },
})

interface RateLimitVm {
  isBlocked: boolean
  showProgressBar: boolean
  time: string
  progressBarRef: IProgressBar | null
  startRateLimit: (retryAfter: number) => Promise<void>
  $nextTick: () => Promise<void>
}

async function mountHost(key: string) {
  const wrapper = await mountSuspended(RateLimitHost, {
    props: { rateLimitKey: key },
  })
  return wrapper.vm as unknown as RateLimitVm
}

describe('useRateLimit', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('starts in an unblocked state', async () => {
    const vm = await mountHost('test-a')

    expect(vm.isBlocked).toBe(false)
    expect(vm.showProgressBar).toBe(false)
    expect(vm.time).toBe('0:00')
  })

  it('blocks and formats the countdown when startRateLimit is called', async () => {
    const vm = await mountHost('test-b')

    await vm.startRateLimit(65)

    expect(vm.isBlocked).toBe(true)
    expect(vm.showProgressBar).toBe(true)
    expect(vm.time).toBe('1:05')
  })

  it('persists the deadline to localStorage under a key-scoped name', async () => {
    const vm = await mountHost('cv-download')
    const now = Date.now()

    await vm.startRateLimit(30)

    const raw = localStorage.getItem('rate-limit:cv-download')
    expect(raw).not.toBeNull()
    const stored = JSON.parse(raw!)
    expect(stored.total).toBe(30)
    expect(stored.blockedUntil).toBe(now + 30_000)
  })

  it('counts down over time and clears state when the deadline passes', async () => {
    const vm = await mountHost('test-c')

    await vm.startRateLimit(1)
    expect(vm.time).toBe('0:01')

    await vi.advanceTimersByTimeAsync(1000)

    expect(vm.isBlocked).toBe(false)
    expect(vm.showProgressBar).toBe(false)
    expect(vm.time).toBe('0:00')
    expect(localStorage.getItem('rate-limit:test-c')).toBeNull()
  })

  it('drives the bound ProgressBar via play/pause/seek instead of its own tween loop', async () => {
    const vm = await mountHost('test-d')

    await vm.startRateLimit(10)

    const bar = makeProgressBarStub()
    vm.progressBarRef = bar
    await vm.$nextTick()

    expect(bar.play).toHaveBeenCalledWith(10)
    expect(bar.pause).toHaveBeenCalledTimes(1)
    expect(bar.seek).toHaveBeenCalled()

    const firstSeek = vi.mocked(bar.seek).mock.calls.at(-1)![0]
    expect(firstSeek).toBeCloseTo(0, 5)

    await vi.advanceTimersByTimeAsync(5000)

    const laterSeek = vi.mocked(bar.seek).mock.calls.at(-1)![0]
    expect(laterSeek).toBeCloseTo(0.5, 1)
  })

  it('re-binds a freshly (re)mounted ProgressBar instance to the current progress', async () => {
    const vm = await mountHost('test-e')

    await vm.startRateLimit(20)
    await vi.advanceTimersByTimeAsync(10_000) // halfway through

    vm.progressBarRef = null
    const freshBar = makeProgressBarStub()
    vm.progressBarRef = freshBar
    await vm.$nextTick()

    expect(freshBar.play).toHaveBeenCalledWith(20)
    expect(freshBar.pause).toHaveBeenCalledTimes(1)
    const seekValue = vi.mocked(freshBar.seek).mock.calls.at(-1)![0]
    expect(seekValue).toBeCloseTo(0.5, 1)
  })

  it('resumes an unexpired rate limit found in localStorage on mount', async () => {
    localStorage.setItem(
      'rate-limit:test-f',
      JSON.stringify({ blockedUntil: Date.now() + 40_000, total: 40 }),
    )

    const vm = await mountHost('test-f')
    await vm.$nextTick()

    expect(vm.isBlocked).toBe(true)
    expect(vm.showProgressBar).toBe(true)
    expect(vm.time).toBe('0:40')
  })

  it('ignores and clears an already-expired entry found in localStorage on mount', async () => {
    localStorage.setItem(
      'rate-limit:test-g',
      JSON.stringify({ blockedUntil: Date.now() - 1000, total: 30 }),
    )

    const vm = await mountHost('test-g')
    await vm.$nextTick()

    expect(vm.isBlocked).toBe(false)
    expect(localStorage.getItem('rate-limit:test-g')).toBeNull()
  })

  it('ignores malformed JSON found in localStorage on mount', async () => {
    localStorage.setItem('rate-limit:test-h', '{not json')

    const vm = await mountHost('test-h')
    await vm.$nextTick()

    expect(vm.isBlocked).toBe(false)
    expect(localStorage.getItem('rate-limit:test-h')).toBeNull()
  })

  it('scopes state per key so unrelated rate limits do not clobber each other', async () => {
    const vmA = await mountHost('key-a')
    const vmB = await mountHost('key-b')

    await vmA.startRateLimit(15)

    expect(vmA.isBlocked).toBe(true)
    expect(vmB.isBlocked).toBe(false)
    expect(localStorage.getItem('rate-limit:key-a')).not.toBeNull()
    expect(localStorage.getItem('rate-limit:key-b')).toBeNull()
  })

  it('stops ticking after unmount', async () => {
    const wrapper = await mountSuspended(RateLimitHost, {
      props: { rateLimitKey: 'test-i' },
    })
    const vm = wrapper.vm as unknown as RateLimitVm

    await vm.startRateLimit(5)
    expect(vm.isBlocked).toBe(true)

    wrapper.unmount()

    await vi.advanceTimersByTimeAsync(5000)
    expect(vi.getTimerCount()).toBe(0)
  })
})

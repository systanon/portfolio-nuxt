import type { LocationQueryRaw } from 'vue-router'

export function useFilters(debounceDelay: number = 550) {
  const VALID_COMPLETED = ['true', 'false'] as const
  const route = useRoute()
  const initQ =
    typeof route.query.q === 'string' && isValidString(route.query.q)
      ? route.query.q
      : ''

  const initCompleted = VALID_COMPLETED.includes(route.query.completed as any)
    ? (route.query.completed as string)
    : 'all'

  const initSortOrder =
    typeof route.query.sortOrder === 'string' &&
    isValidSortOrder(route.query.sortOrder)
      ? route.query.sortOrder
      : 'DESC'

  const q = ref(initQ)
  const qDebounced = refDebounced(q, debounceDelay)
  const completed = ref(initCompleted)
  const sortOrder = ref(initSortOrder)

  const requestFiltersParams = computed<LocationQueryRaw>(() => {
    return {
      q: isValidString(qDebounced.value) ? qDebounced.value.trim() : undefined,
      completed: completed.value !== 'all' ? completed.value : undefined,
      sortOrder: sortOrder.value === 'ASC' ? 'ASC' : undefined,
    }
  })

  function isValidString(value: string | null | undefined): boolean {
    return !!value && value.trim().length > 0
  }

  function isValidSortOrder(value: string | null | undefined): boolean {
    return value === 'ASC' || value === 'DESC'
  }

  return {
    q,
    completed,
    sortOrder,
    requestFiltersParams,
  }
}

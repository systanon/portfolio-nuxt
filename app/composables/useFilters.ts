import type { LocationQueryRaw } from 'vue-router'

export function useFilters(debounseDelay: number = 350) {
  const route = useRoute()
  const router = useRouter()
  const initQ =
    typeof route.query.q === 'string' && isValidString(route.query.q)
      ? route.query.q
      : ''

  const initCompleted =
    route.query.completed === 'true'
      ? 'true'
      : route.query.completed === 'false'
        ? 'false'
        : 'all'

  const initSortOrder =
    typeof route.query.sortOrder === 'string' &&
    isValidSortOrder(route.query.sortOrder)
      ? route.query.sortOrder
      : 'DESC'

  const q = ref(initQ)
  const qDebounced = refDebounced(q, debounseDelay)
  const completed = ref(initCompleted)
  const sortOrder = ref(initSortOrder)

  const requestFiltersParams = computed<LocationQueryRaw>(() => {
    return {
      q: isValidString(qDebounced.value) ? qDebounced.value?.trim() : undefined,
      completed: completed.value !== 'all' ? completed.value : undefined,
      sortOrder: isValidSortOrder(sortOrder.value)
        ? sortOrder.value
        : undefined,
    }
  })

  function isValidString(value: string | null | undefined): boolean {
    return !!value && value.trim().length > 0
  }

  function isValidSortOrder(value: string | null | undefined): boolean {
    return value === 'ASC' || value === 'DESC'
  }

  const saveFiltersQuery = () => {
    const nextQuery: Record<string, any> = { ...route.query }
    const params = requestFiltersParams.value as Record<string, any>

    if (params.q !== undefined) nextQuery.q = params.q
    else delete nextQuery.q

    if (params.completed !== undefined) nextQuery.completed = params.completed
    else delete nextQuery.completed

    if (params.sortOrder !== undefined) nextQuery.sortOrder = params.sortOrder
    else delete nextQuery.sortOrder

    router.replace({ query: nextQuery })
  }

  return {
    q,
    completed,
    sortOrder,
    requestFiltersParams,
    saveFiltersQuery,
  }
}

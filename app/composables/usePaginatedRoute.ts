import type { LocationQueryRaw } from 'vue-router'
import { PAGINATION_CONFIG } from '~/constants'

export function usePaginatedRoute(pages: Ref<number>) {
  const route = useRoute()
  const router = useRouter()

  const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } = PAGINATION_CONFIG

  const page = Number(route.query.page) || DEFAULT_PAGE
  const perPage = Number(route.query.perPage) || DEFAULT_PAGE_SIZE

  const {
    pagination,
    firstPage,
    prevPage,
    nextPage,
    latestPage,
    btnPage,
    setPages,
  } = usePagination(perPage, page)

  const requestParams = computed(() => {
    return {
      perPage: pagination.perPage,
      page: pagination.page,
    }
  })

  const saveQuery = (extra: LocationQueryRaw = {}) => {
    const raw: LocationQueryRaw = { ...route.query }

    raw.page = String(pagination.page)
    raw.perPage = String(pagination.perPage)

    const extraKeys = Object.keys(extra) as Array<keyof LocationQueryRaw>
    extraKeys.forEach((key) => {
      if (extra[key] !== undefined) raw[key] = extra[key]
      else Reflect.deleteProperty(raw, key)
    })

    router.replace({ query: raw })
  }

  watch(
    pages,
    (pages) => {
      if (!pages) return
      setPages(pages)
    },
    { immediate: true },
  )
  return {
    pagination,
    firstPage,
    prevPage,
    nextPage,
    latestPage,
    btnPage,
    setPages,
    saveQuery,
    requestParams,
  }
}

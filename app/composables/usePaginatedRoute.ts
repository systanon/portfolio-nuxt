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
    const { perPage, page } = pagination
    return { perPage, page }
  })

  const saveQuery = () => {
    router.replace({
      query: { ...route.query, ...requestParams.value },
    })
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
    requestParams,
    saveQuery,
  }
}

import { reactive } from 'vue'

type Pagination = {
  page: number
  pages: number
  perPage: number
}

export function usePagination(perPage: number, page: number) {
  const pagination = reactive<Pagination>({
    page,
    pages: 0,
    perPage,
  })

  const firstPage = () => {
    pagination.page = 1
  }
  const prevPage = () => {
    if (pagination.page > 1) {
      pagination.page -= 1
    }
  }
  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      pagination.page += 1
    }
  }
  const btnPage = (page: number) => {
    pagination.page = page
  }
  const latestPage = () => {
    pagination.page = pagination.pages
  }
  const setPages = (pages = 1) => {
    pagination.pages = pages
    if (pages < pagination.page) {
      latestPage()
    }
  }
  const offset = () => {
    return (pagination.page - 1) * pagination.perPage
  }

  return {
    pagination,
    firstPage,
    prevPage,
    nextPage,
    latestPage,
    btnPage,
    setPages,
    offset,
  }
}

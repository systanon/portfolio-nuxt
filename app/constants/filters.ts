export const todoCompletedFilters = [
  { value: 'all', label: 'All' },
  { value: 'true', label: 'Completed' },
  { value: 'false', label: 'Not completed' },
] as const

export const createdFilters = [
  { value: 'DESC', label: 'Sort: DESC' },
  { value: 'ASC', label: 'Sort: ASC' },
] as const

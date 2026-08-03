export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)

  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
})

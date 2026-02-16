export default defineNuxtPlugin(() => {

  const width = useState<number>('app-width', () => window.innerWidth)
  const height = useState<number>('app-height', () => window.innerHeight)

  const update = () => {

    width.value = window.innerWidth
    height.value = window.innerHeight

  }

  window.addEventListener('resize', update)

})
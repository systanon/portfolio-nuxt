import { BREAKPOINTS } from '~/constants'

export const useWindowResize = () => {

  const width = useState<number>('app-width')
  const height = useState<number>('app-height')

  const isMobile = computed(() => width.value < BREAKPOINTS.MOBILE)
  const isTablet = computed(
    () => width.value >= BREAKPOINTS.MOBILE && width.value < BREAKPOINTS.TABLET,
  );
  const isDesktop = computed(
    () => width.value >= BREAKPOINTS.DESKTOP && width.value < BREAKPOINTS.LARGE_DESKTOP,
  );
  const isLargeDesktop = computed(() => width.value >= BREAKPOINTS.LARGE_DESKTOP);

  return {

    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop

  }

}
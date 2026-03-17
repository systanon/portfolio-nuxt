<template>
  <BurgerButton ref="burgerRef" @click="toggleNav" />

  <aside ref="navRef" class="app-navigation">
    <nav ref="menuRef" class="app-navigation__menu" v-on-click-outside="close">
      <AppLink
        v-for="{ path, text, routeName } in menuList"
        :key="path"
        :to="path"
        inactive-class="link"
        exactActiveClass="link--active"
        @navigate="onLinkNavigate"
      >
        {{ text }}
      </AppLink>
    </nav>
  </aside>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, type Directive } from 'vue'
import { vOnClickOutside as baseOnClickOutside } from '@vueuse/components'
import { useAppStore } from '~/store/application'
import { byAuthorized, mainMenu } from '@/config/main-menu'
import type { IBurgerButton } from '~/components/ui/buttons/BurgerButton.vue'
import { createNavBar } from '@/animations'

const vOnClickOutside: Directive = baseOnClickOutside
const isNavOpen = ref(false)
const navRef = ref<HTMLElement>()
const burgerRef = ref<IBurgerButton>()
const menuRef = ref<HTMLElement>()
const { isLogged } = useAppStore()

useEscapeKey(close)
const play = ref<() => void>(() => {})
const playReverse = ref<() => void>(() => {})
const kill = ref<() => void>(() => {})

const toggleNav = async () => {
  const toggle = !isNavOpen.value
  if (toggle) {
    burgerRef.value?.play()
    play.value()
  } else {
    burgerRef.value?.reverse()
    await playReverse.value()
  }
  isNavOpen.value = toggle
}

async function close() {
  burgerRef.value?.reverse()
  await playReverse.value()

  isNavOpen.value = false
}

const onLinkNavigate = async (navigate: () => void) => {
  burgerRef.value?.reverse()
  await playReverse.value()

  isNavOpen.value = false

  navigate()
}

const menuList = computed(() => {
  return mainMenu.filter(byAuthorized(isLogged))
})

const initAnimation = () => {
  const items = menuRef.value!.children
  const navBar = createNavBar(navRef.value!, items)

  navBar.init()

  play.value = navBar.play
  playReverse.value = navBar.playReverse
  kill.value = navBar.kill
}

onMounted(() => {
  initAnimation()
})
</script>

<style lang="scss" scoped>
.app-navigation {
  background-color: var(--bg-tertiary);
  padding: rem(15);
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: rem(15);
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-drawer);
  transform: translateX(-100%);
  will-change: transform;

  &__menu {
    width: 100%;
    padding-top: rem(60);
    color: var(--text-color-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(30);
    font-size: rem(22);
  }
}
</style>

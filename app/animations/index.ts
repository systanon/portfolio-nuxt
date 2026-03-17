import gsap from 'gsap'
import { CometsEngine } from '~/animations/cometEngine'
import { textAssembly } from '~/animations/textAssembly'
import { textSoftReveal } from '~/animations/testSoftReveal'
import { pulse } from '~/animations/pulse'
import { ModalManager } from '~/animations/modalManager'
import { progress } from '~/animations/progress'
import { splash } from '~/animations/splash'
import { solarSystem } from '~/animations/solarSystem'
import { burger } from '~/animations/burger'
import { navBar } from '~/animations/navBar'

export const cometsEngine = new CometsEngine(gsap)
export const createModalManager = new ModalManager(gsap)
export const createTextAssembly = textAssembly(gsap)
export const createTextSoftReveal = textSoftReveal(gsap)
export const createPulse = pulse(gsap)
export const createProgress = progress(gsap)
export const createSplash = splash(gsap)
export const createSolarSystem = solarSystem(gsap)
export const createBurger = burger(gsap)
export const createNavBar = navBar(gsap)

import gsap from 'gsap'
import { CometsEngine } from '~/utils/animations/cometEngine'
import { textAssemblyAnimation } from '~/utils/animations/textAssemblyAnimation'
import { textSoftRevealAnimation } from '~/utils/animations/testSoftRevealAnimation'
import { pulseAnimation } from '~/utils/animations/pulseAnimation'
import { ModalEngine } from '~/utils/animations/modalEngine'
import { progressAnimation } from './progressAnimation'
import { hideSplash } from '~/utils/animations/hideSplash'
import { solarSystem } from '~/utils/animations/solarSystem'

export const cometsEngine = new CometsEngine(gsap)
export const createModalAnimation = new ModalEngine(gsap)
export const createTextAssembly = textAssemblyAnimation(gsap)
export const createTextSoftReveal = textSoftRevealAnimation(gsap)
export const createPulse = pulseAnimation(gsap)
export const createProgressAnimation = progressAnimation(gsap)
export const createSplash = hideSplash(gsap)
export const createSolarSystem = solarSystem(gsap)

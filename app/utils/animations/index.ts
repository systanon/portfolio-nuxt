import gsap from 'gsap'
import { CometsEngine } from '~/utils/animations/cometEngine'
import { textAssemblyAnimation } from '~/utils/animations/textAssemblyAnimation'
import { textSoftRevealAnimation } from '~/utils/animations/testSoftRevealAnimation'
import { pulseAnimation } from '~/utils/animations/pulseAnimation'
import { ModalEngine } from '~/utils/animations/modalEngine'

export const cometsEngine = new CometsEngine(gsap)
export const createModalAnimation = new ModalEngine(gsap)
export const createTextAssembly = textAssemblyAnimation(gsap)
export const createTextSoftReveal = textSoftRevealAnimation(gsap)
export const createPulse = pulseAnimation(gsap)

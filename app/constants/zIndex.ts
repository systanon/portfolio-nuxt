export const Z_INDEX = {
  BASE: 0,
  STICKY_HEADER: 100,
  DROPDOWN: 200,
  POPOVER: 300,
  OVERLAY: 400,
  MODAL: 500,
  DRAWER: 600,
  BURGER_BUTTON: 601,
  SPLASH_SCREEN: 602,
  NOTIFICATION: 700,
} as const

export type ZIndexLayer = keyof typeof Z_INDEX

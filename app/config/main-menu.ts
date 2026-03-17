export type NavigationMenuItem = {
  path: string
  text: string
  i18n_key: string
  routeName: string
  icon: string
  showMode?: 'all' | 'authorized' | 'unauthorized'
}

export type NavigationMenu = Array<NavigationMenuItem>

export const mainMenu: NavigationMenu = [
  {
    path: '/',
    text: 'Home',
    i18n_key: 'home',
    routeName: 'Home',
    icon: '',
    showMode: 'all',
  },
  // {
  //   path: '/todos',
  //   text: 'Todo list',
  //   i18n_key: 'todos',
  //   // routeName: 'TodoList',
  //   icon: '',
  //   showMode: 'all',
  // },
  // {
  //   path: '/profile',
  //   text: 'Profile',
  //   i18n_key: 'profile',
  //   // routeName: 'Profile',
  //   icon: '',
  //   showMode: 'authorized',
  // },
  {
    path: '/about-me',
    text: 'About Me',
    i18n_key: 'about_me',
    routeName: 'About Me',
    icon: '',
    showMode: 'all',
  },
  {
    path: '/notes',
    text: 'Notations',
    i18n_key: 'notations',
    routeName: 'Notes',
    icon: '',
    showMode: 'authorized',
  },
  {
    path: '/contacts',
    text: 'Contacts',
    i18n_key: 'contacts',
    routeName: 'Contacts',
    icon: '',
    showMode: 'all',
  },
  {
    path: '/sign-in',
    text: 'Sign In',
    i18n_key: 'sign_in',
    routeName: 'SignIn',
    icon: '',
    showMode: 'unauthorized',
  },
  {
    path: '/sign-up',
    text: 'Sign Up',
    i18n_key: 'sign_up',
    routeName: 'SignUp',
    icon: '',
    showMode: 'unauthorized',
  },
]

export const leftSide: NavigationMenu = [
  {
    path: '/',
    text: 'Home',
    i18n_key: 'home',
    routeName: 'Home',
    icon: '',
    showMode: 'all',
  },
  {
    path: '/about-me',
    text: 'About Me',
    i18n_key: 'about_me',
    routeName: 'About Me',
    icon: '',
    showMode: 'all',
  },
  {
    path: '/contacts',
    text: 'Contacts',
    i18n_key: 'contacts',
    routeName: 'Contacts',
    icon: '',
    showMode: 'all',
  },
]
export const rightSide: NavigationMenu = [
  {
    path: '/todos',
    text: 'Todo list',
    i18n_key: 'todos',
    routeName: 'TodoList',
    icon: '',
    showMode: 'all',
  },
  {
    path: '/notes',
    text: 'Notations',
    i18n_key: 'notations',
    routeName: 'Notes',
    icon: '',
    showMode: 'authorized',
  },
  {
    path: '/profile',
    text: 'Profile',
    i18n_key: 'profile',
    routeName: 'Profile',
    icon: '',
    showMode: 'authorized',
  },
  {
    path: '/sign-in',
    text: 'Sign In',
    i18n_key: 'sign_in',
    routeName: 'SignIn',
    icon: '',
    showMode: 'unauthorized',
  },
  {
    path: '/sign-up',
    text: 'Sign Up',
    i18n_key: 'sign_up',
    routeName: 'SignUp',
    icon: '',
    showMode: 'unauthorized',
  },
]

export const mapperMainMenu = {
  authorized: true,
  unauthorized: false,
}

export const byAuthorized =
  (isLogged: boolean) =>
  (menuItem: NavigationMenuItem): boolean => {
    const { showMode = 'all' } = menuItem
    if (showMode === 'all') return true
    return mapperMainMenu[showMode] === isLogged
  }

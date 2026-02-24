export type SocialLink = {
  icon: string
  href: string
  text?: string
  label: string
  external: boolean
}

export const socialLinks: SocialLink[] = [
  {
    icon: 'email',
    href: 'mailto:serhii.tustanovskyi88@gmail.com',
    label: 'Email',
    text: 'serhii.tustanovskyi88@gmail.com',
    external: false,
  },
  {
    icon: 'telegram',
    href: 'https://t.me/bless_man_7',
    label: 'Telegram',
    text: 'bless_man_7',
    external: true,
  },
  {
    icon: 'linkedin',
    href: 'https://www.linkedin.com/in/serhii-tustanovskyi-b38055181/',
    label: 'LinkedIn',
    text: 'serhii-tustanovskyi-b38055181',
    external: true,
  },
  {
    icon: 'whatsapp',
    href: 'https://wa.me/48510835237',
    label: 'WhatsApp',
    text: '+48510835237',
    external: true,
  },
  {
    icon: 'github',
    href: 'https://github.com/systanon',
    label: 'GitHub',
    text: 'github.com/systanon',
    external: true,
  },
]

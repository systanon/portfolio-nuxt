type Ring = {
  width: number
  height: number
  gradient: string
}

interface Planet {
  name: string
  orbitSize: number
  planetSize: number
  duration: number
  gradient: string
  rings?: Ring
}

export const solarSystem: Planet[] = [
  {
    name: 'mercury',
    orbitSize: 100,
    planetSize: 8,
    duration: 4,
    gradient: 'radial-gradient(circle, #ccc, #888)',
  },
  {
    name: 'venus',
    orbitSize: 140,
    planetSize: 12,
    duration: 7,
    gradient: 'radial-gradient(circle, #e6c16f, #b08030)',
  },
  {
    name: 'earth',
    orbitSize: 180,
    planetSize: 14,
    duration: 10,
    gradient: 'radial-gradient(circle, #4fa3ff, #1a64d1)',
  },
  {
    name: 'mars',
    orbitSize: 220,
    planetSize: 12,
    duration: 15,
    gradient: 'radial-gradient(circle, #ff6347, #d04a33)',
  },
  {
    name: 'jupiter',
    orbitSize: 300,
    planetSize: 20,
    duration: 30,
    gradient: 'radial-gradient(circle, #d39e00, #b57300)',
  },
  {
    name: 'saturn',
    orbitSize: 360,
    planetSize: 22,
    duration: 45,
    gradient: 'radial-gradient(circle, #d39e00, #b57300)',
    rings: {
      width: 45,
      height: 8,
      gradient:
        'linear-gradient(to right, transparent, #b0904f, #e5c16c, #b0904f, transparent)',
    },
  },
  {
    name: 'uranus',
    orbitSize: 420,
    planetSize: 16,
    duration: 60,
    gradient: 'radial-gradient(circle, #82e6ff, #3dbcd9)',
  },
  {
    name: 'neptune',
    orbitSize: 490,
    planetSize: 14,
    duration: 70,
    gradient: 'radial-gradient(circle, #335bff, #1a3aab)',
  },
]

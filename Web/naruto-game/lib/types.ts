export interface Ninjutsu {
  name: string;
  damage: number;
  description: string;
}

export interface Character {
  name: string;
  maxHealth: number;
  health: number;
  ninjutsu: Ninjutsu[];
}

export const characters: Character[] = [
  {
    name: 'Naruto',
    maxHealth: 100,
    health: 100,
    ninjutsu: [
      { name: 'Rasengan', damage: 35, description: 'A powerful spinning chakra sphere' },
      { name: 'Shadow Clone', damage: 20, description: 'Multiple clones attack the enemy' },
      { name: 'Nine-Tails Chakra', damage: 45, description: 'Unleash the power of Kurama' },
      { name: 'Sage Mode Punch', damage: 30, description: 'Enhanced physical attack with nature energy' }
    ]
  },
  {
    name: 'Sasuke',
    maxHealth: 100,
    health: 100,
    ninjutsu: [
      { name: 'Chidori', damage: 40, description: 'Lightning blade technique' },
      { name: 'Fireball Jutsu', damage: 25, description: 'Great fireball technique' },
      { name: 'Amaterasu', damage: 50, description: 'Black flames that never extinguish' },
      { name: 'Susanoo Arrow', damage: 35, description: 'Ethereal warrior\'s arrow attack' }
    ]
  },
  {
    name: 'Sakura',
    maxHealth: 100,
    health: 100,
    ninjutsu: [
      { name: 'Cherry Blossom Impact', damage: 30, description: 'Devastating punch with medical chakra' },
      { name: 'Healing Jutsu', damage: -20, description: 'Restore health instead of dealing damage' },
      { name: 'Strength of a Hundred', damage: 40, description: 'Release stored chakra for massive damage' },
      { name: 'Poison Needle', damage: 15, description: 'Quick poisoned senbon attack' }
    ]
  }
];
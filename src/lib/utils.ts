import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function calculateScore(value: 'SIMPLE' | 'DUPLO' | 'TRIPLO'): number {
  switch (value) {
    case 'SIMPLE':
      return 1
    case 'DUPLO':
      return 2
    case 'TRIPLO':
      return 3
    default:
      return 0
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
} 
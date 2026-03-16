import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | NeuralAtlas` : 'NeuralAtlas - Explore AI Models'
  }, [title])
}

import { useEffect, useState } from 'react'

export const useElectState = <T>(elect: T | undefined, delay: number) => {
  const [t, setT] = useState<T>()

  useEffect(() => {
    if (elect !== undefined) {
      setTimeout(() => setT(elect), delay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elect])

  return t
}

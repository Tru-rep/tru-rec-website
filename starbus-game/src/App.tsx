import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { StreetView } from './views/StreetView'
import { OfficeView } from './views/OfficeView'
import { loadGame, saveGame } from './engine/save'
import { createInitialState } from './engine/simulation'

function App() {
  const hydrate = useGameStore((s) => s.hydrate)
  const location = useGameStore((s) => s.location)

  useEffect(() => {
    const saved = loadGame()
    if (saved) {
      hydrate()
    } else {
      const initial = createInitialState()
      saveGame(initial)
    }
  }, [hydrate])

  return location === 'street' ? <StreetView /> : <OfficeView />
}

export default App

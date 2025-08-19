import ExecutiveDashboard from './components/ExecutiveDashboard'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ExecutiveDashboard />
    </ErrorBoundary>
  )
}

export default App

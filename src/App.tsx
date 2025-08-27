import ExecutiveDashboard from './components/ExecutiveDashboard'
import { ErrorBoundary } from './components/ErrorBoundary'
import PasswordProtect from './components/PasswordProtect'

function App() {
  return (
    <ErrorBoundary>
      <PasswordProtect>
        <ExecutiveDashboard />
      </PasswordProtect>
    </ErrorBoundary>
  )
}

export default App

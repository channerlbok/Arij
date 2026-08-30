import type { ReactNode } from 'react'
import AuthenticatedHeader from './AuthenticatedHeader'
import MochuAssistant from './MochuAssistant'
interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <AuthenticatedHeader />

      <main className="app-main">
        <div className="page-content">
          {children}
        </div>
      </main>
      <MochuAssistant />
    </div>
  )
}

export default AppLayout
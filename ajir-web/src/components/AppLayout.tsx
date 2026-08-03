import type { ReactNode } from 'react'
import AuthenticatedHeader from './AuthenticatedHeader'

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <AuthenticatedHeader />
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default AppLayout
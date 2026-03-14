'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarPlus, LogOut, User, BrainCircuit } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Schedule New', href: '/schedule', icon: CalendarPlus },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl hidden md:flex flex-col">
      <div className="flex h-16 shrink-0 items-center px-6 gap-2 border-b border-white/10">
        <BrainCircuit className="w-6 h-6 text-primary" />
        <span className="font-bold text-lg text-gradient tracking-tight">AI Interviewer</span>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

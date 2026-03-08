"use client"

import { LayoutGrid, ScanLine, Info, Cloud, Plane } from "lucide-react"
import { useEffect, useState } from "react"

type Page = "dashboard" | "scan" | "info" | "drone"

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

interface WeatherData {
  temp: number
  description: string
  city: string
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 28,
    description: "Sunny",
    city: "Chandigarh",
  })

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=30.7333&longitude=76.7794&current_weather=true"
        )
        const data = await res.json()
        if (data.current_weather) {
          const code = data.current_weather.weathercode
          let desc = "Clear"
          if (code === 0) desc = "Sunny"
          else if (code <= 3) desc = "Partly Cloudy"
          else if (code <= 48) desc = "Foggy"
          else if (code <= 67) desc = "Rainy"
          else if (code <= 77) desc = "Snowy"
          else desc = "Stormy"

          setWeather({
            temp: Math.round(data.current_weather.temperature),
            description: desc,
            city: "Chandigarh",
          })
        }
      } catch {
        // Keep defaults
      }
    }
    fetchWeather()
  }, [])

  const navItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: LayoutGrid },
    { id: "scan" as Page, label: "Scan Disease", icon: ScanLine },
    { id: "drone" as Page, label: "Drone Monitor", icon: Plane },
    { id: "info" as Page, label: "Disease Info", icon: Info },
  ]

  return (
    <aside className="flex flex-col justify-between w-[280px] min-h-screen bg-[#1B4332] text-white">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#F9A825]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8c0-5-5-5-5-5s-5 0-5 5c0 4 5 9 5 9s5-5 5-9z" />
              <path d="M12 13V21" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CropRaise</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => {
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-sm font-medium
                  ${isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Weather Widget */}
      <div className="px-4 pb-6">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-4 py-5 backdrop-blur-sm">
          <Cloud className="w-6 h-6 text-white/60 mb-1" />
          <span className="text-3xl font-bold text-white">{weather.temp}&deg;C</span>
          <span className="text-sm text-white/60">
            {weather.description} {weather.city}
          </span>
        </div>
      </div>
    </aside>
  )
}

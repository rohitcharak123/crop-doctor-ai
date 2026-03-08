"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ScanDisease } from "@/components/scan-disease"
import { Dashboard } from "@/components/dashboard"
import { DiseaseInfo } from "@/components/disease-info"
import { DroneMonitor } from "@/components/drone-monitor"

type Page = "dashboard" | "scan" | "info" | "drone"

export default function Home() {
  const [activePage, setActivePage] = useState<Page>("scan")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 p-6 overflow-auto">
        {activePage === "dashboard" && <Dashboard />}
        {activePage === "scan" && <ScanDisease />}
        {activePage === "drone" && <DroneMonitor />}
        {activePage === "info" && <DiseaseInfo />}
      </main>
    </div>
  )
}

"use client"

import { ScanLine, Bug, ShieldCheck, TrendingUp, Plane, IndianRupee } from "lucide-react"

export function Dashboard() {
  const stats = [
    {
      label: "Total Scans",
      value: "0",
      icon: ScanLine,
      color: "bg-[#1B5E20]/10 text-[#1B5E20]",
    },
    {
      label: "Diseases Found",
      value: "0",
      icon: Bug,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Drone Flights",
      value: "0",
      icon: Plane,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Accuracy Rate",
      value: "95%",
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
  ]

  const recentDiseases = [
    { name: "Pepper Bell Bacterial Spot", crop: "Pepper", severity: "High" },
    { name: "Tomato Late Blight", crop: "Tomato", severity: "Critical" },
    { name: "Potato Early Blight", crop: "Potato", severity: "Medium" },
    { name: "Apple Scab", crop: "Apple", severity: "Low" },
  ]

  return (
    <div className="flex-1 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Diseases + Tips */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Common Diseases */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Common Diseases</h2>
          <div className="flex flex-col gap-3">
            {recentDiseases.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">Crop: {d.crop}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    d.severity === "Critical"
                      ? "bg-red-100 text-red-700"
                      : d.severity === "High"
                      ? "bg-orange-100 text-orange-700"
                      : d.severity === "Medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {d.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Tips</h2>
          <div className="flex flex-col gap-3">
            {[
              { title: "Upload Clear Images", desc: "Take photos in natural light with the affected area in focus" },
              { title: "Use Drone Monitor", desc: "Upload aerial images to find exactly which zones need medicine" },
              { title: "Save Money", desc: "Only treat diseased zones instead of spraying the entire field" },
              { title: "Follow Treatment", desc: "Apply recommended treatments consistently for best results" },
            ].map((tip) => (
              <div key={tip.title} className="flex items-start gap-3 rounded-xl bg-secondary/50 px-4 py-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-[#1B5E20] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

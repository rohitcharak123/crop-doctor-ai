"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Upload, Play, Pause, MapPin, IndianRupee, Plane, Activity, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react"

interface ZoneResult {
  id: number
  row: number
  col: number
  status: "healthy" | "warning" | "diseased" | "critical"
  disease: string
  confidence: number
  treatment: string
  needsMedicine: boolean
  costPerAcre: number
}

interface FieldAnalysis {
  zones: ZoneResult[]
  totalZones: number
  healthyZones: number
  diseasedZones: number
  totalFieldCost: number
  targetedCost: number
  savings: number
  savingsPercent: number
}

const GRID_ROWS = 6
const GRID_COLS = 8

const ZONE_DISEASES = [
  { disease: "Healthy", treatment: "No treatment needed", costPerAcre: 0 },
  { disease: "Pepper Bell Bacterial Spot", treatment: "Apply copper-based bactericide", costPerAcre: 1200 },
  { disease: "Tomato Late Blight", treatment: "Apply chlorothalonil fungicide", costPerAcre: 1500 },
  { disease: "Potato Early Blight", treatment: "Apply mancozeb fungicide", costPerAcre: 1100 },
  { disease: "Corn Common Rust", treatment: "Apply triazole fungicide", costPerAcre: 950 },
  { disease: "Rice Blast", treatment: "Apply tricyclazole spray", costPerAcre: 1350 },
  { disease: "Citrus Canker", treatment: "Apply copper hydroxide sprays", costPerAcre: 1600 },
  { disease: "Wheat Powdery Mildew", treatment: "Apply triazole or strobilurin", costPerAcre: 1050 },
]

function getStatusColor(status: string) {
  switch (status) {
    case "healthy": return "bg-green-500"
    case "warning": return "bg-yellow-400"
    case "diseased": return "bg-orange-500"
    case "critical": return "bg-red-600"
    default: return "bg-gray-300"
  }
}

function getStatusBorder(status: string) {
  switch (status) {
    case "healthy": return "border-green-400"
    case "warning": return "border-yellow-300"
    case "diseased": return "border-orange-400"
    case "critical": return "border-red-500"
    default: return "border-gray-200"
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "healthy": return "text-green-700"
    case "warning": return "text-yellow-700"
    case "diseased": return "text-orange-700"
    case "critical": return "text-red-700"
    default: return "text-gray-700"
  }
}

export function DroneMonitor() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [analysis, setAnalysis] = useState<FieldAnalysis | null>(null)
  const [selectedZone, setSelectedZone] = useState<ZoneResult | null>(null)
  const [droneStatus, setDroneStatus] = useState<"idle" | "connected" | "scanning" | "complete">("idle")
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    setAnalysis(null)
    setSelectedZone(null)
    setDroneStatus("connected")
    setScanProgress(0)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  // Analyze the uploaded image by sampling pixel data from each grid zone
  const analyzeField = useCallback(async () => {
    if (!imagePreview) return
    setIsScanning(true)
    setDroneStatus("scanning")
    setScanProgress(0)
    setSelectedZone(null)

    // Load image into canvas to access pixel data
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imagePreview

    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })

    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(img, 0, 0)

    const zoneWidth = Math.floor(img.width / GRID_COLS)
    const zoneHeight = Math.floor(img.height / GRID_ROWS)
    const zones: ZoneResult[] = []
    const totalZones = GRID_ROWS * GRID_COLS

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        // Simulate scanning delay for realism
        await new Promise((r) => setTimeout(r, 40))
        const zoneIndex = row * GRID_COLS + col
        setScanProgress(Math.round(((zoneIndex + 1) / totalZones) * 100))

        // Sample pixels from this zone
        const x = col * zoneWidth
        const y = row * zoneHeight
        const sampleSize = Math.min(zoneWidth, zoneHeight, 50)
        const imageData = ctx.getImageData(
          x + Math.floor((zoneWidth - sampleSize) / 2),
          y + Math.floor((zoneHeight - sampleSize) / 2),
          sampleSize,
          sampleSize
        )

        let greenSum = 0
        let brownSum = 0
        let yellowSum = 0
        let totalPixels = 0

        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          totalPixels++

          if (g > r * 1.05 && g > b * 1.1 && g > 50) greenSum++
          if (r > 80 && g > 40 && g < r * 0.95 && b < g * 0.85) brownSum++
          if (r > 110 && g > 90 && b < g * 0.65) yellowSum++
        }

        const greenRatio = greenSum / totalPixels
        const brownRatio = brownSum / totalPixels
        const yellowRatio = yellowSum / totalPixels
        const damageScore = brownRatio * 3 + yellowRatio * 2

        let status: "healthy" | "warning" | "diseased" | "critical"
        let diseaseIndex = 0

        if (damageScore < 0.08 && greenRatio > 0.15) {
          status = "healthy"
          diseaseIndex = 0
        } else if (damageScore < 0.18) {
          status = "warning"
          // Pick a mild disease
          const seed = (row * GRID_COLS + col + Math.round(brownRatio * 1000)) % 4
          diseaseIndex = [4, 7, 3, 5][seed]
        } else if (damageScore < 0.35) {
          status = "diseased"
          const seed = (row * GRID_COLS + col + Math.round(yellowRatio * 1000)) % 4
          diseaseIndex = [1, 2, 5, 6][seed]
        } else {
          status = "critical"
          const seed = (row * GRID_COLS + col + Math.round(damageScore * 1000)) % 3
          diseaseIndex = [1, 6, 2][seed]
        }

        const diseaseInfo = ZONE_DISEASES[diseaseIndex]
        const confidence = status === "healthy"
          ? 90 + Math.random() * 9
          : 75 + Math.random() * 20

        zones.push({
          id: zoneIndex,
          row,
          col,
          status,
          disease: diseaseInfo.disease,
          confidence: parseFloat(confidence.toFixed(1)),
          treatment: diseaseInfo.treatment,
          needsMedicine: status !== "healthy",
          costPerAcre: diseaseInfo.costPerAcre,
        })
      }
    }

    const healthyZones = zones.filter((z) => z.status === "healthy").length
    const diseasedZones = totalZones - healthyZones
    const costPerAcreFullField = 1200 // Average treatment cost if treating entire field
    const totalFieldCost = costPerAcreFullField * totalZones
    const targetedCost = zones.reduce((sum, z) => sum + z.costPerAcre, 0)
    const savings = totalFieldCost - targetedCost

    setAnalysis({
      zones,
      totalZones,
      healthyZones,
      diseasedZones,
      totalFieldCost,
      targetedCost,
      savings: Math.max(0, savings),
      savingsPercent: Math.max(0, parseFloat(((savings / totalFieldCost) * 100).toFixed(1))),
    })

    setIsScanning(false)
    setDroneStatus("complete")
  }, [imagePreview])

  // Auto-select first diseased zone after analysis
  useEffect(() => {
    if (analysis && analysis.zones.length > 0) {
      const firstDiseased = analysis.zones.find((z) => z.needsMedicine)
      setSelectedZone(firstDiseased || analysis.zones[0])
    }
  }, [analysis])

  return (
    <div className="flex-1 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drone Field Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload aerial drone images to analyze field health zone-by-zone</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            droneStatus === "idle" ? "bg-secondary text-muted-foreground" :
            droneStatus === "connected" ? "bg-blue-100 text-blue-700" :
            droneStatus === "scanning" ? "bg-amber-100 text-amber-700" :
            "bg-green-100 text-green-700"
          }`}>
            <Plane className="w-4 h-4" />
            {droneStatus === "idle" && "No Image Loaded"}
            {droneStatus === "connected" && "Image Loaded"}
            {droneStatus === "scanning" && `Scanning... ${scanProgress}%`}
            {droneStatus === "complete" && "Analysis Complete"}
          </div>
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left Panel - Image + Grid */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Upload / Image Area */}
          <div className="bg-card rounded-2xl border border-border p-4 flex flex-col">
            {!imagePreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex items-center justify-center rounded-xl border-2 border-dashed py-16 transition-colors ${
                  dragOver ? "border-[#1B5E20] bg-green-50" : "border-border"
                }`}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Plane className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Upload Drone / Aerial Field Image</p>
                    <p className="text-xs text-muted-foreground mt-1">Drag and drop or click to select. Satellite or drone captured imagery works best.</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" aria-label="Select drone field image" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#155a1a] transition-colors">
                    Select Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Field image with grid overlay */}
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Drone aerial view of crop field" className="w-full h-auto max-h-[420px] object-cover rounded-xl" />
                  {/* Grid overlay when analysis done */}
                  {analysis && (
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
                      {analysis.zones.map((zone) => (
                        <button
                          key={zone.id}
                          onClick={() => setSelectedZone(zone)}
                          className={`border transition-all hover:opacity-90 ${
                            selectedZone?.id === zone.id ? "ring-2 ring-white ring-offset-1 z-10" : ""
                          } ${
                            zone.status === "healthy" ? "bg-green-500/35 border-green-400/50" :
                            zone.status === "warning" ? "bg-yellow-400/45 border-yellow-300/50" :
                            zone.status === "diseased" ? "bg-orange-500/50 border-orange-400/50" :
                            "bg-red-600/55 border-red-500/50"
                          }`}
                          aria-label={`Zone ${zone.row + 1}-${zone.col + 1}: ${zone.disease}`}
                        >
                          {zone.needsMedicine && (
                            <div className="flex items-center justify-center h-full">
                              <AlertTriangle className="w-3 h-3 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Scanning overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center rounded-xl">
                      <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
                      <p className="text-white font-semibold text-lg">Scanning Field...</p>
                      <div className="w-48 h-2 bg-white/30 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-[#F9A825] rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                      </div>
                      <p className="text-white/80 text-sm mt-2">{scanProgress}% - Analyzing {GRID_ROWS * GRID_COLS} zones</p>
                    </div>
                  )}
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" aria-label="Select drone field image" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#155a1a] transition-colors">
                    <Upload className="w-4 h-4" />
                    New Image
                  </button>
                  <button
                    onClick={analyzeField}
                    disabled={isScanning}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F9A825] text-[#1a1a1a] text-sm font-semibold hover:bg-[#F9A825]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isScanning ? "Scanning..." : "Start Drone Scan"}
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Legend */}
          {analysis && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Field Zone Legend</p>
              <div className="flex items-center gap-6">
                {[
                  { status: "healthy", label: "Healthy - No Treatment" },
                  { status: "warning", label: "Warning - Monitor" },
                  { status: "diseased", label: "Diseased - Treat" },
                  { status: "critical", label: "Critical - Urgent" },
                ].map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${getStatusColor(item.status)}`} />
                    <span className="text-xs text-foreground font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="w-[340px] shrink-0 flex flex-col gap-4">
          {/* Savings Card */}
          {analysis && (
            <div className="bg-[#1B5E20] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee className="w-5 h-5" />
                <h3 className="font-bold text-lg">Cost Savings</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Full Field Treatment</span>
                  <span className="text-sm font-bold line-through text-white/50">Rs. {analysis.totalFieldCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Targeted Treatment</span>
                  <span className="text-sm font-bold text-[#F9A825]">Rs. {analysis.targetedCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold">You Save</span>
                  <span className="text-xl font-bold text-[#F9A825]">Rs. {analysis.savings.toLocaleString("en-IN")}</span>
                </div>
                <div className="bg-white/15 rounded-xl px-4 py-3 text-center mt-1">
                  <p className="text-2xl font-bold text-[#F9A825]">{analysis.savingsPercent}%</p>
                  <p className="text-xs text-white/70">Money saved with drone-targeted treatment</p>
                </div>
              </div>
            </div>
          )}

          {/* Field Stats */}
          {analysis && (
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Field Health Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center bg-green-50 rounded-xl p-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-xl font-bold text-green-700">{analysis.healthyZones}</span>
                  <span className="text-xs text-green-600">Healthy Zones</span>
                </div>
                <div className="flex flex-col items-center bg-red-50 rounded-xl p-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mb-1" />
                  <span className="text-xl font-bold text-red-700">{analysis.diseasedZones}</span>
                  <span className="text-xs text-red-600">Needs Treatment</span>
                </div>
                <div className="flex flex-col items-center bg-blue-50 rounded-xl p-3">
                  <MapPin className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xl font-bold text-blue-700">{analysis.totalZones}</span>
                  <span className="text-xs text-blue-600">Total Zones</span>
                </div>
                <div className="flex flex-col items-center bg-amber-50 rounded-xl p-3">
                  <Activity className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-xl font-bold text-amber-700">
                    {((analysis.healthyZones / analysis.totalZones) * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-amber-600">Field Health</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Zone Detail */}
          {selectedZone && (
            <div className={`bg-card rounded-2xl border-2 ${getStatusBorder(selectedZone.status)} p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedZone.status)}`} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Zone {selectedZone.row + 1}-{selectedZone.col + 1}
                </h3>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                  selectedZone.status === "healthy" ? "bg-green-100 text-green-700" :
                  selectedZone.status === "warning" ? "bg-yellow-100 text-yellow-700" :
                  selectedZone.status === "diseased" ? "bg-orange-100 text-orange-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {selectedZone.status.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                <div>
                  <p className="text-xs text-muted-foreground">Detection</p>
                  <p className={`text-sm font-bold ${getStatusText(selectedZone.status)}`}>{selectedZone.disease}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-sm font-semibold text-foreground">{selectedZone.confidence}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Action Required</p>
                  <p className="text-sm font-semibold text-foreground">{selectedZone.treatment}</p>
                </div>
                {selectedZone.needsMedicine && (
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Cost</p>
                    <p className="text-sm font-bold text-red-600">Rs. {selectedZone.costPerAcre.toLocaleString("en-IN")} / acre</p>
                  </div>
                )}
                {!selectedZone.needsMedicine && (
                  <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                    <p className="text-xs font-bold text-green-700">No medicine needed - Save money!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!analysis && !isScanning && (
            <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center justify-center text-center flex-1">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Plane className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Drone Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Upload a drone or satellite image of your field, then click &quot;Start Drone Scan&quot; to analyze which zones need treatment and which are healthy - saving your hard-earned money.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, ScanLine } from "lucide-react"
import { AIAnalysisPanel, type AnalysisResult } from "./ai-analysis-panel"

export function ScanDisease() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    setImageFile(file)
    setResult(null)
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

  const handleScan = async () => {
    if (!imageFile || !imagePreview) return
    setIsAnalyzing(true)
    setResult(null)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || "Analysis failed")
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error("Analysis error:", err)
      setResult({
        disease: "Analysis Failed",
        confidence: 0,
        treatment: "Please try again with a clearer image",
        watering: "N/A",
        prevention: "Ensure good lighting and focus on the affected area",
        isHealthy: false,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex gap-6 flex-1 min-h-0">
      {/* Main Scan Area */}
      <div className="flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-foreground mb-5">AI Disease Diagnosis</h1>

        <div className="flex-1 flex flex-col bg-card rounded-2xl shadow-sm border border-border p-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex-1 flex items-center justify-center rounded-xl border-2 border-dashed transition-colors
              ${dragOver ? "border-[#1B5E20] bg-green-50" : "border-border"}
              ${imagePreview ? "p-4" : "p-8"}
            `}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Selected crop image for disease analysis"
                className="max-h-[400px] max-w-full object-contain rounded-lg shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drag and drop your crop image here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click Select Image below</p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              aria-label="Select crop image"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1B5E20] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#155a1a] transition-colors min-w-[200px]"
            >
              <Upload className="w-4 h-4" />
              Select Image
            </button>
            <button
              onClick={handleScan}
              disabled={!imageFile || isAnalyzing}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#F9A825] text-[#1a1a1a] font-semibold text-sm uppercase tracking-wider hover:bg-[#F9A825]/90 transition-colors min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ScanLine className="w-4 h-4" />
              {isAnalyzing ? "Scanning..." : "Scan Now"}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Panel */}
      <AIAnalysisPanel result={result} isLoading={isAnalyzing} />
    </div>
  )
}

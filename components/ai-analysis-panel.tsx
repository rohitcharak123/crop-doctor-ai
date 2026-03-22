"use client"

import { AlertCircle, Droplets, Pill, ShieldCheck, Bug, Sprout } from "lucide-react"

export interface AnalysisResult {
  disease: string
  confidence: number
  treatment: string
  watering: string
  prevention: string
  isHealthy: boolean
}

interface AIAnalysisPanelProps {
  result: AnalysisResult | null
  isLoading: boolean
}

export function AIAnalysisPanel({ result, isLoading }: AIAnalysisPanelProps) {
  return (
    <div className="w-[320px] shrink-0 flex flex-col bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-[#1B5E20] px-6 py-4">
        <h2 className="text-lg font-bold text-white">AI Analysis</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-10 h-10 border-3 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing image...</p>
          </div>
        )}

        {!isLoading && !result && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <Sprout className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Upload and scan a crop image to get AI-powered disease analysis
            </p>
          </div>
        )}

        {!isLoading && result && (
          <div className="flex flex-col gap-5">
            {/* Disease Name + Confidence */}
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                result.isHealthy ? "bg-green-100" : "bg-red-100"
              }`}>
                {result.isHealthy ? (
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <Bug className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Confidence: {result.confidence.toFixed(1)}%
                </p>
                <h3 className={`text-lg font-bold leading-tight mt-0.5 ${
                  result.isHealthy ? "text-green-700" : "text-red-600"
                }`}>
                  {result.disease}
                </h3>
              </div>
            </div>

            {/* Treatment */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pill className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Treatment</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{result.treatment}</p>
            </div>

            {/* Watering */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Watering</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{result.watering}</p>
            </div>

            {/* Prevention */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Prevention</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{result.prevention}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

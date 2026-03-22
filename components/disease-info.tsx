"use client"

import { useState } from "react"
import { Search, Bug, Leaf, Droplets, ShieldAlert } from "lucide-react"

const diseases = [
  {
    id: 1,
    name: "Pepper Bell Bacterial Spot",
    crop: "Pepper",
    symptoms: "Small, dark, water-soaked spots on leaves that enlarge and become angular. Spots may coalesce, causing leaf drop.",
    treatment: "Apply copper-based bactericides. Remove and destroy infected plant parts. Use certified disease-free seeds.",
    watering: "Avoid overhead watering. Use drip irrigation to keep foliage dry.",
    prevention: "Rotate crops every 2-3 years. Space plants for good air circulation. Avoid working with wet plants.",
  },
  {
    id: 2,
    name: "Tomato Late Blight",
    crop: "Tomato",
    symptoms: "Large, dark brown to black, water-soaked lesions on leaves and stems. White mold may appear on leaf undersides in humid conditions.",
    treatment: "Apply fungicide containing chlorothalonil or mancozeb. Remove and destroy all infected plants immediately.",
    watering: "Water at the base of the plant early in the day. Avoid overhead irrigation.",
    prevention: "Use resistant varieties. Ensure good air circulation. Remove volunteer tomato and potato plants.",
  },
  {
    id: 3,
    name: "Potato Early Blight",
    crop: "Potato",
    symptoms: "Dark brown, concentric ringed spots on older leaves first. Lesions may also appear on stems and tubers.",
    treatment: "Apply fungicides containing chlorothalonil at first sign of disease. Remove infected lower leaves.",
    watering: "Maintain consistent watering schedule. Avoid water stress which increases susceptibility.",
    prevention: "Rotate with non-solanaceous crops for 3 years. Use certified seed potatoes. Maintain adequate nutrition.",
  },
  {
    id: 4,
    name: "Apple Scab",
    crop: "Apple",
    symptoms: "Olive-green to dark brown velvety spots on leaves and fruit. Leaves may curl and drop. Fruit may crack.",
    treatment: "Apply fungicide sprays during spring. Prune infected branches. Remove fallen leaves and fruit.",
    watering: "Water at the base of the tree. Avoid wetting the foliage.",
    prevention: "Plant resistant cultivars. Rake and destroy fallen leaves in autumn. Ensure good air circulation through pruning.",
  },
  {
    id: 5,
    name: "Corn Common Rust",
    crop: "Corn",
    symptoms: "Small, round to elongated, cinnamon-brown pustules on both leaf surfaces. Pustules break open to release powdery spores.",
    treatment: "Apply foliar fungicides if caught early. Use resistant hybrids for future plantings.",
    watering: "Maintain proper irrigation without excess moisture. Ensure good field drainage.",
    prevention: "Plant resistant hybrids. Remove volunteer corn. Monitor fields regularly during humid weather.",
  },
  {
    id: 6,
    name: "Grape Black Rot",
    crop: "Grape",
    symptoms: "Small, circular brown spots on leaves with dark borders. Berries turn brown, shrivel, and become hard mummies.",
    treatment: "Apply fungicides from bud break through fruit set. Remove and destroy mummified berries and infected canes.",
    watering: "Use drip irrigation. Ensure good drainage around vines.",
    prevention: "Remove all mummies and infected plant parts during dormant pruning. Maintain open canopy for air circulation.",
  },
  {
    id: 7,
    name: "Rice Blast",
    crop: "Rice",
    symptoms: "Diamond-shaped lesions with gray centers and brown borders on leaves. Can affect nodes, causing stem breakage.",
    treatment: "Apply systemic fungicides like tricyclazole. Drain and dry the field if possible.",
    watering: "Avoid continuous flooding. Use intermittent irrigation to reduce humidity.",
    prevention: "Use resistant varieties. Avoid excessive nitrogen fertilization. Maintain proper plant spacing.",
  },
  {
    id: 8,
    name: "Wheat Powdery Mildew",
    crop: "Wheat",
    symptoms: "White to gray powdery fungal growth on leaves, stems, and heads. Leaves may yellow and die prematurely.",
    treatment: "Apply fungicides containing triazoles or strobilurins. Treat at first sign of disease.",
    watering: "Avoid excessive irrigation. Water in the morning to allow foliage to dry.",
    prevention: "Use resistant varieties. Avoid dense plantings. Maintain balanced nitrogen fertility.",
  },
]

export function DiseaseInfo() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDisease, setSelectedDisease] = useState(diseases[0])

  const filtered = diseases.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.crop.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-foreground">Disease Info</h1>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Disease List */}
        <div className="w-[320px] shrink-0 bg-card rounded-2xl border border-border p-4 flex flex-col">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search diseases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
            />
          </div>

          {/* List */}
          <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
            {filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDisease(d)}
                className={`text-left px-4 py-3 rounded-xl transition-colors ${
                  selectedDisease.id === d.id
                    ? "bg-[#1B5E20] text-white"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <p className="text-sm font-semibold">{d.name}</p>
                <p className={`text-xs mt-0.5 ${
                  selectedDisease.id === d.id ? "text-white/70" : "text-muted-foreground"
                }`}>
                  Crop: {d.crop}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Disease Details */}
        <div className="flex-1 bg-card rounded-2xl border border-border p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Bug className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedDisease.name}</h2>
              <p className="text-sm text-muted-foreground">Crop: {selectedDisease.crop}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Symptoms */}
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-[#1B5E20]" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Symptoms</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedDisease.symptoms}</p>
            </div>

            {/* Treatment */}
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-[#1B5E20]" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Treatment</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedDisease.treatment}</p>
            </div>

            {/* Watering */}
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-[#1B5E20]" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Watering</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedDisease.watering}</p>
            </div>

            {/* Prevention */}
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-[#1B5E20]" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Prevention</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedDisease.prevention}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

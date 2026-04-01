'use client'

import { useState, useCallback, useMemo, useEffect, useRef, type MouseEvent, type WheelEvent } from 'react'
import { getCountryByCode } from '@/lib/countries'

// Map from topojson IDs to ISO Alpha-2 codes
const countryIdToCode: Record<string, string> = {
  '4': 'AF', '8': 'AL', '12': 'DZ', '20': 'AD', '24': 'AO', '28': 'AG',
  '32': 'AR', '51': 'AM', '36': 'AU', '40': 'AT', '31': 'AZ', '44': 'BS',
  '48': 'BH', '50': 'BD', '52': 'BB', '112': 'BY', '56': 'BE', '84': 'BZ',
  '204': 'BJ', '64': 'BT', '68': 'BO', '70': 'BA', '72': 'BW', '76': 'BR',
  '96': 'BN', '100': 'BG', '854': 'BF', '108': 'BI', '132': 'CV', '116': 'KH',
  '120': 'CM', '124': 'CA', '140': 'CF', '148': 'TD', '152': 'CL', '156': 'CN',
  '170': 'CO', '174': 'KM', '178': 'CG', '180': 'CD', '188': 'CR', '384': 'CI',
  '191': 'HR', '192': 'CU', '196': 'CY', '203': 'CZ', '208': 'DK', '262': 'DJ',
  '212': 'DM', '214': 'DO', '218': 'EC', '818': 'EG', '222': 'SV', '226': 'GQ',
  '232': 'ER', '233': 'EE', '748': 'SZ', '231': 'ET', '242': 'FJ', '246': 'FI',
  '250': 'FR', '266': 'GA', '270': 'GM', '268': 'GE', '276': 'DE', '288': 'GH',
  '300': 'GR', '308': 'GD', '320': 'GT', '324': 'GN', '624': 'GW', '328': 'GY',
  '332': 'HT', '340': 'HN', '348': 'HU', '352': 'IS', '356': 'IN', '360': 'ID',
  '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '388': 'JM',
  '392': 'JP', '400': 'JO', '398': 'KZ', '404': 'KE', '296': 'KI', '408': 'KP',
  '410': 'KR', '414': 'KW', '417': 'KG', '418': 'LA', '428': 'LV', '422': 'LB',
  '426': 'LS', '430': 'LR', '434': 'LY', '438': 'LI', '440': 'LT', '442': 'LU',
  '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV', '466': 'ML', '470': 'MT',
  '584': 'MH', '478': 'MR', '480': 'MU', '484': 'MX', '583': 'FM', '498': 'MD',
  '492': 'MC', '496': 'MN', '499': 'ME', '504': 'MA', '508': 'MZ', '104': 'MM',
  '516': 'NA', '520': 'NR', '524': 'NP', '528': 'NL', '554': 'NZ', '558': 'NI',
  '562': 'NE', '566': 'NG', '807': 'MK', '578': 'NO', '512': 'OM', '586': 'PK',
  '585': 'PW', '275': 'PS', '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE',
  '608': 'PH', '616': 'PL', '620': 'PT', '634': 'QA', '642': 'RO', '643': 'RU',
  '646': 'RW', '659': 'KN', '662': 'LC', '670': 'VC', '882': 'WS', '674': 'SM',
  '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS', '690': 'SC', '694': 'SL',
  '702': 'SG', '703': 'SK', '705': 'SI', '90': 'SB', '706': 'SO', '710': 'ZA',
  '728': 'SS', '724': 'ES', '144': 'LK', '729': 'SD', '740': 'SR', '752': 'SE',
  '756': 'CH', '760': 'SY', '158': 'TW', '762': 'TJ', '834': 'TZ', '764': 'TH',
  '626': 'TL', '768': 'TG', '776': 'TO', '780': 'TT', '788': 'TN', '792': 'TR',
  '795': 'TM', '798': 'TV', '800': 'UG', '804': 'UA', '784': 'AE', '826': 'GB',
  '840': 'US', '858': 'UY', '860': 'UZ', '548': 'VU', '336': 'VA', '862': 'VE',
  '704': 'VN', '887': 'YE', '894': 'ZM', '716': 'ZW',
  '-99': 'XK',
}

interface GeoFeature {
  type: string
  id: string
  properties: { name: string }
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][]
  }
}

interface WorldMapProps {
  visitedCountries: string[]
  onCountryClick: (countryCode: string) => void
}

// Mercator projection
function project(lon: number, lat: number): [number, number] {
  const x = (lon + 180) * (800 / 360)
  const latRad = (lat * Math.PI) / 180
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
  const y = 200 - (mercN * 800) / (2 * Math.PI)
  return [x, y]
}

function coordinatesToPath(coords: number[][]): string {
  if (coords.length === 0) return ''
  
  // Filter out any coordinates that would cause issues with the antimeridian
  // by clamping longitude values and handling wrapping
  const processedCoords: number[][] = []
  
  for (let i = 0; i < coords.length; i++) {
    let lon = coords[i][0]
    const lat = coords[i][1]
    
    // If there's a previous coordinate, check for antimeridian crossing
    if (processedCoords.length > 0) {
      const prevLon = processedCoords[processedCoords.length - 1][0]
      const diff = lon - prevLon
      
      // If the jump is more than 180 degrees, wrap the longitude
      if (diff > 180) {
        lon -= 360
      } else if (diff < -180) {
        lon += 360
      }
    }
    
    processedCoords.push([lon, lat])
  }
  
  const points = processedCoords.map(([lon, lat]) => project(lon, lat))
  if (points.length < 2) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + 'Z'
}

function geometryToPath(geometry: GeoFeature['geometry']): string {
  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as number[][][]).map(coordinatesToPath).join(' ')
  } else if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][])
      .map((polygon) => polygon.map(coordinatesToPath).join(' '))
      .join(' ')
  }
  return ''
}

export function WorldMap({ visitedCountries, onCountryClick }: WorldMapProps) {
  const [features, setFeatures] = useState<GeoFeature[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltipContent, setTooltipContent] = useState('')
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 400 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries])

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((res) => res.json())
      .then((topology) => {
        // Convert TopoJSON to GeoJSON features
        const geometries = topology.objects.countries.geometries
        const arcs = topology.arcs
        
        const decodeArc = (arc: number[][]): number[][] => {
          const coords: number[][] = []
          let x = 0, y = 0
          for (const [dx, dy] of arc) {
            x += dx
            y += dy
            const lon = x * topology.transform.scale[0] + topology.transform.translate[0]
            const lat = y * topology.transform.scale[1] + topology.transform.translate[1]
            coords.push([lon, lat])
          }
          return coords
        }

        const decodeArcs = (arcIndices: number[]): number[][] => {
          const result: number[][] = []
          for (const idx of arcIndices) {
            const arc = idx < 0 ? [...decodeArc(arcs[~idx])].reverse() : decodeArc(arcs[idx])
            result.push(...arc)
          }
          return result
        }

        const geoFeatures: GeoFeature[] = geometries.map((geom: { type: string; id: string; properties: { name: string }; arcs: number[][] | number[][][] }, index: number) => {
          let coordinates: number[][][] | number[][][][] = []
          
          if (geom.type === 'Polygon') {
            coordinates = (geom.arcs as number[][]).map((ring) => decodeArcs(ring))
          } else if (geom.type === 'MultiPolygon') {
            coordinates = (geom.arcs as number[][][]).map((polygon) =>
              polygon.map((ring) => decodeArcs(ring))
            )
          }

          // Ensure we always have a valid ID - use index as fallback
          const featureId = geom.id !== undefined && geom.id !== null 
            ? String(geom.id) 
            : `unknown-${index}`

          return {
            type: 'Feature',
            id: featureId,
            properties: geom.properties || { name: 'Unknown' },
            geometry: { type: geom.type, coordinates },
          }
        })

        setFeatures(geoFeatures)
      })
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x
    const mouseY = ((e.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y

    const newWidth = Math.max(100, Math.min(1600, viewBox.width * zoomFactor))
    const newHeight = Math.max(50, Math.min(800, viewBox.height * zoomFactor))

    const newX = mouseX - ((mouseX - viewBox.x) / viewBox.width) * newWidth
    const newY = mouseY - ((mouseY - viewBox.y) / viewBox.height) * newHeight

    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight })
  }, [viewBox])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const dx = ((e.clientX - panStart.x) / rect.width) * viewBox.width
      const dy = ((e.clientY - panStart.y) / rect.height) * viewBox.height
      setViewBox((prev) => ({ ...prev, x: prev.x - dx, y: prev.y - dy }))
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [isPanning, panStart, viewBox])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleCountryHover = useCallback((feature: GeoFeature, e: MouseEvent) => {
    setHoveredId(feature.id)
    const countryCode = countryIdToCode[feature.id]
    const country = countryCode ? getCountryByCode(countryCode) : null
    setTooltipContent(country?.name || feature.properties?.name || 'Unknown')
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }, [])

  const handleCountryLeave = useCallback(() => {
    setHoveredId(null)
    setTooltipContent('')
  }, [])

  const handleCountryClick = useCallback((feature: GeoFeature) => {
    const countryCode = countryIdToCode[feature.id]
    if (countryCode) {
      onCountryClick(countryCode)
    }
  }, [onCountryClick])

  useEffect(() => {
    if (!tooltipRef.current) return
    tooltipRef.current.style.left = `${tooltipPosition.x + 10}px`
    tooltipRef.current.style.top = `${tooltipPosition.y - 30}px`
  }, [tooltipPosition])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-background">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className={`h-full w-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <rect x={viewBox.x - 100} y={viewBox.y - 100} width={viewBox.width + 200} height={viewBox.height + 200} fill="var(--background)" />
        {features.map((feature, index) => {
          const countryCode = countryIdToCode[feature.id]
          const isVisited = countryCode && visitedSet.has(countryCode)
          const isHovered = hoveredId === feature.id

          return (
            <path
              key={`country-${index}-${feature.id}`}
              d={geometryToPath(feature.geometry)}
              className="cursor-pointer transition-all duration-200 ease-in-out"
              fill={isVisited ? 'var(--map-visited)' : 'var(--map-unvisited)'}
              stroke="var(--border)"
              strokeWidth={0.3}
              opacity={isHovered ? 0.8 : 1}
              onMouseEnter={(e) => handleCountryHover(feature, e)}
              onMouseLeave={handleCountryLeave}
              onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
              onClick={() => handleCountryClick(feature)}
            />
          )
        })}
      </svg>

      {tooltipContent && (
        <div
          ref={tooltipRef}
          className="pointer-events-none fixed z-50 rounded-md bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-lg"
        >
          {tooltipContent}
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 rounded-lg bg-card/90 p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-map-visited" />
          <span className="text-xs text-foreground">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-map-unvisited" />
          <span className="text-xs text-foreground">Not visited</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 rounded-lg bg-card/90 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
        Scroll to zoom, drag to pan
      </div>
    </div>
  )
}

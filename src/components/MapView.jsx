import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Correction des icônes Leaflet par défaut
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function ChangeView({ center, zoom }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY || 'pk.eeb48ab82bd2608bd7c93ddf52c0068a' // Clé fallback de démo

export default function MapView({ 
  center = [14.7167, -17.4677],
  zoom = 13, 
  markers = [], 
  route = null,
  height = '200px'
}) {
  return (
    <div style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          url={`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_KEY}`}
          attribution='&copy; LocationIQ'
        />
        {markers.map((m, i) => (
          <Marker key={i} position={m.position}>
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
        {route && <Polyline positions={route} color="#f97316" weight={5} opacity={0.8} />}
      </MapContainer>
    </div>
  )
}

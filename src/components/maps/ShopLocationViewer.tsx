import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { ExternalLink, MapPin } from "lucide-react";

type ShopLocationViewerProps = {
  latitude: number;
  longitude: number;
  businessName: string;
};

const shopPin = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50% 50% 50% 0;
      background: #f77f00;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      transform: rotate(-45deg);
    ">
      <div style="
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        background: white;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function ShopLocationViewer({
  latitude,
  longitude,
  businessName,
}: ShopLocationViewerProps) {
  const position: [number, number] = [latitude, longitude];

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div>
      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-[#003049]">
            <MapPin size={18} className="text-[#f77f00]" />
            Shop Delivery Location
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Pin provided by {businessName}.
          </p>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#f77f00] px-3 py-2 text-sm font-medium text-[#f77f00] hover:bg-orange-50"
        >
          <ExternalLink size={16} />
          Open in Google Maps
        </a>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={false}
          dragging
          className="h-[340px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position} icon={shopPin} />
        </MapContainer>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </p>
    </div>
  );
}

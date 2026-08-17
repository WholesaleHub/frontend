import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LocateFixed, MapPin } from "lucide-react";

type ShopLocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
  onError: (message: string) => void;
};

const KENYA_CENTER: [number, number] = [-0.0236, 37.9062];

const selectedPin = L.divIcon({
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

function MapClickHandler({
  onChange,
}: Pick<ShopLocationPickerProps, "onChange">) {
  useMapEvents({
    click(event) {
      onChange(
        Number(event.latlng.lat.toFixed(6)),
        Number(event.latlng.lng.toFixed(6)),
      );
    },
  });

  return null;
}

function RecenterMap({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, {
        duration: 1,
      });
    }
  }, [map, position]);

  return null;
}

export default function ShopLocationPicker({
  latitude,
  longitude,
  onChange,
  onError,
}: ShopLocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);

  const selectedPosition = useMemo<[number, number] | null>(() => {
    if (latitude === null || longitude === null) {
      return null;
    }

    return [latitude, longitude];
  }, [latitude, longitude]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      onError("Location services are not supported by this browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(
          Number(position.coords.latitude.toFixed(6)),
          Number(position.coords.longitude.toFixed(6)),
        );

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          onError(
            "Location permission was denied. You can still click the map to place the shop pin manually.",
          );
          return;
        }

        onError(
          "Your current location could not be detected. Click the map to place the pin manually.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      },
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin size={17} className="text-[#f77f00]" />
            Pin your shop location
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Click the map or use your current location. Save the profile
            afterward.
          </p>
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#f77f00] px-3 py-2 text-sm font-medium text-[#f77f00] hover:bg-orange-50 disabled:opacity-50"
        >
          <LocateFixed size={16} />
          {isLocating ? "Locating..." : "Use my location"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <MapContainer
          center={selectedPosition ?? KENYA_CENTER}
          zoom={selectedPosition ? 16 : 6}
          scrollWheelZoom
          className="h-[360px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onChange={onChange} />

          <RecenterMap position={selectedPosition} />

          {selectedPosition && (
            <Marker position={selectedPosition} icon={selectedPin} />
          )}
        </MapContainer>
      </div>

      {selectedPosition ? (
        <p className="mt-2 text-xs text-green-700">
          Selected coordinates: {selectedPosition[0].toFixed(6)},{" "}
          {selectedPosition[1].toFixed(6)}
        </p>
      ) : (
        <p className="mt-2 text-xs text-yellow-700">
          No shop pin selected yet.
        </p>
      )}
    </div>
  );
}

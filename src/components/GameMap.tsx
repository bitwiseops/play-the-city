"use client";

import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { GameStage } from "@/types/index";

interface GameMapProps {
  stages: GameStage[];
  selectedStage: number | null;
  playerPosition: { latitude: number; longitude: number } | null;
  onSelectStage: (order: number) => void;
}

const categoryColors: Record<string, string> = {
  arte: "#a855f7",
  food: "#f97316",
  natura: "#22c55e",
  storia: "#d97706",
  nightlife: "#ec4899",
};

function createStageMarkerEl(stage: GameStage): HTMLDivElement {
  const el = document.createElement("div");
  const color = categoryColors[stage.poi.category] ?? "#64748b";
  const opacity = stage.unlocked ? "1" : "0.4";

  el.style.width = "36px";
  el.style.height = "36px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = color;
  el.style.border = stage.completed ? "3px solid #22c55e" : "3px solid white";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.fontSize = "14px";
  el.style.fontWeight = "bold";
  el.style.color = "white";
  el.style.opacity = opacity;
  el.style.cursor = "pointer";
  el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
  el.textContent = String(stage.order);

  return el;
}

function createPlayerMarkerEl(): HTMLDivElement {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = "20px";
  container.style.height = "20px";

  const pulse = document.createElement("div");
  pulse.className = "player-marker-pulse";
  pulse.style.position = "absolute";
  pulse.style.inset = "0";
  pulse.style.borderRadius = "50%";
  pulse.style.backgroundColor = "rgba(59, 130, 246, 0.4)";

  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.inset = "4px";
  dot.style.borderRadius = "50%";
  dot.style.backgroundColor = "#3b82f6";
  dot.style.border = "2px solid white";

  container.appendChild(pulse);
  container.appendChild(dot);
  return container;
}

export default function GameMap({
  stages,
  selectedStage,
  playerPosition,
  onSelectStage,
}: GameMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const playerMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const onSelectStageRef = useRef(onSelectStage);
  useEffect(() => {
    onSelectStageRef.current = onSelectStage;
  }, [onSelectStage]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [12.4964, 41.9028], // Rome default
      zoom: 13,
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update stage markers and route line
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      // Clear old markers
      for (const m of markersRef.current) {
        m.remove();
      }
      markersRef.current = [];

      const coords: [number, number][] = [];

      for (const stage of stages) {
        const el = createStageMarkerEl(stage);
        el.addEventListener("click", () =>
          onSelectStageRef.current(stage.order),
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([stage.poi.longitude, stage.poi.latitude])
          .addTo(map);

        markersRef.current.push(marker);
        coords.push([stage.poi.longitude, stage.poi.latitude]);
      }

      // Dashed route line
      if (coords.length >= 2) {
        if (map.getSource("route")) {
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: coords },
          });
        } else {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: coords },
            },
          });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            paint: {
              "line-color": "#64748b",
              "line-width": 2,
              "line-dasharray": [4, 4],
            },
          });
        }
      }

      // Fit bounds to show all markers
      if (coords.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        for (const c of coords) {
          bounds.extend(c);
        }
        map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
      }
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.on("load", addMarkers);
    }
  }, [stages]);

  // Fly to selected stage
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedStage === null) return;

    const stage = stages.find((s) => s.order === selectedStage);
    if (stage) {
      map.flyTo({
        center: [stage.poi.longitude, stage.poi.latitude],
        zoom: 16,
        duration: 1200,
      });
    }
  }, [selectedStage, stages]);

  // Player position marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!playerPosition) {
      if (playerMarkerRef.current) {
        playerMarkerRef.current.remove();
        playerMarkerRef.current = null;
      }
      return;
    }

    if (playerMarkerRef.current) {
      playerMarkerRef.current.setLngLat([
        playerPosition.longitude,
        playerPosition.latitude,
      ]);
    } else {
      const el = createPlayerMarkerEl();
      playerMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([playerPosition.longitude, playerPosition.latitude])
        .addTo(map);
    }
  }, [playerPosition]);

  // Expose flyTo via callback
  const flyTo = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1200 });
  }, []);

  // Keep flyTo accessible if needed externally via ref pattern
  void flyTo;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ touchAction: "pan-x pan-y" }}
    />
  );
}

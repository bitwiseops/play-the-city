"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
}

function getGeolocationSupported() {
  return typeof navigator !== "undefined" && !!navigator.geolocation;
}

export function useGeolocation(watch = true) {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supported = useSyncExternalStore(
    () => () => {},
    getGeolocationSupported,
    () => false,
  );

  useEffect(() => {
    if (!supported) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    };

    const onSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    };

    const onError = (err: GeolocationPositionError) => {
      setError(err.message);
    };

    if (watch) {
      const id = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        options,
      );
      return () => navigator.geolocation.clearWatch(id);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }
  }, [watch, supported]);

  return { position, error: supported ? error : "Geolocalizzazione non supportata" };
}

export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

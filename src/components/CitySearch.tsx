"use client";

import { useCallback, useRef, useState } from "react";

interface CityResult {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

interface CitySearchProps {
  onSelect: (city: string) => void;
}

const POPULAR_CITIES: CityResult[] = [
  { name: "Roma", country: "Italia", lat: 41.9028, lng: 12.4964 },
  { name: "Firenze", country: "Italia", lat: 43.7696, lng: 11.2558 },
  { name: "Napoli", country: "Italia", lat: 40.8518, lng: 14.2681 },
  { name: "Milano", country: "Italia", lat: 45.4642, lng: 9.19 },
  { name: "Venezia", country: "Italia", lat: 45.4408, lng: 12.3155 },
  { name: "Torino", country: "Italia", lat: 45.0703, lng: 7.6869 },
  { name: "Bologna", country: "Italia", lat: 44.4949, lng: 11.3426 },
  { name: "Palermo", country: "Italia", lat: 38.1157, lng: 13.3615 },
];

export default function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const filtered = POPULAR_CITIES.filter((city) =>
      city.name.toLowerCase().startsWith(value.toLowerCase()),
    );
    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  }, []);

  const handleSelect = useCallback(
    (city: CityResult) => {
      setQuery(city.name);
      setIsOpen(false);
      onSelect(city.name);
    },
    [onSelect],
  );

  const handlePlay = useCallback(() => {
    if (query.trim()) {
      onSelect(query.trim());
    }
  }, [query, onSelect]);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setIsOpen(false), 150);
          }}
          placeholder="Cerca una citta..."
          className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:border-blue-500 focus:outline-none text-lg"
          aria-label="Cerca una citta"
          autoComplete="off"
        />

        {isOpen && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            {suggestions.map((city) => (
              <li key={city.name}>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors text-white"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(city)}
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-slate-400 ml-2 text-sm">
                    {city.country}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handlePlay}
        disabled={!query.trim()}
        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        Gioca
      </button>
    </div>
  );
}

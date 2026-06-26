import { NextResponse } from "next/server";

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
let cache: { data: WeatherResult; at: number } | null = null;

type WeatherResult = {
  temp: number;
  condition: string;
  icon: string;
};

function conditionIcon(code: number): string {
  if (code === 800) return "☀️";
  if (code >= 801 && code <= 804) return "⛅";
  if (code >= 500 && code < 600) return "🌧️";
  if (code >= 200 && code < 300) return "⛈️";
  if (code >= 600 && code < 700) return "❄️";
  if (code >= 700 && code < 800) return "🌫️";
  return "🌡️";
}

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    return NextResponse.json({ temp: 28, condition: "Ensoleillé", icon: "☀️" });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Tunis,TN&units=metric&lang=fr&appid=${key}`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) throw new Error("API error");
    const d = await res.json();
    const data: WeatherResult = {
      temp: Math.round(d.main.temp),
      condition: d.weather[0].description,
      icon: conditionIcon(d.weather[0].id),
    };
    cache = { data, at: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ temp: 28, condition: "Ensoleillé", icon: "☀️" });
  }
}

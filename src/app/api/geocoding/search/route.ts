import { NextRequest, NextResponse } from "next/server";

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

interface GeocodingResponse {
  city: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  displayName: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Le paramètre de recherche 'q' est requis" },
        { status: 400 }
      );
    }

    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("q", query);
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("limit", "5");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("accept-language", "fr");

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "Teamify/1.0 (https://teamify.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur Nominatim: ${response.status}`);
    }

    const results: NominatimResult[] = await response.json();

    if (results.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const transformedResults: GeocodingResponse[] = results.map((result) => {
      let city = result.display_name;

      if (
        result.class === "place" ||
        result.type === "city" ||
        result.type === "town"
      ) {
        city = result.display_name.split(",")[0];
      } else {
        city = result.display_name.split(",")[0];
      }

      return {
        city: city.trim(),
        coordinates: {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
        },
        displayName: result.display_name,
      };
    });

    return NextResponse.json({ results: transformedResults });
  } catch (error) {
    console.error("Erreur lors de la géolocalisation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche de géolocalisation" },
      { status: 500 }
    );
  }
}


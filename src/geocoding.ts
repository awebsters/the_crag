const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const SEARCH_URL = "https://nominatim.openstreetmap.org/search";

async function fetchData(url: string, params: any) {
  // Convert parameters to query string
  const queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");

  // Combine URL with query string
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
}

export async function reverse(latitude: number, longitude: number) {
  // Define the URL and parameters
  const params = {
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: "json",
  };

  try {
    const result = await fetchData(REVERSE_URL, params);
    console.log("Success:", result);
    return result;
  } catch (error) {
    console.error("Error in fetchDataExample:", error);
  }
}

export async function search(query: string) {
  // Define the URL and parameters
  const params = {
    q: query,
    format: "json",
  };

  try {
    const result = await fetchData(SEARCH_URL, params);
    console.log("Success:", result);
    return result;
  } catch (error) {
    console.error("Error in fetchDataExample:", error);
  }
}

export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

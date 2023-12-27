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

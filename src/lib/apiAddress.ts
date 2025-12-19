import api from "@/services/http-client";

export interface ReverseGeocodeResult {
  area?: string;
  city?: string;
  postal_code?: string;
  street?: string;
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
    );
    const data = await res.json();
    const addr = data.address || {};

    // Nominatim Address Schema is messy.
    // Enhanced logic for India Context:

    // 1. Postcode
    const postal_code = addr.postcode || "";

    // Helper to validate text (not number, not country)
    const isValidText = (text: string) => {
      if (!text) return false;
      if (typeof text !== 'string') return false;
      const clean = text.trim();
      if (/^\d+$/.test(clean)) return false; // purely numeric (like pincode)
      if (clean.toLowerCase() === "india") return false; // country
      if (clean.length < 2) return false; // single chars are rarely valid city/area names
      return true;
    };


    // 2. City Logic
    let city = "";
    if (isValidText(addr.city)) city = addr.city;
    else if (isValidText(addr.town)) city = addr.town;
    else if (isValidText(addr.municipality)) city = addr.municipality;
    else if (isValidText(addr.village)) city = addr.village;
    else if (isValidText(addr.state_district)) city = addr.state_district;
    else if (isValidText(addr.county)) city = addr.county; // sometimes county has the city name

    // 3. Area Logic
    let area = "";
    if (isValidText(addr.suburb)) area = addr.suburb;
    else if (isValidText(addr.neighbourhood)) area = addr.neighbourhood;
    else if (isValidText(addr.residential)) area = addr.residential;
    else if (isValidText(addr.road)) area = addr.road;
    else if (isValidText(addr.city_district)) area = addr.city_district;
    else if (isValidText(addr.locality)) area = addr.locality;

    // Fallback area -> state if area is empty (but check isValid)
    if (!area && isValidText(addr.state)) {
      area = addr.state;
    }

    // 4. Street Address (for "House / Street" field)
    // Construct from house_number + road
    const parts = [];
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road && area !== addr.road) parts.push(addr.road); // validation: assume road is valid if not used as area? 
    // actually just use it.
    if (!parts.length && addr.pedestrian) parts.push(addr.pedestrian);

    const street = parts.join(", ");

    return {
      area: area,
      city: city,
      postal_code: postal_code,
      street: street,
    };
  } catch (error) {
    console.error("Reverse geocode failed", error);
    return {};
  }
}

export async function getPostOffices(pincode: string): Promise<any[]> {
  const res = await api.get<any>(`/address/post-offices`, {
    params: { pincode },
  });
  return res.data?.data ?? res.data ?? [];
}

export async function saveShippingAddress(payload: any) {
  const res = await api.post<any>("/shipping-addresses", payload);
  return res.data;
}

export async function listShippingAddresses() {
  const res = await api.get<any>("/shipping-addresses");
  return res.data.addresses ?? res.data.data ?? res.data;
}

export async function deleteShippingAddress(id: number) {
  return api.delete(`/shipping-addresses/${id}`);
}

export async function setDefaultShippingAddress(id: number) {
  const res = await api.post<any>(`/shipping-addresses/${id}/set-default`);
  return res.data;
}

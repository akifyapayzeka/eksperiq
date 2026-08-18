/** Universal https links — no custom URL scheme registration needed; each opens its native app if installed, else the web. */
export function buildMapLinks(place: { lat: number; lng: number; name: string }) {
  const encodedName = encodeURIComponent(place.name);
  return {
    apple: `https://maps.apple.com/?daddr=${place.lat},${place.lng}&q=${encodedName}`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`,
    yandex: `https://yandex.com/maps/?rtext=~${place.lat},${place.lng}`,
  };
}

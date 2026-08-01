import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
const subject = "mailto:destek@eksperiq.vercel.app";

console.log("Yeni VAPID anahtar çifti üretildi. Bunları Vercel ortam değişkenlerine ekleyin:");
console.log("");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=${subject}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log("");
console.log("VAPID_PRIVATE_KEY gizli tutulmalıdır; repoya veya .env.local dışında hiçbir yere yazılmamalıdır.");

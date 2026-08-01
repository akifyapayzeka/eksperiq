import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("Yeni VAPID anahtar cifti uretildi. Bunlari Vercel ortam degiskenlerine ekleyin:");
console.log("");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log("");
console.log("VAPID_PRIVATE_KEY gizli tutulmalidir; repoya veya .env.local disinda hicbir yere yazilmamalidir.");

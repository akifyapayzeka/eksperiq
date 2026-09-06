/**
 * Abonelik gruplarındaki "Subscription Level" politikası — tek kaynak.
 *
 * App Store'da level, aynı grup içindeki ürünler arasındaki yükseltme/düşürme
 * yönünü belirler: level 1 en üst kademedir. Bir kullanıcı daha ÜST kademeye
 * (daha küçük level) geçtiğinde değişiklik ANINDA uygulanır; daha ALT kademeye
 * geçtiğinde ise mevcut dönem bitene kadar ERTELENİR.
 *
 * Bu yüzden yanlış level sessiz ama gerçek bir kullanıcı zararıdır: örneğin
 * Pro+ Haftalık yanlışlıkla Pro'nun altındaki bir level'a konursa, Pro aboneliği
 * olan bir kullanıcı Pro+ satın aldığında Apple bunu "düşürme" sayar; kullanıcı
 * dönem sonuna kadar aldığı şeyi göremez. Aynı paketin bütün dönemleri (haftalık/
 * aylık/yıllık) aynı level'da olmalı ki dönem değişimi "crossgrade" sayılsın ve
 * anında geçsin.
 */

/** Pro+ en üst kademe (level 1), Pro onun altındaki kademe (level 2). */
export const PLAN_GROUP_LEVEL = {
  proPlus: 1,
  pro: 2,
};

/** productId -> beklenen groupLevel. Pro+ ürünleri 1, Pro ürünleri 2. */
export const EXPECTED_GROUP_LEVEL = {
  "com.eksperiq.app.proplus.weekly": PLAN_GROUP_LEVEL.proPlus,
  "com.eksperiq.app.proplus.monthly": PLAN_GROUP_LEVEL.proPlus,
  "com.eksperiq.app.proplus.yearly": PLAN_GROUP_LEVEL.proPlus,
  "com.eksperiq.app.pro.weekly": PLAN_GROUP_LEVEL.pro,
  "com.eksperiq.app.pro.monthly": PLAN_GROUP_LEVEL.pro,
  "com.eksperiq.app.pro.yearly": PLAN_GROUP_LEVEL.pro,
};

/** Bilinmeyen bir ürün sessizce "doğru" sayılmasın diye açıkça undefined döner. */
export function expectedGroupLevel(productId) {
  return EXPECTED_GROUP_LEVEL[productId];
}

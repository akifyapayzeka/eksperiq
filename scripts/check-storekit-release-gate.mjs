const purchaseFlag = process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED;
const sandboxVerifiedFlag = process.env.STOREKIT_SANDBOX_PURCHASE_VERIFIED;
const productIdsVerifiedFlag = process.env.STOREKIT_APP_STORE_PRODUCTS_VERIFIED;

function fail(message) {
  console.error(`StoreKit release gate failed: ${message}`);
  process.exitCode = 1;
}

if (purchaseFlag === "true") {
  if (sandboxVerifiedFlag !== "true") {
    fail("NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED=true requires STOREKIT_SANDBOX_PURCHASE_VERIFIED=true.");
  }
  if (productIdsVerifiedFlag !== "true") {
    fail("NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED=true requires STOREKIT_APP_STORE_PRODUCTS_VERIFIED=true.");
  }
}

if (sandboxVerifiedFlag === "true" && productIdsVerifiedFlag !== "true") {
  fail("STOREKIT_SANDBOX_PURCHASE_VERIFIED=true requires STOREKIT_APP_STORE_PRODUCTS_VERIFIED=true.");
}

if (!process.exitCode) {
  console.log("StoreKit release gate passed.");
}

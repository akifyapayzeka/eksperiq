const crypto = require("node:crypto");

// Apple Root CA - G3 — the trust anchor for every JWS Apple signs for
// StoreKit 2 (Transaction/Renewal Info) and App Store Server Notifications
// V2. Fetched directly from Apple's own PKI distribution
// (https://www.apple.com/certificateauthority/AppleRootCA-G3.cer, converted
// DER -> PEM) and hardcoded here rather than fetched at request time, so a
// compromised/unreachable CDN can never substitute a different trust
// anchor. Verified locally: subject == issuer "Apple Root CA - G3" (self-signed),
// SHA-256 fingerprint 63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79,
// valid 2014-04-30 through 2039-04-30.
const APPLE_ROOT_CA_G3_PEM = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----
`;

function base64UrlDecode(segment) {
  return Buffer.from(segment.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Validates that certs form a chain (each signed by the next) and that the
 * top of the chain is either `trustedRootPem` itself or was itself signed
 * by it — Apple's x5c sometimes includes the root, sometimes stops at the
 * intermediate, so both shapes must be accepted. Returns the leaf
 * certificate (certs[0]) on success, throws on any break in the chain.
 *
 * Takes the trusted root as a parameter (rather than hardcoding Apple's
 * root inline) purely so tests/unit/apple-jws.test.ts can exercise this
 * exact algorithm against a locally-generated synthetic root without
 * weakening what production actually trusts — verifyCertificateChain()
 * below is the only production entry point and always pins Apple's real
 * root.
 */
function verifyCertificateChainAgainstRoot(x5c, trustedRootPem) {
  if (!Array.isArray(x5c) || x5c.length === 0) {
    throw new Error("JWS header is missing an x5c certificate chain.");
  }

  const providedCerts = x5c.map((base64Der) => new crypto.X509Certificate(Buffer.from(base64Der, "base64")));

  const now = new Date();
  for (const cert of providedCerts) {
    if (now < new Date(cert.validFrom) || now > new Date(cert.validTo)) {
      throw new Error("A certificate in the x5c chain is expired or not yet valid.");
    }
  }

  for (let i = 0; i < providedCerts.length - 1; i += 1) {
    const subject = providedCerts[i];
    const issuer = providedCerts[i + 1];
    // X509Certificate#checkIssued(otherCert) asks "was *this* certificate
    // issued by otherCert?" — so it's subject.checkIssued(issuer), not the
    // reverse.
    if (!subject.checkIssued(issuer) || !subject.verify(issuer.publicKey)) {
      throw new Error("x5c certificate chain is broken: a certificate was not signed by the next one.");
    }
  }

  const root = new crypto.X509Certificate(trustedRootPem);
  const topOfProvidedChain = providedCerts[providedCerts.length - 1];
  const topIsTrustedRoot = topOfProvidedChain.fingerprint256 === root.fingerprint256;
  if (!topIsTrustedRoot) {
    if (!topOfProvidedChain.checkIssued(root) || !topOfProvidedChain.verify(root.publicKey)) {
      throw new Error("x5c certificate chain does not terminate at the trusted root.");
    }
  }

  return providedCerts[0];
}

/** Production entry point: always verifies against Apple's real pinned root. */
function verifyCertificateChain(x5c) {
  return verifyCertificateChainAgainstRoot(x5c, APPLE_ROOT_CA_G3_PEM);
}

/**
 * Verifies a compact JWS the way Apple signs StoreKit 2 transaction/renewal
 * info and App Store Server Notifications V2 payloads: ES256, with the
 * signing certificate chain carried in the "x5c" header claim rather than a
 * fixed/shared key. Throws on any failure — callers must treat a thrown
 * error as "not verified", never fall back to trusting the unverified
 * payload. Returns the decoded JSON payload only once the full chain and
 * signature check out.
 *
 * Real, working ES256/X.509 verification logic — exercised by
 * tests/unit/apple-jws.test.ts against a locally-generated synthetic
 * certificate chain (self-signed root -> intermediate -> leaf, in the same
 * shape Apple uses) so the crypto is proven correct. It has NOT been
 * exercised against a real payload signed by Apple's production servers —
 * that requires a live App Store Connect sandbox transaction, which does
 * not exist yet (see docs/ios-storekit-integration.md).
 */
function verifyAppleSignedPayload(compactJws, trustedRootPem = APPLE_ROOT_CA_G3_PEM) {
  if (typeof compactJws !== "string") {
    throw new Error("Expected a compact JWS string.");
  }
  const parts = compactJws.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed JWS: expected header.payload.signature.");
  }
  const [headerB64, payloadB64, signatureB64] = parts;

  const header = JSON.parse(base64UrlDecode(headerB64).toString("utf8"));
  if (header.alg !== "ES256") {
    throw new Error(`Unsupported JWS algorithm: ${header.alg}`);
  }

  const leafCert = verifyCertificateChainAgainstRoot(header.x5c, trustedRootPem);

  const signingInput = Buffer.from(`${headerB64}.${payloadB64}`, "utf8");
  const signature = base64UrlDecode(signatureB64);
  // JOSE/JWS ES256 signatures are the raw (r || s) concatenation, not the
  // DER SEQUENCE crypto.verify() expects by default — dsaEncoding must be
  // set to ieee-p1363 to match.
  const verified = crypto.verify(
    "sha256",
    signingInput,
    { key: leafCert.publicKey, dsaEncoding: "ieee-p1363" },
    signature,
  );
  if (!verified) {
    throw new Error("JWS signature verification failed.");
  }

  return JSON.parse(base64UrlDecode(payloadB64).toString("utf8"));
}

module.exports = {
  verifyAppleSignedPayload,
  verifyCertificateChain,
  verifyCertificateChainAgainstRoot,
  APPLE_ROOT_CA_G3_PEM,
};

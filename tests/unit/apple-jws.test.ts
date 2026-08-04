import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import crypto from "node:crypto";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { verifyAppleSignedPayload, APPLE_ROOT_CA_G3_PEM } = require("../../api/_lib/apple-jws.js");

/**
 * verifyAppleSignedPayload can only ever be proven correct against a real
 * Apple-signed JWS by an actual sandbox transaction (no App Store Connect
 * account exists yet — see docs/ios-storekit-integration.md). What *can* be
 * proven here, and is: the ES256 signature check and X.509 chain-of-trust
 * algorithm are implemented correctly, using a synthetic root -> intermediate
 * -> leaf chain in the exact shape Apple's does (built with openssl, since
 * Node's crypto module can verify but not mint X.509 certificates).
 */
describe("verifyAppleSignedPayload", () => {
  let dir: string;
  let rootPem: string;
  let leafCertDer: string;
  let intermediateCertDer: string;
  let rootCertDer: string;
  let leafKeyPem: string;

  function openssl(args: string[]) {
    execFileSync("openssl", args, { cwd: dir, stdio: "pipe" });
  }

  function derBase64(pemPath: string): string {
    return execFileSync("openssl", ["x509", "-in", pemPath, "-outform", "DER"], { cwd: dir }).toString("base64");
  }

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "apple-jws-test-"));

    openssl(["ecparam", "-name", "prime256v1", "-genkey", "-noout", "-out", "root-key.pem"]);
    openssl([
      "req",
      "-x509",
      "-new",
      "-key",
      "root-key.pem",
      "-sha256",
      "-days",
      "3650",
      "-subj",
      "/CN=Synthetic Test Root/O=EksperIQ Test/C=US",
      "-out",
      "root-cert.pem",
    ]);

    openssl(["ecparam", "-name", "prime256v1", "-genkey", "-noout", "-out", "intermediate-key.pem"]);
    openssl([
      "req",
      "-new",
      "-key",
      "intermediate-key.pem",
      "-subj",
      "/CN=Synthetic Test Intermediate/O=EksperIQ Test/C=US",
      "-out",
      "intermediate-csr.pem",
    ]);
    writeFileSync(
      join(dir, "intermediate.ext"),
      "basicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\n",
    );
    openssl([
      "x509",
      "-req",
      "-in",
      "intermediate-csr.pem",
      "-CA",
      "root-cert.pem",
      "-CAkey",
      "root-key.pem",
      "-CAcreateserial",
      "-days",
      "3650",
      "-sha256",
      "-out",
      "intermediate-cert.pem",
      "-extfile",
      "intermediate.ext",
    ]);

    openssl(["ecparam", "-name", "prime256v1", "-genkey", "-noout", "-out", "leaf-key.pem"]);
    openssl([
      "req",
      "-new",
      "-key",
      "leaf-key.pem",
      "-subj",
      "/CN=Synthetic Test Leaf/O=EksperIQ Test/C=US",
      "-out",
      "leaf-csr.pem",
    ]);
    openssl([
      "x509",
      "-req",
      "-in",
      "leaf-csr.pem",
      "-CA",
      "intermediate-cert.pem",
      "-CAkey",
      "intermediate-key.pem",
      "-CAcreateserial",
      "-days",
      "3650",
      "-sha256",
      "-out",
      "leaf-cert.pem",
    ]);

    rootPem = readFileSync(join(dir, "root-cert.pem"), "utf8");
    leafKeyPem = readFileSync(join(dir, "leaf-key.pem"), "utf8");
    rootCertDer = derBase64(join(dir, "root-cert.pem"));
    intermediateCertDer = derBase64(join(dir, "intermediate-cert.pem"));
    leafCertDer = derBase64(join(dir, "leaf-cert.pem"));
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function base64Url(buffer: Buffer): string {
    return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function sign(payload: unknown, x5c: string[]): string {
    const header = { alg: "ES256", x5c };
    const headerB64 = base64Url(Buffer.from(JSON.stringify(header)));
    const payloadB64 = base64Url(Buffer.from(JSON.stringify(payload)));
    const signingInput = Buffer.from(`${headerB64}.${payloadB64}`, "utf8");
    const privateKey = crypto.createPrivateKey(leafKeyPem);
    const signature = crypto.sign("sha256", signingInput, { key: privateKey, dsaEncoding: "ieee-p1363" });
    return `${headerB64}.${payloadB64}.${base64Url(signature)}`;
  }

  it("verifies a validly signed JWS and returns the decoded payload", () => {
    const jws = sign({ transactionId: "1000000123456789" }, [leafCertDer, intermediateCertDer]);
    const payload = verifyAppleSignedPayload(jws, rootPem);
    expect(payload).toEqual({ transactionId: "1000000123456789" });
  });

  it("also accepts an x5c chain that includes the root certificate itself", () => {
    const jws = sign({ ok: true }, [leafCertDer, intermediateCertDer, rootCertDer]);
    const payload = verifyAppleSignedPayload(jws, rootPem);
    expect(payload).toEqual({ ok: true });
  });

  it("rejects a chain that does not terminate at the trusted root", () => {
    const jws = sign({ ok: true }, [leafCertDer, intermediateCertDer]);
    expect(() => verifyAppleSignedPayload(jws, APPLE_ROOT_CA_G3_PEM)).toThrow(/does not terminate at the trusted root/);
  });

  it("rejects a tampered payload (signature no longer matches)", () => {
    const jws = sign({ amount: 100 }, [leafCertDer, intermediateCertDer]);
    const [headerB64, , signatureB64] = jws.split(".");
    const tamperedPayloadB64 = base64Url(Buffer.from(JSON.stringify({ amount: 999999 })));
    const tamperedJws = `${headerB64}.${tamperedPayloadB64}.${signatureB64}`;
    expect(() => verifyAppleSignedPayload(tamperedJws, rootPem)).toThrow(/signature verification failed/);
  });

  it("rejects a chain with a broken link (certs out of order)", () => {
    const jws = sign({ ok: true }, [intermediateCertDer, leafCertDer]);
    expect(() => verifyAppleSignedPayload(jws, rootPem)).toThrow(/chain is broken/);
  });

  it("rejects an unsupported algorithm", () => {
    const header = { alg: "HS256", x5c: [leafCertDer] };
    const headerB64 = base64Url(Buffer.from(JSON.stringify(header)));
    const payloadB64 = base64Url(Buffer.from(JSON.stringify({ ok: true })));
    const jws = `${headerB64}.${payloadB64}.fake-signature`;
    expect(() => verifyAppleSignedPayload(jws, rootPem)).toThrow(/Unsupported JWS algorithm/);
  });

  it("rejects a malformed JWS", () => {
    expect(() => verifyAppleSignedPayload("not-a-jws", rootPem)).toThrow(/Malformed JWS/);
  });

  it("rejects a JWS with no x5c header claim", () => {
    const header = { alg: "ES256" };
    const headerB64 = base64Url(Buffer.from(JSON.stringify(header)));
    const payloadB64 = base64Url(Buffer.from(JSON.stringify({ ok: true })));
    const jws = `${headerB64}.${payloadB64}.fake-signature`;
    expect(() => verifyAppleSignedPayload(jws, rootPem)).toThrow(/missing an x5c/);
  });

  it("the real Apple Root CA G3 constant is a valid, currently-in-date self-signed certificate", () => {
    const cert = new crypto.X509Certificate(APPLE_ROOT_CA_G3_PEM);
    expect(cert.subject).toContain("Apple Root CA - G3");
    expect(cert.checkIssued(cert)).toBe(true);
    const now = new Date();
    expect(now >= new Date(cert.validFrom)).toBe(true);
    expect(now <= new Date(cert.validTo)).toBe(true);
  });
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { median, topAverage, describeConnection } from "./speedtest.mjs";

test("median", () => {
  assert.equal(median([]), 0);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
});

test("topAverage keeps the top 60%", () => {
  assert.equal(topAverage([]), 0);
  assert.equal(topAverage([10]), 10);
  assert.equal(topAverage([1, 100, 90, 80, 2]), 90);
});

test("describeConnection prefers geo lookup, falls back to Cloudflare", () => {
  const cf = { colo: { iata: "AMS", city: "Amsterdam", cca2: "NL" }, city: "Amsterdam", country: "NL", asOrganization: "KPN", asn: 1136 };
  assert.deepEqual(describeConnection("1.2.3.4", null, cf), {
    ip: "1.2.3.4",
    isp: "KPN, AS1136",
    edge: "AMS, Amsterdam, NL",
    location: "Amsterdam, NL",
  });
  const geo = { org: "Ziggo", asn: "AS33915", city: "Utrecht", region: "Utrecht", country: "Netherlands" };
  const d = describeConnection("1.2.3.4", geo, cf);
  assert.equal(d.isp, "Ziggo, AS33915");
  assert.equal(d.location, "Utrecht, Utrecht, Netherlands");
  assert.equal(describeConnection(null, null, { colo: "AMS" }).edge, "AMS");
  assert.equal(describeConnection(null, null, null).ip, "Unavailable");
});

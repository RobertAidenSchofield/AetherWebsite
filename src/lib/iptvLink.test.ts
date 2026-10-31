// Mirrors the app's AetherTests/Services/OnboardingSetupTests.swift, so the
// site and the app recognise the same links the same way.
import { describe, expect, test } from "vitest";
import { defaultName, recognise, withScheme } from "./iptvLink";

describe("provider links", () => {
  test("an Xtream get.php link carries the whole login", () => {
    expect(recognise("http://line.example.com:8080/get.php?username=alice&password=s3cret&type=m3u_plus")).toEqual({
      kind: "xtream",
      server: "http://line.example.com:8080",
      username: "alice",
      password: "s3cret",
    });
  });

  test("a player_api link is an Xtream login too", () => {
    expect(recognise("https://line.example.com/player_api.php?username=alice&password=s3cret")).toEqual({
      kind: "xtream",
      server: "https://line.example.com",
      username: "alice",
      password: "s3cret",
    });
  });

  test("a bare server address is an Xtream server", () => {
    expect(recognise("http://line.example.com:8080")).toEqual({ kind: "xtreamServer", server: "http://line.example.com:8080" });
    expect(recognise("line.example.com:8080/")).toEqual({ kind: "xtreamServer", server: "http://line.example.com:8080" });
  });

  test("a portal path is a Stalker portal", () => {
    expect(recognise("http://portal.example.com:8080/c/")).toEqual({ kind: "stalker", portal: "http://portal.example.com:8080/c/" });
    expect(recognise("http://portal.example.com/stalker_portal/server/load.php/portal.php")).toEqual({
      kind: "stalker",
      portal: "http://portal.example.com/stalker_portal/server/load.php/portal.php",
    });
  });

  test("a playlist file is an m3u link", () => {
    expect(recognise("https://example.com/lists/tv.m3u8")).toEqual({ kind: "m3u", url: "https://example.com/lists/tv.m3u8" });
  });

  test("a get.php link without credentials stays an m3u link", () => {
    expect(recognise("http://example.com/get.php?type=m3u")).toEqual({ kind: "m3u", url: "http://example.com/get.php?type=m3u" });
  });

  test("text that isn't an address is nothing", () => {
    expect(recognise("")).toBeNull();
    expect(recognise("ftp://example.com/list.m3u")).toBeNull();
    expect(recognise("not a link at all")).toBeNull();
  });
});

describe("addresses", () => {
  test("an address without a scheme gets http", () => {
    expect(withScheme(" 192.168.1.10:8096 ")).toBe("http://192.168.1.10:8096");
    expect(withScheme("https://jf.example.com")).toBe("https://jf.example.com");
  });

  test("an unnamed playlist is named after its host", () => {
    expect(defaultName("http://www.example.com:8080/get.php")).toBe("example.com");
    expect(defaultName("192.168.1.10:8096")).toBe("192.168.1.10");
  });
});

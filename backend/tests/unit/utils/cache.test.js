const cache = require("../../../src/utils/cache");

describe("Cache Singleton", () => {
  beforeEach(() => {
    // Let's clear our cache before each test
    cache.clear();
  });

  test("should always return the same instance (singleton)", () => {
    const cache2 = require("../../../src/utils/cache");
    expect(cache).toBe(cache2);
  });

  test("should store and retrieve a value", () => {
    cache.set("testKey", 123);
    const value = cache.get("testKey");
    expect(value).toBe(123);
  });

  test("should return undefined for missing key", () => {
    const value = cache.get("missing");
    expect(value).toBeUndefined();
  });

  test("should update value", () => {
    cache.set("key", "first");
    cache.set("key", "second");
    expect(cache.get("key")).toBe("second");
  });

  test("should delete a key", () => {
    cache.set("key", 42);
    cache.clear("key");
    expect(cache.get("key")).toBeUndefined();
  });

  test("should clear all keys", () => {
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });
});

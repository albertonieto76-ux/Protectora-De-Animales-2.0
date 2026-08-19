import { describe, expect, it } from "vitest";
import { toDateTimeLocalValue, toEventApiDate } from "./AdminEvents";

describe("event date conversion", () => {
  it("preserves the selected local time after the API round trip", () => {
    const selectedDate = "2026-08-18T10:30";
    const apiDate = toEventApiDate(selectedDate);

    expect(apiDate).toMatch(/Z$/);
    expect(toDateTimeLocalValue(apiDate)).toBe(selectedDate);
  });
});
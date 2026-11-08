import { describe, expect, it } from "vitest";
import { imageSrc } from "./images";

describe("imageSrc", () => {
  it("serves catalog illustrations from the current address", () => {
    expect(imageSrc("http://localhost:3000/catalog-images/eco-bottle.svg")).toBe(
      "/catalog-images/eco-bottle.svg",
    );
    expect(imageSrc("https://old.ngrok-free.app/catalog-images/tee.svg")).toBe("/catalog-images/tee.svg");
  });

  it("leaves other images alone", () => {
    expect(imageSrc("https://cdn.brand.com/tee.jpg")).toBe("https://cdn.brand.com/tee.jpg");
    expect(imageSrc(undefined)).toBeUndefined();
    expect(imageSrc("not a url")).toBeUndefined();
  });
});

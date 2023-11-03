import { describe, expect, test } from "@jest/globals";
import JwtLogic from "./jwtLogic";

import * as dotenv from "dotenv";
dotenv.config();

describe("create jwt token", () => {
  test("should create jwt token", async () => {
    const jwtLogic = new JwtLogic();
    const token = await jwtLogic.generateJWTToken();

    expect(token).not.toBeNull();
  });
});
describe("get spotify access token", () => {});
describe("get eventix access token", () => {});

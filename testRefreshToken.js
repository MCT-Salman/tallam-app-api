import dotenv from "dotenv";
import { generateTokenPair, refreshAccessToken } from "./utils/jwt.js"; // عدّل المسار حسب مجلدك

dotenv.config();

(async () => {
  try {
    // 1. إنشاء زوج من التوكنات
    const userId = 4;
    const sessionId = "cmh3g0vz00001vpcclwlnqjaj";
    const role = "admin";

    const tokens = await generateTokenPair(userId, sessionId, role);
    console.log("✅ Tokens created:");
    console.log("Access Token:", tokens.accessToken);
    console.log("Refresh Token:", tokens.refreshToken);
    console.log("Access expires in:", tokens.expiresIn, "seconds");

    // 2. انتظر حتى ينتهي access token (30 ثانية)
    console.log("\n⏳ انتظر 35 ثانية حتى تنتهي صلاحية الـ access token...");
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // 3. جرب استخدام refresh token لتجديد access token
    console.log("\n🔁 نحاول تجديد التوكن...");
    const newTokens = await refreshAccessToken(tokens.refreshToken);
    console.log("✅ تم إنشاء توكن جديد:");
    console.log("New Access Token:", newTokens.accessToken);
    console.log("New Refresh Token:", newTokens.refreshToken);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
})();

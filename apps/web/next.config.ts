import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@ai-coding/ui"],
  experimental: {
    reactCompiler: true,
  },
};

export default config;

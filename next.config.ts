import type { NextConfig } from "next";

// Determine base path when running on GitHub Actions. This allows the app to be
// served from a subfolder (the repository name) when deployed to GitHub Pages.
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = process.env.BASE_PATH || (process.env.GITHUB_ACTIONS ? `/${repoName}` : "");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;

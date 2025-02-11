import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpackDevMiddleware: (config: Configuration) => {
    // Solve the problem of hot loading of the front end and back end
    config.watchOptions = {
      poll: 2500, //check for file changes every 2.5 seconds
      aggregateTimeout: 300, //a bit delay before rebuilding
    };
    return config;
  }
};

export default nextConfig;

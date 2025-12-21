// @ts-check

const NextBundleAnalyzer = require('@next/bundle-analyzer');
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants.js');
const { repository } = require('./package.json');

/**
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

/**
 * @param {string} stage
 */
module.exports = function next(stage) {
  return withBundleAnalyzer(
    defineNextConfig({
      // distDir: stage == PHASE_PRODUCTION_BUILD ? 'build' : '_next',
      // assetPrefix: stage == PHASE_DEVELOPMENT_SERVER ? undefined : './',
      productionBrowserSourceMaps: true,
      publicRuntimeConfig: {
        repository,
      },
      webpack(config) {
        config.module.rules.push({
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        });
        config.experiments.topLevelAwait = true;
        return config;
      },
    }),
  );
};

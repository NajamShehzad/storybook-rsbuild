import type { StorybookConfig } from 'storybook-react-rsbuild'
import { join, dirname, extname } from 'path'
import { mergeRsbuildConfig } from '@rsbuild/core'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-interactions'),
  ],
  framework: {
    name: getAbsolutePath('storybook-react-rsbuild'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  rsbuildFinal: (config) => {
    if (!config.source) {
      config.source = {}
    }

    return mergeRsbuildConfig(config, {
      tools: {
        rspack: (config, { addRules, appendPlugins, rspack, mergeConfig }) => {
          return mergeConfig(config, {
            plugins: [
              new rspack.IgnorePlugin({
                checkResource: (resource, context) => {
                  // for example, ignore all markdown files
                  const absPathHasExt = extname(resource)
                  if (absPathHasExt === '.txt' || absPathHasExt === '.ps1') {
                    return true
                  }

                  return false
                },
              }),
            ],
          })
        },
      },
    });

  },
  typescript: {
    reactDocgen: 'react-docgen',
    check: true,
  },
}

export default config
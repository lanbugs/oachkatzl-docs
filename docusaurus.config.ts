import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Oachkatzl Documentation',
  tagline: 'Self-hosted automation platform for Ansible, Bash, and Python',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://oachkatzl.io',
  baseUrl: '/docs/',

  organizationName: 'lanbugs',
  projectName: 'oachkatzl',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'de'],
        docsRouteBasePath: '/',
        indexDocs: true,
        indexPages: false,
        searchResultLimits: 8,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: undefined,
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Oachkatzl',
      logo: {
        alt: 'Oachkatzl Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://oachkatzl.io',
          label: 'oachkatzl.io',
          position: 'right',
        },
        {
          href: 'https://github.com/lanbugs/oachkatzl',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Overview', to: '/'},
            {label: 'Templates', to: '/templates'},
            {label: 'Workflows', to: '/workflows'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'oachkatzl.io', href: 'https://oachkatzl.io'},
            {label: 'GitHub', href: 'https://github.com/lanbugs/oachkatzl'},
            {label: 'netdevops.blog', href: 'https://netdevops.blog'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Maximilian Thoma. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'yaml', 'json', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

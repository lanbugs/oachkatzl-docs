import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'overview',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'dashboard',
      label: 'Dashboard',
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'projects-roles',
        'project-members',
        'access-keys',
        'custom-credentials',
        'repositories',
        'inventories',
        'environments',
      ],
    },
    {
      type: 'category',
      label: 'Running Automation',
      collapsed: false,
      items: [
        'templates',
        'build-deploy',
        'survey-variables',
        'running-tasks',
        'schedules',
        'execute-tokens',
      ],
    },
    {
      type: 'category',
      label: 'Workflows',
      collapsed: false,
      items: [
        'workflows',
        'approval-gates',
        'action-nodes',
        'artifact-cache',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      collapsed: false,
      items: [
        'scaling-workers',
        'custom-workers',
        'custom-apps',
        'pip-proxy',
        'notifications',
      ],
    },
    {
      type: 'doc',
      id: 'security',
      label: '2FA & Security',
    },
    {
      type: 'category',
      label: 'Administration',
      collapsed: false,
      items: [
        'profile',
        'admin-users',
        'admin-settings',
      ],
    },
    {
      type: 'doc',
      id: 'about',
      label: 'About',
    },
  ],
};

export default sidebars;

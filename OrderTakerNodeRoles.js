// Canonical data structure for OrderTaker Node Roles
export const OrderTakerNodeRoles = [
  {
    key: 'orderCreator',
    label: 'Order Creator',
    description: 'Initiates new orders (customer, automated system, or API).',
    dependsOn: [],
    provides: ['orderProcessor']
  },
  {
    key: 'orderProcessor',
    label: 'Order Processor',
    description: 'Validates and preprocesses incoming orders.',
    dependsOn: ['orderCreator'],
    provides: ['orderAssigner']
  },
  {
    key: 'orderAssigner',
    label: 'Order Assigner/Dispatcher',
    description: 'Assigns orders to agents/resources using AI/optimization.',
    dependsOn: ['orderProcessor'],
    provides: ['orderTracker', 'inventoryManager']
  },
  {
    key: 'orderTracker',
    label: 'Order Tracker',
    description: 'Monitors order status, location, and progress in real time.',
    dependsOn: ['orderAssigner'],
    provides: ['notificationSender', 'analyticsReporting', 'fallbackRecovery']
  },
  {
    key: 'inventoryManager',
    label: 'Inventory Manager',
    description: 'Tracks and updates inventory/resource availability.',
    dependsOn: ['orderAssigner'],
    provides: ['dataSync']
  },
  {
    key: 'notificationSender',
    label: 'Notification Sender',
    description: 'Sends real-time updates to users, agents, or other nodes.',
    dependsOn: ['orderTracker'],
    provides: []
  },
  {
    key: 'dataSync',
    label: 'Data Sync/Replicator',
    description: 'Syncs order and status data with other nodes or the global system.',
    dependsOn: ['inventoryManager'],
    provides: ['securityController']
  },
  {
    key: 'securityController',
    label: 'Security/Access Controller',
    description: 'Enforces permissions, authentication, and audit logging.',
    dependsOn: ['dataSync'],
    provides: ['policyEnforcer']
  },
  {
    key: 'analyticsReporting',
    label: 'Analytics/Reporting',
    description: 'Aggregates and reports metrics (order volume, delays, etc.).',
    dependsOn: ['orderTracker'],
    provides: []
  },
  {
    key: 'fallbackRecovery',
    label: 'Fallback/Recovery',
    description: 'Handles failed orders, retries, and escalations.',
    dependsOn: ['orderTracker'],
    provides: []
  },
  {
    key: 'userInterface',
    label: 'User/Agent Interface',
    description: 'Provides UI or API endpoints for local users, agents, or devices.',
    dependsOn: [],
    provides: [
      'orderCreator',
      'orderTracker',
      'analyticsReporting',
      'inventoryManager',
      'policyEnforcer'
    ]
  },
  {
    key: 'policyEnforcer',
    label: 'Policy Enforcer',
    description: 'Applies business rules, compliance, and SLA enforcement.',
    dependsOn: ['securityController'],
    provides: ['orderProcessor']
  }
];

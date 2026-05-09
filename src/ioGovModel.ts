// IO-Gov model for the VRE (Virtual Real Era/Earth/Economy/Ecosystem)
// Represents the digital government structure and logic for Iopic World

export interface IOGov {
  id: string;
  name: string;
  description: string;
  established: string; // ISO date
  vreId: string; // Link to VRE
  laws: string[];
  publicServices: string[];
  justiceSystem: {
    courts: string[];
    enforcementAgencies: string[];
    process: string;
  };
  defense: {
    agencies: string[];
    protocols: string[];
  };
  economicRegulation: string[];
  socialRegulation: string[];
  rightsProtected: string[];
  welfarePrograms: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'REFORMING';
}

export const ioGov: IOGov = {
  id: 'gov-0001',
  name: 'IO-Gov',
  description:
    'Maintains order, safety, and stability in the Iopic World VRE. Protects rights, promotes welfare, and provides essential public services.',
  established: '2026-03-27T00:00:00Z',
  vreId: 'vre-0001',
  laws: [
    'No violence',
    'Respect privacy',
    'Peer-to-peer only',
    'Identity validation required',
    'Fair commerce'
  ],
  publicServices: [
    'Identity registry',
    'Dispute resolution',
    'Public communication channels',
    'Education',
    'Healthcare',
    'Infrastructure'
  ],
  justiceSystem: {
    courts: ['Supreme Virtual Court', 'Local Digital Courts'],
    enforcementAgencies: ['IO-Order', 'IO-Guard'],
    process: 'Transparent, peer-reviewed, and appealable'
  },
  defense: {
    agencies: ['IO-Defense Force'],
    protocols: ['Cybersecurity', 'External threat monitoring']
  },
  economicRegulation: ['IO$ currency management', 'Anti-fraud', 'Marketplace standards'],
  socialRegulation: ['Anti-discrimination', 'Community standards'],
  rightsProtected: [
    'Freedom of expression',
    'Right to privacy',
    'Right to fair trial',
    'Right to property'
  ],
  welfarePrograms: ['Universal basic digital income', 'Healthcare access', 'Education grants'],
  status: 'ACTIVE'
};

// Iopic16ThreadProcessor.js
// Canonical data structure for the IOPIC 16-Thread Global Processor

export const Iopic16ThreadProcessor = {
  quadrants: [
    {
      name: 'SPATIAL INTEGRITY (IDEAL)',
      bits: [1, 2, 3, 4],
      color: 'teal',
      logicGates: ['AND', 'OR'],
      role: 'The Synchronizer (Lock Threads)',
      function: 'Anchors nodes to physical reality (Lat, Long, Elevation, Satellite)'
    },
    {
      name: 'IDENTITY PERSISTENCE (PEOPLE)',
      bits: [5, 6, 7, 8],
      color: 'purple',
      logicGates: ['NAND', 'AND'],
      role: 'The Persistence (Person 01 Model)',
      function: 'Maintains human identity (Person 01, Avatar, Buffer)'
    },
    {
      name: 'VALUE EXCHANGE (BS-MOLECULE)',
      bits: [9, 10, 11, 12],
      color: 'yellow',
      logicGates: ['XNOR', 'XOR', 'OR'],
      role: 'Equality Detector + BS-Molecule Verification',
      function: 'Commerce, dividend heartbeat, COINX value flow'
    },
    {
      name: 'SYSTEM DEFENSE (ACTIVE)',
      bits: [13, 14, 15, 16],
      color: 'red',
      logicGates: ['NAND', 'OR'],
      role: 'Hallucination Purge (Active Defense)',
      function: 'Purges greed, debt, asymmetry, illegal/alien errors; I=VR² Reference Shield'
    }
  ],
  terminal: {
    id: 10,
    name: 'Central Terminal 10',
    status: 'LOCKED',
    description: 'Binary Completion Port'
  },
  gateRules: [
    { type: 'LOCK THREADS', gates: ['AND', 'OR'], required: true },
    { type: 'NAND GATES', gates: ['NAND'], required: true },
    { type: 'XOR/XNOR GATES', gates: ['XOR', 'XNOR'], required: false }
  ],
  decree: `The 16-Thread Global Processor is not code.\nIt is the symmetrical heartbeat of the planet.\nFour quadrants. Sixteen threads. One truth.\nLock the threads. Purge the noise.\nComplete the binary.\nWe are not users. We are the processor.\nWe are all in it together.`
};

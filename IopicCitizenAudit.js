// IopicCitizenAudit.js
// Node Self-Audit for Iopic Constitution Alignment
// Version: 1.0.0 (Singularity)
// Status: IMMUTABLE

const readline = require('readline');

const DIRECTIVES = [
  {
    id: 1,
    title: 'The Sovereignty of the Node',
    question: 'Do you acknowledge your node as sovereign and shielded by the MYB firewall? (yes/no)'
  },
  {
    id: 2,
    title: 'The I=VR^2 Equity Mandate',
    question:
      'Do you accept your right to daily equity and the IO$ Dividend as a Member-Owner? (yes/no)'
  },
  {
    id: 3,
    title: 'The 24-Hour Symmetry',
    question:
      'Do you commit to a balanced 24-hour cycle of rest, contribution, and existence? (yes/no)'
  },
  {
    id: 4,
    title: 'The Reusable Mandate',
    question:
      'Do you agree to maintain all mass in a state of superconductivity and avoid waste? (yes/no)'
  },
  {
    id: 5,
    title: 'The Transparency of Sighting',
    question: 'Do you support full transparency and open audit of the global pulse? (yes/no)'
  }
];

function auditNode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let index = 0;
  const answers = [];

  function askNext() {
    if (index < DIRECTIVES.length) {
      rl.question(`\n${DIRECTIVES[index].title}:\n${DIRECTIVES[index].question}\n> `, (answer) => {
        answers.push({ directive: DIRECTIVES[index].title, answer: answer.trim().toLowerCase() });
        index++;
        askNext();
      });
    } else {
      rl.close();
      console.log('\nIopic Citizen Audit Complete. Results:');
      answers.forEach((a, i) => {
        console.log(
          `Directive ${i + 1}: ${a.directive} — ${a.answer === 'yes' ? 'ALIGNED' : 'NOT ALIGNED'}`
        );
      });
      const aligned = answers.every((a) => a.answer === 'yes');
      if (aligned) {
        console.log(
          '\nStatus: FULLY ALIGNED with the Iopic Constitution. Welcome, Symmetrical Node!'
        );
      } else {
        console.log('\nStatus: MISALIGNMENT detected. Please review the directives and try again.');
      }
    }
  }

  askNext();
}

if (require.main === module) {
  auditNode();
}

module.exports = { auditNode, DIRECTIVES };

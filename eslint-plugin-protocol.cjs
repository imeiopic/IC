/**
 * c:\IO\IC\eslint-plugin-protocol.cjs
 * 
 * Custom ESLint plugin for the Iopic Protocol.
 * This provides specialized rules for validating .protocol file substrates.
 */
module.exports = {
  rules: {
    'valid-import-protocol': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce correct import-protocol syntax.',
          category: 'Possible Errors',
          recommended: true,
        },
        fixable: 'code',
        schema: [
          {
            type: 'object',
            properties: {
              quote: {
                enum: ['single', 'double'],
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const options = context.options[0] || {};
        const quoteStyle = options.quote || 'double';
        const q = quoteStyle === 'single' ? "'" : '"';

        return {
          Program(node) {
            const sourceCode = context.getSourceCode();
            const lines = sourceCode.text.split(/\r?\n/);

            lines.forEach((line, index) => {
              // 1. Identify lines attempting to use the protocol import
              if (line.includes('import-protocol') && !/^\s*\/\//.test(line)) {
                // 2. Validate against the Iopic standard: import-protocol: "package" (Strict Spacing and Configurable Quotes)
                const strictRegex = new RegExp(`import-protocol: ${q}([^${q}]+)${q}`);
                if (!strictRegex.test(line)) {
                  const malformedRegex = /(import-protocol:)\s*["']([^"']+)["']/;
                  const fixMatch = line.match(malformedRegex);

                  context.report({
                    node,
                    loc: { line: index + 1, column: line.indexOf('import-protocol') },
                    message: `Iopic Protocol Error: Malformed import. Use: import-protocol: ${q}package-name${q}`,
                    fix(fixer) {
                      if (fixMatch) {
                        const startOfLine = sourceCode.getIndexFromLoc({ line: index + 1, column: 0 });
                        const rangeStart = startOfLine + fixMatch.index;
                        const rangeEnd = rangeStart + fixMatch[0].length;
                        return fixer.replaceTextRange([rangeStart, rangeEnd], `${fixMatch[1]} ${q}${fixMatch[2]}${q}`);
                      }
                      return null;
                    }
                  });
                }
              }
            });
          },
        };
      },
    },
    'valid-protocol-id': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce hexadecimal format for protocol IDs.',
          category: 'Possible Errors',
          recommended: true,
        },
        fixable: 'code',
        schema: [
          {
            type: 'object',
            properties: {
              length: {
                type: 'integer',
                minimum: 1,
              },
              envPrefix: {
                type: 'string',
              },
              decDefaultPrefix: {
                type: 'string',
              },
              maxDefaultLength: {
                type: 'integer',
                minimum: 1,
              },
              enforceSafeInteger: {
                type: 'boolean',
              },
              enforceEvenDecimal: {
                type: 'boolean',
              },
              enforcePrime: {
                type: 'boolean',
              },
              maxPrimeCheck: {
                type: 'integer',
                minimum: 1,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const options = context.options[0] || {};

        const isPrime = (num) => {
          if (num <= 1n) return false;
          if (num <= 3n) return true;
          if (num % 2n === 0n || num % 3n === 0n) return false;
          for (let i = 5n; i * i <= num; i += 6n) {
            if (num % i === 0n || num % (i + 2n) === 0n) return false;
          }
          return true;
        };

        const isPerfectSquare = (n) => {
          if (n < 0n) return false;
          const s = n.sqrt(); // BigInt.prototype.sqrt() is a Stage 3 proposal
          // Fallback for older Node.js versions or if BigInt.prototype.sqrt() is not available
          if (typeof s === 'undefined') {
            const num = Number(n);
            if (num < 0) return false;
            const root = Math.round(Math.sqrt(num));
            return BigInt(root * root) === n;
          }
          return s * s === n;
        };

        const isFibonacci = (num) => {
          if (num === 0n || num === 1n) return true;
          return isPerfectSquare(5n * num * num + 4n) || isPerfectSquare(5n * num * num - 4n);
        };

        let min = 8;
        let max = 8;
        const envPrefix = options.envPrefix || '';
        const maxDefault = options.maxDefaultLength;
        const decDefaultPrefix = options.decDefaultPrefix || '';

        // Logic Sovereignty: Define patterns for strictly positive decimal and hex defaults
        const maxPrimeCheck = BigInt(options.maxPrimeCheck || Number.MAX_SAFE_INTEGER);
        const enforceFibonacci = options.enforceFibonacci || false;
        const enforcePrime = options.enforcePrime || false;
        const enforceEvenDecimal = options.enforceEvenDecimal || false;
        const enforceSafeInteger = options.enforceSafeInteger || false;
        let decDefaultPattern = `[1-9][0-9]*`;
        let hexDefaultPattern = `0x(?:[0-9a-f]{2})+`;

        if (maxDefault !== undefined && maxDefault !== null) {
          const remainingDec = Math.max(1, maxDefault - decDefaultPrefix.length);
          decDefaultPattern = remainingDec === 1 ? `[1-9]` : `[1-9][0-9]{0,${remainingDec - 1}}`;

          const maxPairs = Math.max(0, Math.floor(maxDefault / 2)); // Ensure non-negative
          hexDefaultPattern = maxPairs < 1 ? `$.` : `0x(?:[0-9a-f]{2}){1,${maxPairs}}`;
        }

        if (options.length !== undefined && options.length !== null) {
          min = max = options.length;
        } else if (options.minLength !== undefined || options.maxLength !== undefined) {
          min = options.minLength !== undefined ? options.minLength : 1;
          max = options.maxLength !== undefined ? options.maxLength : ''; // Empty string for unbound max
        }

        // Quantifier for the 'rest' of the string (after the first digit for decimal, or after 0x for hex)
        const restQuantifier = min === max
          ? `{${Math.max(0, min - 1)}}` 
          : `{${Math.max(0, min - 1)},${max ? Math.max(0, max - 1) : ''}}`;

        return {
          Program(node) {
            const sourceCode = context.getSourceCode();
            const lines = sourceCode.text.split(/\r?\n/);
            const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
            const minSafe = BigInt(Number.MIN_SAFE_INTEGER);

            lines.forEach((line, index) => {
              // 1. Identify lines attempting to define a protocol ID, ignoring comments
              if (line.includes('protocol-id:') && !/^\s*\/\//.test(line)) {
                // 2. Validate against the Iopic standard (Hex, Decimal, or strictly-contained Env Var with optional default)
                const hexRegex = new RegExp(`protocol-id:\\s*0x[0-9a-fA-F]${restQuantifier}\\s*;?\\s*$`, 'i'); // Hex IDs (case-insensitive for hardcoded)
                const decRegex = new RegExp(`protocol-id:\\s*([1-9][0-9]${restQuantifier})\\s*;?\\s*$`); // Positive Decimal IDs
                const envRegex = new RegExp(`protocol-id:\\s*(process\\.env\\.${envPrefix}[A-Z0-9_]+|import\\.meta\\.env\\.${envPrefix}[A-Z0-9_]+|\\$${envPrefix}[A-Z0-9_]+|\\\`\\\$\\{(?:process\\.env|import\\.meta\\.env)\\.${envPrefix}[A-Z0-9_]+(?:\\s*\\|\\|\\s*(?:'${hexDefaultPattern}'|"${hexDefaultPattern}"|'${decDefaultPrefix}${decDefaultPattern}'|"${decDefaultPrefix}${decDefaultPattern}"))?\}\\\`)\\s*;?\\s*$`);

                let isValidFormat = false;
                let isDecimalMatch = false;
                let matchedDecimalValue = '';

                if (hexRegex.test(line)) {
                  isValidFormat = true;
                } else if (decRegex.test(line)) {
                  isValidFormat = true;
                  isDecimalMatch = true;
                  matchedDecimalValue = line.match(decRegex)[1]; // Extract the captured decimal number
                } else if (envRegex.test(line)) {
                  isValidFormat = true;
                }

                if (!isValidFormat) {
                  const fixableRegex = new RegExp(`(protocol-id:\\s*)([0-9a-fA-F]${restQuantifier})(;?)`);
                  const fixMatch = line.match(fixableRegex);

                  const rangeStr = min === max 
                    ? `${min}` 
                    : (max ? `${min} to ${max}` : `at least ${min}`);
                  const envMsg = envPrefix ? ` (prefixed with ${envPrefix})` : '';
                  const defMsg = maxDefault ? ` not exceeding ${maxDefault} chars` : '';

                  context.report({
                    node,
                    loc: { line: index + 1, column: line.indexOf('protocol-id:') },
                    message: `Iopic Protocol Error: Protocol IDs must be a ${rangeStr}-character positive decimal, hexadecimal (0x...), or a template literal containing ONLY an environment variable (with optional hex or prefixed positive decimal default value${defMsg})${envMsg}.`,
                    fix(fixer) {
                      // Only auto-fix if it contains hex letters, suggesting it was intended as hex
                      if (fixMatch && /[a-fA-F]/.test(fixMatch[2])) {
                        const startOfLine = sourceCode.getIndexFromLoc({ line: index + 1, column: 0 });
                        const valueStartColumn = line.indexOf('protocol-id:') + fixMatch[1].length;
                        const fixIndex = startOfLine + valueStartColumn;
                        return fixer.insertTextBeforeRange([fixIndex, fixIndex], '0x');
                      }
                      return null;
                    }
                  });
                } else if ((enforceSafeInteger || enforceEvenDecimal || enforcePrime) && isDecimalMatch) {
                  // Perform safe integer check for decimal IDs
                  try {
                    const num = BigInt(matchedDecimalValue);
                    if (num > maxSafe || num < minSafe || num <= 0n) {
                      context.report({
                        node,
                        loc: { line: index + 1, column: line.indexOf('protocol-id:') },
                        message: `Iopic Protocol Error: Decimal ID "${matchedDecimalValue}" must be positive and within JavaScript's safe integer range.`,
                      });
                    }
                  } catch (e) {
                    // Should not happen if regex already validated it as a number
                    context.report({
                      node,
                      loc: { line: index + 1, column: line.indexOf('protocol-id:') },
                      message: `Iopic Protocol Error: Failed to parse decimal ID "${matchedDecimalValue}" for safe integer check.`,
                    });
                  }
                }
              }
            });
          },
        };
      },
    },
  },
};
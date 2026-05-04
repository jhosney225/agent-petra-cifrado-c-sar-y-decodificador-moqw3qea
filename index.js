
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Caesar cipher functions
function caesarEncrypt(text, shift) {
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);
      } else if (/[A-Z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
      }
      return char;
    })
    .join("");
}

function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, (26 - shift) % 26);
}

function bruteForceDecrypt(text) {
  const results = [];
  for (let i = 0; i < 26; i++) {
    results.push({
      shift: i,
      text: caesarDecrypt(text, i),
    });
  }
  return results;
}

// Claude-based analysis
async function analyzeWithClaude(text, isEncrypted = false) {
  const prompt = isEncrypted
    ? `Analyze this potentially Caesar-cipher encrypted text and provide insights about what the original message might be: "${text}". Consider common English words and patterns.`
    : `Analyze this text and provide insights about its content and context: "${text}"`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

// Interactive menu
async function runInteractiveMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log("\n=== Caesar Cipher Tool with Claude AI ===\n");
  console.log("1. Encrypt text with Caesar cipher");
  console.log("2. Decrypt text with Caesar cipher (known shift)");
  console.log("3. Brute force decrypt (try all shifts)");
  console.log("4. Analyze encrypted text with Claude AI");
  console.log("5. Analyze plain text with Claude AI");
  console.log("6. Demo mode (show all features)");
  console.log("7. Exit\n");

  let running = true;

  while (running) {
    const choice = await question("Choose an option (1-7): ");

    switch (choice) {
      case "1": {
        const text = await question("Enter text to encrypt: ");
        const shift = parseInt(await question("Enter shift value (1-25): "));

        if (isNaN(shift) || shift < 1 || shift > 25) {
          console.log("Invalid shift value. Please use 1-25.\n");
          break;
        }

        const encrypted = caesarEncrypt(text, shift);
        console.log(`\nOriginal: ${text}`);
        console.log(`Encrypted (shift ${shift}): ${encrypted}\n`);
        break;
      }

      case "2": {
        const text = await question("Enter encrypted text: ");
        const shift = parseInt(await question("Enter shift value used: "));

        if (isNaN(shift) || shift < 1 || shift > 25) {
          console.log("Invalid shift value. Please use 1-25.\n");
          break;
        }

        const decrypted = caesarDecrypt(text, shift);
        console.log(`\nEncrypted: ${text}`);
        console.log(`Decrypted (shift ${shift}): ${decrypted}\n`);
        break;
      }

      case "3": {
        const text = await question("Enter encrypted text: ");
        const results = bruteForceDecrypt(text);

        console.log("\nAll possible decryptions:\n");
        results.forEach((result) => {
          console.log(`Shift ${result.shift}: ${result.text}`);
        });
        console.log();
        break;
      }

      case "4": {
        const text = await question("Enter encrypted text to analyze: ");
        console.log("\nAnalyzing with Claude AI...\n");

        const analysis = await analyzeWithClaude(text, true);
        console.log("Claude's Analysis:\n");
        console.log(analysis);
        console.log();
        break;
      }

      case "5": {
        const text = await question("Enter text to analyze: ");
        console.log("\nAnalyzing with Claude AI...\n");

        const analysis = await analyzeWithClaude(text, false);
        console.log("Claude's Analysis:\n");
        console.log(analysis);
        console.log();
        break;
      }

      case "6": {
        console.log("\n=== DEMO MODE ===\n");

        // Demo 1: Encrypt
        const demoText = "Hello World";
        const demoShift = 3;
        const encrypted = caesarEncrypt(demoText, demoShift);
        console.log(`1. Encryption demo:`);
        console.log(`   Original: "${demoText}"`);
        console.log(`   Encrypted (shift ${demoShift}): "${encrypted}"\n`);

        // Demo 2: Decrypt with known shift
        const decrypted = caesarDecrypt(encrypted, demoShift);
        console.log(`2. Decryption demo (known shift):`);
        console.log(`   Encrypted: "${encrypted}"`);
        console.log(`   Decrypted: "${
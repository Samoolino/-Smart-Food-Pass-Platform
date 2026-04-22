import fs from 'fs';
import path from 'path';

const root = process.cwd();
const sourceAbiPath = path.join(root, 'abi', 'SmartFoodPass.json');
const targetAbiDir = path.join(root, '..', '..', '..', 'services', 'legacy-backend', 'src', 'blockchain', 'abi');
const targetAbiPath = path.join(targetAbiDir, 'smart-food-pass.abi.json');

function run() {
  if (!fs.existsSync(sourceAbiPath)) {
    throw new Error(`ABI source file not found at ${sourceAbiPath}`);
  }

  fs.mkdirSync(targetAbiDir, { recursive: true });
  const abi = fs.readFileSync(sourceAbiPath, 'utf-8');
  fs.writeFileSync(targetAbiPath, abi);

  console.log(`ABI exported to ${targetAbiPath}`);
}

run();

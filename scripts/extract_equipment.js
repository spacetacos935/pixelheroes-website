import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { exec } from 'child_process';

const args = process.argv.slice(2);
if (args.legnth === 0) {
	console.log('[ERROR] Required equipment type');
}

const directory = `equipments/${args[0]}`;
console.log(`[INFO] Listing files in ${directory}`);

const files = readdirSync(directory);

const output = `output/${args[0]}`;
if (!existsSync(output)) {
	mkdirSync(output);
}
console.log(`[INFO] Outputting to directory ${output}`);

for (const file of files) {
	console.log(`[INFO] Extracting region from image ${file}`);
	exec(`magick -extract 130x130+484+299 ${directory}/${file} ${output}/${file}`);
}

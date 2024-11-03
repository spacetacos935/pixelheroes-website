import { readdirSync } from 'node:fs';

const args = process.argv.slice(2);
if (args.legnth === 0) {
	console.log('[ERROR] Required equipment type');
}

const directory = `../static/images/equipments/${args[0]}`;
console.log(`[INFO] Listing files in ${directory}`);

function toTitleCase(str) {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

const data = [];
for (const file of readdirSync(directory)) {
	data.push({ name: toTitleCase(file.replace(/_/g, ' ').replace('.png', '')), type: args[0] });
}

console.log(JSON.stringify(data, null, 4));

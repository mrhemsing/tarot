import { mkdir, writeFile } from 'node:fs/promises';

const base = 'https://steve-p.org/cards/small/';
const files = [];
for (let i = 0; i <= 21; i++) files.push(`sm_RWSa-T-${String(i).padStart(2, '0')}.webp`);
for (const suit of ['P', 'W', 'C', 'S']) {
  for (const rank of ['0A', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'J1', 'J2', 'QU', 'KI']) {
    files.push(`sm_RWSa-${suit}-${rank}.webp`);
  }
}

await mkdir('public/rws', { recursive: true });
for (const file of files) {
  const res = await fetch(base + file);
  if (!res.ok) throw new Error(`${res.status} ${file}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(`public/rws/${file}`, buf);
  console.log(file, buf.length);
}
console.log(`Downloaded ${files.length} RWS card images.`);

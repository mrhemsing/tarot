const html = await fetch('https://steve-p.org/cards/RWSa.html').then(r => r.text());
const imgs = [...html.matchAll(/<img[^>]*class="[^"]*partofdeck[^"]*"[^>]*src="([^"]+)"/g)].map(m => m[1]);
console.log(imgs.length);
console.log(imgs.join('\n'));

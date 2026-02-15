
const urls = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=1920&q=80"
];

async function checkUrls() {
    for (let i = 0; i < urls.length; i++) {
        try {
            const response = await fetch(urls[i], { method: 'HEAD' });
            console.log(`Banner ${i + 1}: ${response.status} ${response.statusText}`);
        } catch (e) {
            console.error(`Banner ${i + 1} Failed:`, e.message);
        }
    }
}

checkUrls();

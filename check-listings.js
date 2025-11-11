const fs = require('fs');
const data = JSON.parse(fs.readFileSync(0, 'utf-8'));

console.log(`Total: ${data.total} items\n`);
data.items.forEach((x, i) => {
  console.log(`${i + 1}. ${x.title || 'SIN TITULO'}`);
  console.log(`   Imágenes: ${x.images?.length || 0}`);
  console.log(`   Precio: ${x.currency} ${x.price}`);
  console.log(`   Location: ${x.location || 'N/A'}`);
  console.log('');
});

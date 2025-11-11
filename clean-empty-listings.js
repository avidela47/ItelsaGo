// Script para eliminar listings sin imágenes
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

async function cleanEmptyListings() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Conectado a MongoDB');

    const Listing = mongoose.model('Listing', new mongoose.Schema({}, { strict: false }));

    // Buscar listings sin imágenes o con array vacío
    const empty = await Listing.find({
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } },
        { 'images.0': { $exists: false } },
        { 'images.0': '' }
      ]
    });

    console.log(`\nEncontrados ${empty.length} listings sin imágenes:`);
    empty.forEach((doc, i) => {
      console.log(`  ${i + 1}. ${doc.title} (ID: ${doc._id})`);
    });

    if (empty.length > 0) {
      const result = await Listing.deleteMany({
        _id: { $in: empty.map(d => d._id) }
      });
      console.log(`\n✓ Eliminados ${result.deletedCount} listings`);
    } else {
      console.log('\n✓ No hay listings sin imágenes');
    }

    await mongoose.disconnect();
    console.log('✓ Desconectado de MongoDB');
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

cleanEmptyListings();

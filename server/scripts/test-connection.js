/**
 * Rode: node scripts/test-connection.js
 * (de dentro da pasta server, ou: node server/scripts/test-connection.js da raiz)
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI_STANDARD || process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('URI (sem senha):', uri ? uri.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
console.log('');

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('OK - Conectou!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('ERRO:', err.message);
    console.error('');
    if (err.message.includes('whitelist') || err.message.includes('IP')) {
      console.error('>>> Solução: No Atlas, vá em Network Access e adicione 0.0.0.0/0 (Allow from anywhere).');
    }
    if (err.message.includes('auth failed') || err.message.includes('Authentication')) {
      console.error('>>> Solução: Confira usuário e senha no Atlas (Database Access).');
    }
    process.exit(1);
  });

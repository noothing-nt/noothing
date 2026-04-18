require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      console.log('⚠️  Admin account already exists. Exiting.');
      process.exit(0);
    }

    const admin = await User.create({
      username:      'admin',
      password:      process.env.ADMIN_SECRET || 'Admin@12345!',
      role:          'admin',
      acceptedTerms: true,
      isSearchable:  false,
      showLastSeen:  false,
      email:         process.env.ADMIN_EMAIL || undefined,
    });

    console.log('');
    console.log('🔐 ─────────────────────────────────────────');
    console.log('   Admin account created successfully!');
    console.log(`   Username : @${admin.username}`);
    console.log(`   Role     : ${admin.role}`);
    console.log(`   Panel    : /admin-matrix`);
    console.log('   ⚠️  Change the default password immediately!');
    console.log('🔐 ─────────────────────────────────────────');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
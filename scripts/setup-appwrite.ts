/**
 * APPWRITE DATABASE SETUP SCRIPT
 * ================================
 * Run this script once to configure your Appwrite database.
 * Execute via: npx ts-node scripts/setup-appwrite.ts
 *
 * Prerequisites:
 * 1. Create an Appwrite project at https://cloud.appwrite.io
 * 2. Create a database and note its ID
 * 3. Set environment variables or update the config below
 */

import { Client, Databases, IndexType } from 'node-appwrite';

// ─── Configuration ────────────────────────────────────────────────────────────

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'YOUR_PROJECT_ID';
const API_KEY = process.env.APPWRITE_API_KEY || 'YOUR_SERVER_API_KEY';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'YOUR_DATABASE_ID';

// ─── Client Setup ─────────────────────────────────────────────────────────────

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const db = new Databases(client);

// ─── Collection Schemas ───────────────────────────────────────────────────────

async function createVillagesCollection() {
  console.log('Creating villages collection...');

  await db.createCollection(DATABASE_ID, 'villages', 'villages');

  await db.createStringAttribute(DATABASE_ID, 'villages', 'name', 255, true);
  await db.createStringAttribute(DATABASE_ID, 'villages', 'description', 1000, false);
  await db.createUrlAttribute(DATABASE_ID, 'villages', 'coverImageUrl', false);
  await db.createIntegerAttribute(DATABASE_ID, 'villages', 'totalFamilies', false, 0);
  await db.createIntegerAttribute(DATABASE_ID, 'villages', 'totalMembers', false, 0);

  // Indexes
  await db.createIndex(DATABASE_ID, 'villages', 'name_search', IndexType.Fulltext, ['name']);

  console.log('✅ villages collection created');
}

async function createFamiliesCollection() {
  console.log('Creating families collection...');

  await db.createCollection(DATABASE_ID, 'families', 'families');

  await db.createStringAttribute(DATABASE_ID, 'families', 'villageId', 255, true);
  await db.createStringAttribute(DATABASE_ID, 'families', 'villageName', 255, true);
  await db.createStringAttribute(DATABASE_ID, 'families', 'headName', 255, true);
  await db.createStringAttribute(DATABASE_ID, 'families', 'fatherName', 255, false);
  await db.createStringAttribute(DATABASE_ID, 'families', 'mobile', 15, true);
  await db.createStringAttribute(DATABASE_ID, 'families', 'altMobile', 15, false);
  await db.createStringAttribute(DATABASE_ID, 'families', 'gotra', 100, true);
  await db.createStringAttribute(DATABASE_ID, 'families', 'address', 500, true);
  await db.createUrlAttribute(DATABASE_ID, 'families', 'headImageUrl', false);
  await db.createIntegerAttribute(DATABASE_ID, 'families', 'totalMembers', false, 0);

  // Indexes
  await db.createIndex(DATABASE_ID, 'families', 'villageId_key', IndexType.Key, ['villageId']);
  await db.createIndex(DATABASE_ID, 'families', 'headName_search', IndexType.Fulltext, ['headName']);
  await db.createIndex(DATABASE_ID, 'families', 'mobile_search', IndexType.Fulltext, ['mobile']);
  await db.createIndex(DATABASE_ID, 'families', 'gotra_key', IndexType.Key, ['gotra']);

  console.log('✅ families collection created');
}

async function createMembersCollection() {
  console.log('Creating members collection...');

  await db.createCollection(DATABASE_ID, 'members', 'members');

  await db.createStringAttribute(DATABASE_ID, 'members', 'familyId', 255, true);
  await db.createStringAttribute(DATABASE_ID, 'members', 'name', 255, true);
  await db.createEnumAttribute(DATABASE_ID, 'members', 'relation', [
    'SELF', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER',
    'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'GRANDSON', 'GRANDDAUGHTER',
    'DAUGHTER_IN_LAW', 'SON_IN_LAW', 'UNCLE', 'AUNT', 'OTHER',
  ], true);
  await db.createEnumAttribute(DATABASE_ID, 'members', 'gender', ['MALE', 'FEMALE', 'OTHER'], true);
  await db.createStringAttribute(DATABASE_ID, 'members', 'dateOfBirth', 10, true);
  await db.createStringAttribute(DATABASE_ID, 'members', 'mobile', 15, false);
  await db.createStringAttribute(DATABASE_ID, 'members', 'occupation', 255, false);
  await db.createEnumAttribute(DATABASE_ID, 'members', 'educationType', [
    'SCHOOL', 'COLLEGE', 'GRADUATED', 'WORKING', 'BUSINESS', 'OTHER',
  ], true);
  await db.createEnumAttribute(DATABASE_ID, 'members', 'educationStatus', [
    'STUDYING', 'COMPLETED', 'DROPPED',
  ], false);
  await db.createIntegerAttribute(DATABASE_ID, 'members', 'currentStandard', false, undefined, 1, 12);
  await db.createIntegerAttribute(DATABASE_ID, 'members', 'academicYear', false, undefined, 2000, 2100);
  await db.createStringAttribute(DATABASE_ID, 'members', 'schoolOrCollegeName', 255, false);
  await db.createStringAttribute(DATABASE_ID, 'members', 'degree', 255, false);

  // Indexes
  await db.createIndex(DATABASE_ID, 'members', 'familyId_key', IndexType.Key, ['familyId']);
  await db.createIndex(DATABASE_ID, 'members', 'name_search', IndexType.Fulltext, ['name']);
  await db.createIndex(DATABASE_ID, 'members', 'eduType_key', IndexType.Key, ['educationType', 'educationStatus']);
  await db.createIndex(DATABASE_ID, 'members', 'acadYear_key', IndexType.Key, ['academicYear']);

  console.log('✅ members collection created');
}

async function createAdminsCollection() {
  console.log('Creating admins collection...');

  await db.createCollection(DATABASE_ID, 'admins', 'admins');

  await db.createStringAttribute(DATABASE_ID, 'admins', 'userId', 255, true);
  await db.createStringAttribute(DATABASE_ID, 'admins', 'name', 255, true);
  await db.createStringAttribute(DATABASE_ID, 'admins', 'email', 255, true);
  await db.createStringAttribute(DATABASE_ID, 'admins', 'mobile', 15, true);
  await db.createEnumAttribute(DATABASE_ID, 'admins', 'role', ['SUPER_ADMIN', 'VILLAGE_ADMIN'], true);
  await db.createStringAttribute(DATABASE_ID, 'admins', 'assignedVillageId', 255, false);
  await db.createStringAttribute(DATABASE_ID, 'admins', 'assignedVillageName', 255, false);
  await db.createBooleanAttribute(DATABASE_ID, 'admins', 'isActive', false, true);

  // Indexes
  await db.createIndex(DATABASE_ID, 'admins', 'userId_key', IndexType.Key, ['userId']);
  await db.createIndex(DATABASE_ID, 'admins', 'role_key', IndexType.Key, ['role']);

  console.log('✅ admins collection created');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function setup() {
  console.log('\n🏛️  Gram Parivar — Appwrite Database Setup\n');
  console.log('===========================================\n');

  try {
    await createVillagesCollection();
    await new Promise((r) => setTimeout(r, 1000)); // Rate limit guard

    await createFamiliesCollection();
    await new Promise((r) => setTimeout(r, 1000));

    await createMembersCollection();
    await new Promise((r) => setTimeout(r, 1000));

    await createAdminsCollection();

    console.log('\n✅ All collections created successfully!');
    console.log('\nNext steps:');
    console.log('1. Set collection permissions in Appwrite Console');
    console.log('2. Create your first Super Admin user');
    console.log('3. Add the Super Admin to the admins collection');
    console.log('4. Update .env with your credentials');
    console.log('5. Run: npm start\n');
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Some collections may already exist — that is okay.');
    }
  }
}

setup();

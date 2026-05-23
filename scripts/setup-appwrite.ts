/**
 * APPWRITE DATABASE SETUP SCRIPT (ROBUST & SELF-HEALING)
 * ======================================================
 * Run this script once to configure your Appwrite database.
 * Execute via: npx tsx scripts/setup-appwrite.ts
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

// ─── Configuration & .env loader ────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
} catch (e) {}

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'YOUR_PROJECT_ID';
const API_KEY = process.env.APPWRITE_API_KEY || 'YOUR_SERVER_API_KEY';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'YOUR_DATABASE_ID';

// ─── Client Setup ─────────────────────────────────────────────────────────────

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const db = new Databases(client);

const permissions = [
  Permission.read(Role.any()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users()),
];

// Helper for making database updates idempotent (safe to rerun on existing db)
async function safe(label: string, fn: () => Promise<any>) {
  try {
    await fn();
  } catch (error: any) {
    if (
      error.message?.includes('already exists') ||
      error.message?.includes('requested ID')
    ) {
      // Silent skip if the collection/attribute/index already exists
      return;
    }
    console.warn(`⚠️  [${label}] warning:`, error.message);
  }
}

// ─── Collection Schemas ───────────────────────────────────────────────────────

async function createVillagesCollection() {
  console.log('Creating/Updating villages collection...');

  await safe('villages_collection', () => db.createCollection(DATABASE_ID, 'villages', 'villages', permissions));
  await safe('villages_permissions', () => db.updateCollection(DATABASE_ID, 'villages', 'villages', permissions));

  await safe('name', () => db.createStringAttribute(DATABASE_ID, 'villages', 'name', 255, true));
  await safe('description', () => db.createStringAttribute(DATABASE_ID, 'villages', 'description', 1000, false));
  await safe('coverImageUrl', () => db.createUrlAttribute(DATABASE_ID, 'villages', 'coverImageUrl', false));
  await safe('totalFamilies', () => db.createIntegerAttribute(DATABASE_ID, 'villages', 'totalFamilies', false, 0));
  await safe('totalMembers', () => db.createIntegerAttribute(DATABASE_ID, 'villages', 'totalMembers', false, 0));

  // Indexes
  await safe('name_search', () => db.createIndex(DATABASE_ID, 'villages', 'name_search', 'fulltext' as any, ['name']));

  console.log('✅ villages collection configured');
}

async function createFamiliesCollection() {
  console.log('Creating/Updating families collection...');

  await safe('families_collection', () => db.createCollection(DATABASE_ID, 'families', 'families', permissions));
  await safe('families_permissions', () => db.updateCollection(DATABASE_ID, 'families', 'families', permissions));

  await safe('villageId', () => db.createStringAttribute(DATABASE_ID, 'families', 'villageId', 255, true));
  await safe('villageName', () => db.createStringAttribute(DATABASE_ID, 'families', 'villageName', 255, true));
  await safe('headName', () => db.createStringAttribute(DATABASE_ID, 'families', 'headName', 255, true));
  await safe('fatherName', () => db.createStringAttribute(DATABASE_ID, 'families', 'fatherName', 255, false));
  await safe('mobile', () => db.createStringAttribute(DATABASE_ID, 'families', 'mobile', 15, true));
  await safe('altMobile', () => db.createStringAttribute(DATABASE_ID, 'families', 'altMobile', 15, false));
  await safe('gotra', () => db.createStringAttribute(DATABASE_ID, 'families', 'gotra', 100, true));
  await safe('address', () => db.createStringAttribute(DATABASE_ID, 'families', 'address', 500, true));
  await safe('headImageUrl', () => db.createUrlAttribute(DATABASE_ID, 'families', 'headImageUrl', false));
  await safe('totalMembers', () => db.createIntegerAttribute(DATABASE_ID, 'families', 'totalMembers', false, 0));

  // Indexes
  await safe('villageId_key', () => db.createIndex(DATABASE_ID, 'families', 'villageId_key', 'key' as any, ['villageId']));
  await safe('headName_search', () => db.createIndex(DATABASE_ID, 'families', 'headName_search', 'fulltext' as any, ['headName']));
  await safe('mobile_search', () => db.createIndex(DATABASE_ID, 'families', 'mobile_search', 'fulltext' as any, ['mobile']));
  await safe('gotra_key', () => db.createIndex(DATABASE_ID, 'families', 'gotra_key', 'key' as any, ['gotra']));

  console.log('✅ families collection configured');
}

async function createMembersCollection() {
  console.log('Creating/Updating members collection...');

  await safe('members_collection', () => db.createCollection(DATABASE_ID, 'members', 'members', permissions));
  await safe('members_permissions', () => db.updateCollection(DATABASE_ID, 'members', 'members', permissions));

  await safe('familyId', () => db.createStringAttribute(DATABASE_ID, 'members', 'familyId', 255, true));
  await safe('name', () => db.createStringAttribute(DATABASE_ID, 'members', 'name', 255, true));
  await safe('relation', () => db.createEnumAttribute(DATABASE_ID, 'members', 'relation', [
    'SELF', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER',
    'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'GRANDSON', 'GRANDDAUGHTER',
    'DAUGHTER_IN_LAW', 'SON_IN_LAW', 'UNCLE', 'AUNT', 'OTHER',
  ], true));
  await safe('gender', () => db.createEnumAttribute(DATABASE_ID, 'members', 'gender', ['MALE', 'FEMALE', 'OTHER'], true));
  await safe('dateOfBirth', () => db.createStringAttribute(DATABASE_ID, 'members', 'dateOfBirth', 10, true));
  await safe('mobile', () => db.createStringAttribute(DATABASE_ID, 'members', 'mobile', 15, false));
  await safe('occupation', () => db.createStringAttribute(DATABASE_ID, 'members', 'occupation', 255, false));
  await safe('educationType', () => db.createEnumAttribute(DATABASE_ID, 'members', 'educationType', [
    'SCHOOL', 'COLLEGE', 'GRADUATED', 'WORKING', 'BUSINESS', 'OTHER',
  ], true));
  await safe('educationStatus', () => db.createEnumAttribute(DATABASE_ID, 'members', 'educationStatus', [
    'STUDYING', 'COMPLETED', 'DROPPED',
  ], false));
  await safe('currentStandard', () => db.createIntegerAttribute(DATABASE_ID, 'members', 'currentStandard', false, 1, 12, undefined));
  await safe('academicYear', () => db.createIntegerAttribute(DATABASE_ID, 'members', 'academicYear', false, 2000, 2100, undefined));
  await safe('schoolOrCollegeName', () => db.createStringAttribute(DATABASE_ID, 'members', 'schoolOrCollegeName', 255, false));
  await safe('degree', () => db.createStringAttribute(DATABASE_ID, 'members', 'degree', 255, false));

  // Indexes
  await safe('familyId_key', () => db.createIndex(DATABASE_ID, 'members', 'familyId_key', 'key' as any, ['familyId']));
  await safe('name_search', () => db.createIndex(DATABASE_ID, 'members', 'name_search', 'fulltext' as any, ['name']));
  await safe('eduType_key', () => db.createIndex(DATABASE_ID, 'members', 'eduType_key', 'key' as any, ['educationType', 'educationStatus']));
  await safe('acadYear_key', () => db.createIndex(DATABASE_ID, 'members', 'acadYear_key', 'key' as any, ['academicYear']));

  console.log('✅ members collection configured');
}

async function createAdminsCollection() {
  console.log('Creating/Updating admins collection...');

  await safe('admins_collection', () => db.createCollection(DATABASE_ID, 'admins', 'admins', permissions));
  await safe('admins_permissions', () => db.updateCollection(DATABASE_ID, 'admins', 'admins', permissions));

  await safe('userId', () => db.createStringAttribute(DATABASE_ID, 'admins', 'userId', 255, true));
  await safe('name', () => db.createStringAttribute(DATABASE_ID, 'admins', 'name', 255, true));
  await safe('email', () => db.createStringAttribute(DATABASE_ID, 'admins', 'email', 255, true));
  await safe('mobile', () => db.createStringAttribute(DATABASE_ID, 'admins', 'mobile', 15, true));
  await safe('role', () => db.createEnumAttribute(DATABASE_ID, 'admins', 'role', ['SUPER_ADMIN', 'VILLAGE_ADMIN'], true));
  await safe('assignedVillageId', () => db.createStringAttribute(DATABASE_ID, 'admins', 'assignedVillageId', 255, false));
  await safe('assignedVillageName', () => db.createStringAttribute(DATABASE_ID, 'admins', 'assignedVillageName', 255, false));
  await safe('isActive', () => db.createBooleanAttribute(DATABASE_ID, 'admins', 'isActive', false, true));

  // Indexes
  await safe('userId_key', () => db.createIndex(DATABASE_ID, 'admins', 'userId_key', 'key' as any, ['userId']));
  await safe('role_key', () => db.createIndex(DATABASE_ID, 'admins', 'role_key', 'key' as any, ['role']));

  console.log('✅ admins collection configured');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function setup() {
  console.log('\n🏛️  Gram Parivar — Robust Appwrite Database Setup\n');
  console.log('===========================================\n');

  if (!API_KEY || API_KEY === 'YOUR_SERVER_API_KEY') {
    console.error('❌ Error: APPWRITE_API_KEY is not defined!');
    console.error('\nTo configure the collection permissions automatically, please run this script with your Appwrite Server API Key:');
    console.error('  $env:APPWRITE_API_KEY="your-key-here"; npx tsx scripts/setup-appwrite.ts\n');
    return;
  }

  try {
    await createVillagesCollection();
    await new Promise((r) => setTimeout(r, 1000)); // Rate limit guard

    await createFamiliesCollection();
    await new Promise((r) => setTimeout(r, 1000));

    await createMembersCollection();
    await new Promise((r) => setTimeout(r, 1000));

    await createAdminsCollection();

    console.log('\n🏛️  Database Configuration Completed Successfully!');
    console.log('\nNext steps:');
    console.log('1. Set collection permissions in Appwrite Console (Read: any, Create/Update/Delete: users)');
    console.log('2. Create your first Super Admin user in Auth → Users');
    console.log('3. Add that user\'s ID to the "admins" database collection');
    console.log('4. Enjoy your dynamic, live village directory! 🚀\n');
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

setup();

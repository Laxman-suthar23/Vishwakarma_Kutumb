import { Account, Client, Databases, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '@constants/config';

// ─── Appwrite Client ──────────────────────────────────────────────────────────

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export { ID, Query, client };
export default client;

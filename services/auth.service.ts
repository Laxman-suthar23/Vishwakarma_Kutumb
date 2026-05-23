import * as SecureStore from 'expo-secure-store';
import { account, databases, ID, Query } from './appwrite';
import { APPWRITE_CONFIG, STORAGE_KEYS } from '@constants/config';
import type { AppUser, LoginCredentials, UserRole } from '@types/index';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Login with email and password
   */
  async login({ email, password }: LoginCredentials): Promise<AppUser> {
    try {
      // Create email session
      await account.createEmailPasswordSession(email, password);

      // Fetch user profile
      const user = await this.getCurrentUser();
      if (!user) {
        // Clear active session since profile fetch failed
        try {
          await account.deleteSession('current');
        } catch {}
        throw new Error('Failed to find your Admin profile in the database. Please make sure step 3 of the setup is completed.');
      }

      // Persist session token securely
      const session = await account.getSession('current');
      await SecureStore.setItemAsync(STORAGE_KEYS.userSession, session.$id);
      await SecureStore.setItemAsync(STORAGE_KEYS.userProfile, JSON.stringify(user));

      return user;
    } catch (error: any) {
      throw new Error(error?.message || 'Login failed. Please check your credentials.');
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch {
      // Session may already be expired
    } finally {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.userSession);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.userProfile);
    }
  },

  /**
   * Restore session from secure storage
   */
  async restoreSession(): Promise<AppUser | null> {
    try {
      const sessionId = await SecureStore.getItemAsync(STORAGE_KEYS.userSession);
      if (!sessionId) return null;

      // Validate session with Appwrite
      const session = await account.getSession(sessionId);
      if (!session) return null;

      // Try to get from cache first
      const cached = await SecureStore.getItemAsync(STORAGE_KEYS.userProfile);
      if (cached) {
        return JSON.parse(cached) as AppUser;
      }

      return await this.getCurrentUser();
    } catch {
      // Session expired or invalid
      await SecureStore.deleteItemAsync(STORAGE_KEYS.userSession);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.userProfile);
      return null;
    }
  },

  /**
   * Get the current logged-in user with their role
   */
  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const authUser = await account.get();

      // Fetch admin profile from database
      const adminDocs = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.admins,
        [Query.equal('userId', authUser.$id)]
      );

      if (adminDocs.documents.length === 0) {
        return null;
      }

      const adminDoc = adminDocs.documents[0];

      const appUser: AppUser = {
        $id: authUser.$id,
        name: adminDoc.name || authUser.name,
        email: authUser.email,
        mobile: adminDoc.mobile,
        role: adminDoc.role as UserRole,
        assignedVillageId: adminDoc.assignedVillageId,
        assignedVillageName: adminDoc.assignedVillageName,
        createdAt: authUser.$createdAt,
      };

      // Update cache
      await SecureStore.setItemAsync(STORAGE_KEYS.userProfile, JSON.stringify(appUser));

      return appUser;
    } catch {
      return null;
    }
  },

  /**
   * Create a new village admin account (SUPER_ADMIN only)
   */
  async createAdmin(data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    role: UserRole;
    assignedVillageId?: string;
    assignedVillageName?: string;
  }): Promise<void> {
    try {
      // Create auth account
      const authUser = await account.create(
        ID.unique(),
        data.email,
        data.password,
        data.name
      );

      // Create admin document in database
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.admins,
        ID.unique(),
        {
          userId: authUser.$id,
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          role: data.role,
          assignedVillageId: data.assignedVillageId || null,
          assignedVillageName: data.assignedVillageName || null,
          isActive: true,
        }
      );
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create admin account.');
    }
  },

  /**
   * Update admin details
   */
  async updateAdmin(
    adminDocId: string,
    data: Partial<{
      name: string;
      mobile: string;
      assignedVillageId: string;
      assignedVillageName: string;
      isActive: boolean;
    }>
  ): Promise<void> {
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.admins,
      adminDocId,
      data
    );
  },

  /**
   * Delete an admin
   */
  async deleteAdmin(adminDocId: string, userId: string): Promise<void> {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.admins,
      adminDocId
    );
    // Note: Appwrite doesn't allow deleting users via client SDK
    // Use Appwrite server SDK / Functions for full user deletion
  },

  /**
   * List all admins (SUPER_ADMIN only)
   */
  async listAdmins() {
    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.admins,
      [Query.orderDesc('$createdAt')]
    );
    return result.documents;
  },
};

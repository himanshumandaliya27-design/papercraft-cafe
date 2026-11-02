/**
 * Atelier Vélin Universal Data Store
 * Dynamically switches between FirestoreService (production Firebase cloud)
 * and LocalDemoService (local demo simulation) based on environment configuration.
 */

import { isFirebaseConfigured } from './firebase';
import { FirestoreService } from './firestoreService';
import { LocalDemoService } from './localDemoService';
import { DataService } from './dataService';

export const cafeStore: DataService = isFirebaseConfigured
  ? new FirestoreService()
  : new LocalDemoService();

export * from './dataService';
export * from './localDemoService';
export * from './firestoreService';

/**
 * Migration Examples - From Old to New Service Architecture
 * 
 * This file shows examples of how to migrate from the old speService
 * to the new modular service architecture.
 */

// =============================================================================
// BEFORE: Using the old speService (still works!)
// =============================================================================

// Old way - still supported for backward compatibility
import { speService } from '../speService';

async function oldWayExample() {
  // Container operations
  const containers = await speService.getContainers();
  const newContainer = await speService.createContainer({ displayName: 'Test' });
  
  // File operations
  const files = await speService.listFiles(containerId);
  const fileDetails = await speService.getFileDetails(containerId, fileId);
  
  // Upload operations
  await speService.uploadFile(containerId, 'root', file, onProgress);
  
  // Search operations
  const searchResults = await speService.searchFiles(containerId, 'query');
  
  // Recycle bin operations
  const recycleBin = await speService.listRecycleBinItems(containerId);
}

// =============================================================================
// AFTER: Using the new modular services (recommended!)
// =============================================================================

// New way - import only what you need
import { 
  ContainerService, 
  FileService, 
  FileSearchService, 
  RecycleBinService 
} from './services';

async function newWayExample() {
  // Container operations
  const containers = await ContainerService.getContainers();
  const newContainer = await ContainerService.createContainer({ displayName: 'Test' });
  
  // File operations
  const files = await FileService.listFiles(containerId);
  const fileDetails = await FileService.getFileDetails(containerId, fileId);
  
  // Upload operations
  await FileService.uploadFile(containerId, 'root', file, onProgress);
  
  // Search operations
  const searchResults = await FileSearchService.searchFiles(containerId, 'query');
  
  // Recycle bin operations
  const recycleBin = await RecycleBinService.listRecycleBinItems(containerId);
}

// =============================================================================
// MIXED APPROACH: Gradual migration
// =============================================================================

// You can mix old and new approaches during migration
import { speService } from '../speService';  // Legacy for some operations
import { ContainerService } from './services';  // New for others

async function mixedApproach() {
  // Use new service for containers
  const containers = await ContainerService.getContainers();
  
  // Still use legacy for files (migrate later)
  const files = await speService.listFiles(containerId);
}

// =============================================================================
// BENEFITS OF NEW APPROACH
// =============================================================================

/**
 * 1. Tree Shaking - Only import what you use
 */
import { ContainerService } from './services';  // Only container code is bundled

/**
 * 2. Better IDE Support
 */
// ContainerService.  <-- IDE shows only container methods
// FileService.       <-- IDE shows only file methods

/**
 * 3. Easier Testing
 */
import { ContainerService } from './services';
import { GraphApiClient } from './services/shared/graphApiClient';

// Mock just the GraphApiClient for all container tests
jest.mock('./services/shared/graphApiClient');

/**
 * 4. Clear Separation of Concerns
 */
// File operations
import { FileService, FileUploadService, FileSearchService } from './services';

// Container operations  
import { ContainerService, ContainerPermissionsService } from './services';

// Recycle bin operations
import { RecycleBinService } from './services';

/**
 * 5. Individual Service Configuration
 */
// You could add service-specific middleware, caching, etc.
const cachedContainerService = withCache(ContainerService);
const retryableFileService = withRetry(FileService);

// =============================================================================
// MIGRATION CHECKLIST
// =============================================================================

/**
 * For each file that uses speService:
 * 
 * 1. ✅ Identify which operations are used
 * 2. ✅ Import the corresponding new services
 * 3. ✅ Update method calls from speService.method() to ServiceClass.method()
 * 4. ✅ Test thoroughly
 * 5. ✅ Remove old speService import when all methods are migrated
 * 
 * Example:
 * 
 * // Before
 * import { speService } from '../speService';
 * await speService.getContainers();
 * await speService.listFiles(id);
 * 
 * // After  
 * import { ContainerService, FileService } from './services';
 * await ContainerService.getContainers();
 * await FileService.listFiles(id);
 */

export {
  oldWayExample,
  newWayExample,
  mixedApproach
};

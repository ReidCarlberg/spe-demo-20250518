/**
 * Constants for SharePoint Embedded services
 */

// API Endpoints
export const GRAPH_ENDPOINTS = {
  CONTAINERS: 'https://graph.microsoft.com/v1.0/storage/fileStorage/containers',
  CONTAINERS_BETA: 'https://graph.microsoft.com/beta/storage/fileStorage/containers',
  DRIVES: 'https://graph.microsoft.com/v1.0/drives',
  SEARCH: 'https://graph.microsoft.com/v1.0/search/query',
  DIRECTORY_AUDITS: 'https://graph.microsoft.com/v1.0/auditLogs/directoryAudits'
};

// Valid container permission roles
export const CONTAINER_ROLES = ['reader', 'writer', 'manager', 'owner'];

// Valid file sharing roles
export const FILE_SHARING_ROLES = ['read', 'write'];

// File upload constants
export const UPLOAD_CONSTANTS = {
  SMALL_FILE_THRESHOLD: 4 * 1024 * 1024, // 4MB
  CHUNK_SIZE: 4 * 1024 * 1024, // 4MB chunks for large file upload
  OFFICE_FILE_EXTENSIONS: /\.(docx|xlsx|pptx)$/i
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409
};

// Search entity types
export const SEARCH_ENTITY_TYPES = {
  DRIVE_ITEM: 'driveItem',
  LIST_ITEM: 'listItem',
  SITE: 'site'
};

// Common query parameters
export const QUERY_PARAMS = {
  SELECT_CONTAINER: '$select=id,displayName,description,containerTypeId,createdDateTime',
  EXPAND_LIST_ITEM: '$expand=listItem($expand=fields)'
};

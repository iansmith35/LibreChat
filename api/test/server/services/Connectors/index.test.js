const {
  getConnectedServices,
  storeConnectorData,
  getConnectorData,
  removeConnectorData,
  isConnectorConnected,
} = require('~/server/services/Connectors');

describe('Connectors Service', () => {
  const testUserId = 'test-user-123';
  const testUserId2 = 'test-user-456';

  beforeEach(() => {
    // Clean up any existing test data
    removeConnectorData(testUserId, 'google');
    removeConnectorData(testUserId, 'google-cloud');
    removeConnectorData(testUserId2, 'google');
  });

  describe('storeConnectorData', () => {
    it('should store connector data for a user', () => {
      const testData = {
        tokens: {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
        },
        metadata: {
          email: 'test@example.com',
        },
      };

      storeConnectorData(testUserId, 'google', testData);

      const retrieved = getConnectorData(testUserId, 'google');
      expect(retrieved).toBeDefined();
      expect(retrieved.tokens.access_token).toBe(testData.tokens.access_token);
      expect(retrieved.metadata.email).toBe(testData.metadata.email);
      expect(retrieved.connectedAt).toBeDefined();
    });

    it('should store multiple connectors for same user', () => {
      const googleData = { tokens: { access_token: 'google-token' } };
      const gcpData = { serviceAccount: { project_id: 'test-project' } };

      storeConnectorData(testUserId, 'google', googleData);
      storeConnectorData(testUserId, 'google-cloud', gcpData);

      const google = getConnectorData(testUserId, 'google');
      const gcp = getConnectorData(testUserId, 'google-cloud');

      expect(google.tokens.access_token).toBe('google-token');
      expect(gcp.serviceAccount.project_id).toBe('test-project');
    });
  });

  describe('getConnectorData', () => {
    it('should return null for non-existent connector', () => {
      const result = getConnectorData(testUserId, 'non-existent');
      expect(result).toBeNull();
    });

    it('should return connector data when it exists', () => {
      const testData = { tokens: { access_token: 'test' } };
      storeConnectorData(testUserId, 'google', testData);

      const result = getConnectorData(testUserId, 'google');
      expect(result).toBeDefined();
      expect(result.tokens.access_token).toBe('test');
    });
  });

  describe('removeConnectorData', () => {
    it('should remove connector data', () => {
      const testData = { tokens: { access_token: 'test' } };
      storeConnectorData(testUserId, 'google', testData);

      removeConnectorData(testUserId, 'google');

      const result = getConnectorData(testUserId, 'google');
      expect(result).toBeNull();
    });

    it('should not affect other users connectors', () => {
      const testData1 = { tokens: { access_token: 'user1' } };
      const testData2 = { tokens: { access_token: 'user2' } };

      storeConnectorData(testUserId, 'google', testData1);
      storeConnectorData(testUserId2, 'google', testData2);

      removeConnectorData(testUserId, 'google');

      const user1Result = getConnectorData(testUserId, 'google');
      const user2Result = getConnectorData(testUserId2, 'google');

      expect(user1Result).toBeNull();
      expect(user2Result).toBeDefined();
      expect(user2Result.tokens.access_token).toBe('user2');
    });
  });

  describe('isConnectorConnected', () => {
    it('should return false for non-connected connector', () => {
      const result = isConnectorConnected(testUserId, 'google');
      expect(result).toBe(false);
    });

    it('should return true for connected connector', () => {
      const testData = { tokens: { access_token: 'test' } };
      storeConnectorData(testUserId, 'google', testData);

      const result = isConnectorConnected(testUserId, 'google');
      expect(result).toBe(true);
    });
  });

  describe('getConnectedServices', () => {
    it('should return empty array when no connectors', async () => {
      const result = await getConnectedServices('new-user');
      expect(result).toEqual([]);
    });

    it('should return all connected services for a user', async () => {
      const googleData = { 
        tokens: { access_token: 'google-token' },
        metadata: { email: 'test@example.com' },
      };
      const gcpData = { 
        serviceAccount: { project_id: 'test-project' },
        metadata: { projectId: 'test-project' },
      };

      storeConnectorData(testUserId, 'google', googleData);
      storeConnectorData(testUserId, 'google-cloud', gcpData);

      const result = await getConnectedServices(testUserId);

      expect(result).toHaveLength(2);
      expect(result.find(c => c.provider === 'google')).toBeDefined();
      expect(result.find(c => c.provider === 'google-cloud')).toBeDefined();
      
      const googleConnector = result.find(c => c.provider === 'google');
      expect(googleConnector.connected).toBe(true);
      expect(googleConnector.metadata.email).toBe('test@example.com');
    });
  });
});

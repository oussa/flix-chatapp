import { saveMessage, getMessagesByConversation } from './messageService';

// Mock the modules
jest.mock('../drizzle/db', () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn().mockResolvedValue([
          {
            id: 1,
            conversationId: 123,
            content: 'Test message',
            isFromUser: true,
            agentId: null,
            createdAt: new Date()
          }
        ])
      }))
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn().mockResolvedValue([])
      }))
    })),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn().mockResolvedValue([
          {
            id: 1,
            conversationId: 123,
            content: 'Message 1',
            isFromUser: true,
            agentId: null,
            createdAt: new Date()
          },
          {
            id: 2,
            conversationId: 123,
            content: 'Message 2',
            isFromUser: false,
            agentId: 456,
            createdAt: new Date()
          }
        ])
      }))
    }))
  }
}));

jest.mock('../drizzle/schema', () => ({
  messages: {},
  conversations: { id: 'id' }
}));

// Get the mocked modules
const { db } = jest.requireMock('../drizzle/db');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { messages, conversations } = jest.requireMock('../drizzle/schema');

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveMessage', () => {
    it('should save a message and return the formatted message', async () => {
      const messageData = {
        conversationId: 123,
        content: 'Test message',
        isFromUser: true
      };

      const result = await saveMessage(messageData);

      // Verify the insert method was called
      expect(db.insert).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('conversationId', 123);
      expect(result).toHaveProperty('content', 'Test message');
      expect(result).toHaveProperty('isFromUser', true);
      expect(result).toHaveProperty('createdAt');
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(saveMessage({ 
        // @ts-ignore - intentionally missing required props for test
        conversationId: null, 
        content: '', 
        isFromUser: true 
      })).rejects.toThrow('Missing required fields');
    });
  });

  describe('getMessagesByConversation', () => {
    it('should retrieve messages for a conversation', async () => {
      const result = await getMessagesByConversation(123);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[1]).toHaveProperty('id', 2);
    });

    it('should throw an error if conversation ID is not provided', async () => {
      await expect(getMessagesByConversation(0)).rejects.toThrow('Conversation ID is required');
    });
  });
}); 
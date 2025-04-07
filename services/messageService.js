const Message = require('../models/message');

class MessageService {
  static async getMessageById(id) {
    return await Message.findById(id);
  }
  
  static async getMessagesByContactId(contactId, page = 1, pageSize = 50) {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    return await Message.findByContactId(contactId, limit, offset);
  }
  
  static async getRecentConversations(page = 1, pageSize = 50, searchValue = null) {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    
    const [conversations, total] = await Promise.all([
      Message.getRecentConversations(limit, offset, searchValue),
      Message.countRecentConversations(searchValue)
    ]);
    
    return {
      conversations,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }
}

module.exports = MessageService;
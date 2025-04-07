const Contact = require('../models/contact');

class ContactService {
  static async getContactById(id) {
    return await Contact.findById(id);
  }
  
  static async getAllContacts(page = 1, pageSize = 50) {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    return await Contact.findAll(limit, offset);
  }
}

module.exports = ContactService;
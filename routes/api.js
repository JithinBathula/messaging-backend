const express = require('express');
const ContactService = require('../services/contactService');
const MessageService = require('../services/messageService');
const { getPaginationParams } = require('../utils/pagination');

const router = express.Router();

// Get recent conversations (with pagination and optional search)
router.get('/conversations', async (req, res, next) => {
  try {
    const { page, pageSize } = getPaginationParams(req);
    const searchValue = req.query.searchValue || null;
    
    const result = await MessageService.getRecentConversations(page, pageSize, searchValue);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get messages for a specific contact
router.get('/contacts/:contactId/messages', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { page, pageSize } = getPaginationParams(req);
    
    const messages = await MessageService.getMessagesByContactId(contactId, page, pageSize);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Get contact details
router.get('/contacts/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await ContactService.getContactById(contactId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

// Get all contacts (with pagination)
router.get('/contacts', async (req, res, next) => {
  try {
    const { page, pageSize } = getPaginationParams(req);
    const contacts = await ContactService.getAllContacts(page, pageSize);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
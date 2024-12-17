const ContactUs = require("../models/contactUs.model");

class ContactUsRepository {
  async createEmail(emailData) {
    const email = new ContactUs(emailData);
    return await email.save();
  }

  async getAllEmails() {
    return await ContactUs.find({});
  }

  async deleteAllEmails() {
    return await ContactUs.deleteMany({});
  }
}

module.exports = ContactUsRepository;

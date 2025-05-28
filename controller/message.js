const db = require("../config"); // Import the DB connection
const multer = require('multer');
const path = require('path');

// Configure multer storage and file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save uploaded files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name based on timestamp
  }
});

// Initialize multer with the defined storage
const upload = multer({ storage: storage });

class Message {
  
  // Method to send a message
  async messagesend(req, res) {
    const { sender_id, project_id, message_text, message_type } = req.body;
    // Input validation
    if (!sender_id || !message_type) {
      return res.status(400).json({ message: "Sender ID and message type are required" });
    }

    try {
      const voice_note_url = req.file ? req.file.path.replace(/\\/g, "/") : null; // Normalize file path for compatibility
      // console.log(voice_note_url);
      // Insert the message into the database
      const [result] = await db.execute(
        `INSERT INTO messages 
        (sender_id, project_id, message_text, voice_note_url, message_type, timestamp) 
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          sender_id,
          project_id || null,
          message_text || null,
          voice_note_url || null,
          message_type,
        ]
      );

      // Return success response
      res.status(201).json({ message: "Message sent successfully", id: result.insertId });
    } catch (err) {
      console.error("Error sending message: ", err);
      res.status(500).json({ message: "Error sending message" });
    }
  }

  // Method to retrieve messages with optional pagination
  async getmessage(req, res) {
    const { page = 1, limit = 10 } = req.query;  // Default to page 1 and limit 10

    const offset = (page - 1) * limit;  // Calculate the offset

    try {
      // Retrieve messages with pagination
      const [rows] = await db.execute(
        `SELECT messages.*, users.name, CONCAT( LEFT(SUBSTRING_INDEX(users.name, ' ', 1), 1), '', LEFT(SUBSTRING_INDEX(users.name, ' ', -1), 1), '' ) AS initials 
        FROM messages JOIN users ON messages.sender_id = users.userid;`,
        [Number(limit), Number(offset)]
      );
      res.status(200).json(rows);  // Send back an array of messages
    } catch (err) {
      console.error("Error retrieving messages: ", err);
      res.status(500).json({ message: "Error retrieving messages" });
    }
  }
}

module.exports = new Message();

// controllers/HomeController.js
const db = require('../config');  // Import the DB connection
const session = require("express-session");
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

class HomeController {
  // Register a new user
  async registerUser(req, res) {
    const { name, email, phone,expertise,salary, password, userrole } = req.body;
    const user_profile = req.file ? `${req.file.filename}` : null; // Stor relative file path

    try {
        console.log(expertise, salary, user_profile, phone);

        // Check if the user already exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Register the new user with the image path
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, user_role ) VALUES (?, ?, ?, ?)',
            [name, email, password, userrole ]
        );
        if(result)
          {
           await db.execute(
          'INSERT INTO employees (`employ_expertise`, `employ_salary`, `employ_profile`, `employ_phone_no`, `login_id`) VALUES (?, ?, ?, ?,?)',
          [expertise, salary, user_profile, phone,result.insertId ]
          );
          }
      
        res.status(200).json({ msg: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}

  //login user
  async loginuser(req, res) {
    const { email, password } = req.body;
  
    try {
     
      if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
      }
      // Check if the user exists in the database
      const [validateuser] = await db.execute('SELECT * FROM users,employees WHERE email = ? AND password =? and login_id =userid', [email, password]);
  
      if (validateuser.length <= 0) {
        // If no user found, return an error
        return res.status(400).json({ msg: 'User does not exist or invalid credentials' });
      }

      // req.session.cookie.user = { name: validateuser[0].name, userid: validateuser[0].id, userrole: validateuser[0].userrole}
      // req.session.testing = "helloworld";

      // If user found, return the user data (be careful not to expose sensitive data like password)
      console.log(validateuser);
  
      res.status(200).json({ msg: 'User logged in successfully', userdata: validateuser[0] });
    } catch (error) {
      console.error(error);
      // Send back a more detailed error message
      res.status(500).json({ msg: 'Server error', error: error.message, stack: error.stack });    }
  }
  
  //add interruptions
  async addinterruption(req, res) {
    // Destructure name, time, and user_id from the request body
    const { name, time,interrupt_type, user_id } = req.body;

    // Log the user data for debugging
    console.log('Received data:', { name, time, user_id });

    try {
        // Check if the interruption already exists
        const [existingUser] = await db.execute('SELECT * FROM interruptions WHERE interruption_name = ? and developer_id = ?', [name,user_id]);
        if (existingUser.length > 0) {
            return res.status(400).json({ msg: 'Interruption already exists' });
        }

        // Register the new interruption
        const [result] = await db.execute(
            'INSERT INTO interruptions (interruption_name, interruption_time,interruption_type, developer_id) VALUES (?,?,?,?)',
            [name, time,interrupt_type, user_id]
        );

        res.status(201).json({ msg: 'Interruption added successfully', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}


  async getinterruption(req, res) {
    const userid = req.query.userid;
    console.log(userid);
    try {
      const [rows] = await db.execute('SELECT * FROM interruptions where developer_id = ?',[userid]);
      res.json(rows);  // Send back an array of users
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  }

  async updateInterruption(req, res) {
    const { id, field, value } = req.body;
console.log(id,field,value);
    try {
        // Check if the interruption exists
        const [existingInterruption] = await db.execute(
            'SELECT * FROM interruptions WHERE interruption_id = ?',
            [id]
        );
        if (existingInterruption.length === 0) {
            return res.status(404).json({ msg: 'Interruption not found' });
        }

        // Update the interruption
        await db.execute(
            `UPDATE interruptions SET  ${field}= ? WHERE interruption_id = ?`,
            [value, id]
        );

        res.status(200).json({ msg: 'Interruption updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}
  async deleteInterruption(req, res) {
    const {id} = req.body;
    try {
        // Check if the interruption exists
        const [existingInterruption] = await db.execute(
            'SELECT * FROM interruptions WHERE interruption_id = ?',
            [id]
        );

        if (existingInterruption.length === 0) {
            return res.status(404).json({ msg: 'Interruption not found' });
        }

        // Delete the interruption
        await db.execute('DELETE FROM interruptions WHERE interruption_id = ?', [id]);

        res.status(200).json({ msg: 'Interruption deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
  }

    // Get all users
    async getAllUsers(req, res) {
      try {
        const [rows] = await db.execute('SELECT * FROM users');
        res.json(rows);  // Send back an array of users
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
      }
  }
  // Get all owner
  async getowners(req, res) {
    try {
      const [rows] = await db.execute('SELECT * FROM users where user_role=2');
      res.json(rows);  // Send back an array of users
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
   // Get all developer
   async getdeveloper(req, res) {
    try {
      const [rows] = await db.execute('SELECT * FROM users,employees where user_role=3 and employees.login_id = userid');
      res.json(rows);  // Send back an array of users
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
}

module.exports = new HomeController();

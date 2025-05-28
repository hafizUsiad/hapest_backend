// routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const user = require('../controller/user');
const project = require('../controller/project');
const input = require('../controller/input');
const fp = require('../controller/fp');
const msg = require('../controller/message');
const pokerplanning = require('../controller/pokerplanning');
const multer = require('multer');
const path = require('path');

// Configure multer storage and file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio'); // Save uploaded files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name based on timestamp
  }
});
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/user_profile'); // Save uploaded files in the 'uploads' folder 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name based on timestamp
  }
}); 
// Initialize multer with the defined storage
const upload = multer({ storage: storage });
const upload2 = multer({ storage: storage2 });

// Route to register a new user
router.post('/register',upload2.single("user_profile"), user.registerUser);
// Route to get all users
router.get('/users', user.getAllUsers);
router.post('/addinterruption', user.addinterruption);
router.get('/getinterruption', user.getinterruption);
router.post('/updateinterruption', user.updateInterruption);
router.post('/deleteinterruption', user.deleteInterruption);
router.post('/project/:project_id/addprojectinterrupt', project.addproject_interruptions);
router.post('/project/:project_id/removeprojectinterrupt', project.removeproject_interruptions);
router.post('/login', user.loginuser);
router.get('/login', user.loginuser);
router.post('/project/createproject', project.createproject);
router.get('/getowner', user.getowners);
router.get('/project/allprojects', project.allproject );
router.get('/project/devprojects', project.allproject );

router.get('/project/:project_id/team', project.Assigned_Members);
router.post('/project/:project_id/unassignteam', project.UnAssigned_Team);

router.post('/project/:project_id/assigntask', project.assigntask);
router.post('/project/:project_id/unassigntask', project.unassigntask);

router.get('/developers', user.getdeveloper);
router.post('/project/assignteam', project.team);
router.get('/getdeveloper', user.getdeveloper);
router.post('/project/:project_id/insertinput', input.insertinput.bind(input));
router.get('/project/:project_id/getinputs', input.getinputs.bind(input));
router.get('/project/:project_id/getsprints', input.getsprints);
router.get('/project/:project_id/allinputs', input.allinputs);
router.post('/project/:project_id/updateinput', fp.updatecomplexity);
router.post('/project/:project_id/updateinputstatus', fp.updatestatus);
// Add a message
router.post("/project/:project_id/addmessages", upload.single("audio"), msg.messagesend);
router.get("/project/:project_id/getmessages", msg.getmessage);
router.get("/project/:project_id/checkstatus", pokerplanning.checkAllStatus.bind(pokerplanning));
router.get("/project/:project_id/agilestatus", pokerplanning.agilecheck);

router.get("/project/:project_id/fpcalculate", fp.fpcalculate);
router.get("/project/:project_id/fpoutput", pokerplanning.outputvalues);

module.exports = router;

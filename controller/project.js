// controllers/HomeController.js
const db = require('../config');  // Import the DB connection
class ProjectController {
     // Register a new user
  async createproject(req, res) {
    const { name, desc, owner } = req.body;

    try {
      // Register the new user
      const [result] = await db.execute(
        'INSERT INTO project (`project_name`, `project_description`, `project_owner`, `project_createdat`) VALUES (?, ?, ?,NOW())',
        [name, desc, owner]
      );

      res.status(201).json({ msg: 'Project Created successfully', projectid: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
  
  async team(req, res) {
    const { id,developerIds } = req.body;

  console.log("heyyy"+developerIds);

    if (!developerIds || developerIds.length === 0) {
      return res.status(400).json({ msg: 'Please provide project ID and selected developers' });
    }
  
    try {
      // Loop through the developerIds array and insert each developer only if not already assigned
      
        // Check if the developer is already assigned to the project
        console.log(id,developerIds)
        const [existingAssignment] = await db.execute(
          'SELECT * FROM team WHERE project_id = ? AND developer_id = ?',
          [id, developerIds]  // 1 is the static project ID
        );
  
        // If the developer is already assigned, skip the insertion
        if (existingAssignment.length > 0) {
          console.log(`Developer ID ${developerIds} is already assigned to this project.`);
        }
  
        // Insert the developer if not already assigned
        await db.execute(
          'INSERT INTO team (project_id, developer_id) VALUES (?, ?)',
          [id, developerIds]  // 1 is the static project ID
        );
       
       const [assigned] = await db.execute(
        'select * from  team,users where project_id = ? and developer_id = userid',
        [id]  // 1 is the static project ID
      );

      res.json({ msg: 'Team assigned successfully!' ,assigned_developers:assigned});
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error assigning team to project' });
    }
  }
  async Assigned_Members(req, res) {
    const id = req.params.project_id;
    console.log(id);
    try{
      const [assigned] = await db.execute(
        'select * from  team,users where project_id = ? and developer_id = userid',
        [id]  // 1 is the static project ID
      );
  
      res.json({ msg: 'Team Members' ,Team:assigned});
    }catch(error)
    {
      res.status(500).json({ msg: 'Error assigning team to project' ,error});

    }
  
  }

  async UnAssigned_Team(req, res) {
    const id = req.params.project_id;
    const  developerIds  = req.body.developerIds;

    console.log(developerIds);
    try{
      const [assigned] = await db.execute(
        'Delete from team where project_id = ? and developer_id = ?',
        [id,developerIds]  // 1 is the static project ID
      );
  
      res.json({ msg: 'Team Member UnAssigned' ,Team:assigned});
    }catch(error)
    {
      res.status(500).json({ msg: 'Error assigning team to project' ,error});

    }
  
  }
  async allproject(req, res) {
    const { userrole, userid } = req.query;
    console.log(userid,userrole);
    try {
      if(userrole == 3)
        {
          const [rows] = await db.execute(`SELECT DISTINCT project.* FROM project JOIN team ON project.project_id = team.project_id WHERE team.developer_id= ${userid}`);
          res.json(rows);  // Send back an array of users
        }
        else if(userrole == 2)
        {
          const [rows] = await db.execute('SELECT * FROM project,team where project.project_id = team.project_id');
          res.json(rows);  // Send back an array of users
        }else
        {
          const [rows] = await db.execute('SELECT * FROM project');
          res.json(rows);  // Send back an array of users

        }
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
  async addproject_interruptions(req,res)
  {
    const interruptId = Object.keys(req.body)[0];
    const projectId = req.params.project_id; // Get`project_id` from URL parameter

    try{
      console.log(projectId,interruptId);
      const [latest_estimation] = await db.execute(
        'SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1',
        [projectId]
        );
        if(latest_estimation)
          {
            const [existance_check] =  await db.execute(
              'select * from project_interruptions where estimation_id = ? and interruption_id = ?',
              [latest_estimation[0].estimation_id,interruptId]
              );
              if(existance_check.length <= 0)
              {
                await db.execute(
                    'INSERT INTO project_interruptions(interruption_id,estimation_id) VALUES (?,?)',
                    [interruptId,latest_estimation[0].estimation_id]
                );
                res.status(200).json({
                  message: 'All Interruptions saved successfully...!'
              });
               }
           }else{
            res.status(500).json({ msg: 'Something is Happening..!' });

           }
    }catch(error)
    {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }

  }
  async removeproject_interruptions(req,res)
  {
    const interruptId = Object.keys(req.body)[0];
    const projectId = req.params.project_id; // Get `project_id` from URL parameter
    
    try{
      const [latest_estimation] = await db.execute(
        'SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1',
        [projectId]
        );
        if(latest_estimation)
          {
                   const [existance_check] =  await db.execute(
      'select * from project_interruptions where estimation_id = ? and interruption_id = ?',
      [latest_estimation[0].estimation_id,interruptId]
      );
      if(existance_check.length <= 0)
      {
        await db.execute(
            'delete from project_interruptions where estimation_id=? and interruption_id = ?',
            [latest_estimation[0].estimation_id,interruptId]
        );
        res.status(200).json({
          message: 'Interrupt Removed successfully...!'
      });
      }
          }else{
            res.status(500).json({ msg: 'Something is Happening..!' });

           }

    }catch(error)
    {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }

  }
  async assigntask(req,res)
  {
    const developer_id = req.body.developer ;
    const input_id = req.body.inputs;
    const projectId = req.params.project_id; // Get`project_id` from URL parameter

    try{
      const [latest_estimation] = await db.execute(
        'SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1',
        [projectId]
        );
        var [verify_sprint] = await db.execute(
          'select * from sprint where estimation_id = ?  order by sprint_id DESC limit 1',
          [latest_estimation[0].estimation_id]
      );
        if(verify_sprint)
          {
            const [existance_check] =  await db.execute(
              'select * from task where sprint_id = ? and input_id = ? and developer_id=?',
              [verify_sprint[0].sprint_id,input_id,developer_id]
              );
              if(existance_check.length <= 0)
              {
                await db.execute(
                    'INSERT INTO `task`(`sprint_id`, `input_id`, `developer_id`) VALUES (?,?,?)',
                    [verify_sprint[0].sprint_id,input_id,developer_id]
                );
                   console.log(INSERT INTO `task`(`sprint_id`, `input_id`, `developer_id`) VALUES (?,?,?)',
                    [verify_sprint[0].sprint_id,input_id,developer_id]);
                res.status(200).json({
                  message: 'All Task Assigned successfully...!'
              });
               }
           }else{
            res.status(500).json({ msg: 'Something is Happening..!' });

           }
    }catch(error)
    {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }

  }
  async unassigntask(req,res)
  {
    const developer_id = req.body.developer ;
    const input_id = req.body.inputs;
    const projectId = req.params.project_id; // Get `project_id` from URL parameter
    
    try{
      console.log(developer_id,input_id,projectId);
      const [latest_estimation] = await db.execute(
        'SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1',
        [projectId]
        );
        var [verify_sprint] = await db.execute(
          'select * from sprint where estimation_id = ?  order by sprint_id DESC limit 1',
          [latest_estimation[0].estimation_id]
      );
        if(verify_sprint)
          {
            const [existance_check] =  await db.execute(
              'select * from task where sprint_id = ? and input_id = ? and developer_id=?',
              [verify_sprint[0].sprint_id,input_id,developer_id]
              );
              if(existance_check.length > 0)
              {
                await db.execute(
                    'delete from task where sprint_id = ? and input_id = ? and developer_id=?',
                    [verify_sprint[0].sprint_id,input_id,developer_id]
                );
                res.status(200).json({
                  message: 'All Task Assigned successfully...!'
              });
               }
           }else{
            res.status(500).json({ msg: 'Something is Happening..!' });
}
    }catch(error)
    {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }

  }


}
module.exports = new ProjectController();

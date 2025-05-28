const db = require('../config');  // Import the DB connection
const usecasepoints = {
    UC: {
      Simple: 5,
      Average: 10,
      Complex: 15,
    },
  };
  
  function calculateuucp(inputCategory, complexity) {
    // Check if the input category and complexity are valid
    if (!usecasepoints[inputCategory] || !usecasepoints[inputCategory][complexity]) {
      throw new Error('Invalid input category or complexity');
    }
  
    // Return the function points for the given category and complexity
    return usecasepoints[inputCategory][complexity];
  }
class usecase {

    async uc_calculate(project,res,estimation_id) {
        const  project_id = project;
        const  estimationid = estimation_id;

      
        // If project_id is missing in the request body
        // if (!project_id) {
        //   return res.status(400).json({ error: 'Project ID is required' });
        // }
      
        try {
          // Query the MySQL database to get all input categories and complexities for the project
          const [rows] = await db.execute(
            'SELECT input_category, complexity FROM inputs WHERE project_id = ? AND and estimation_id = ? input_category NOT LIKE "%Question%" and input_category  LIKE "%UC%" ',
            [project_id,estimationid]
          );
      
          if (rows.length === 0) {
            return null;
          }
      
          // Initialize a variable to accumulate the total UFP
          let totalUCP = 0;
          let TCF = 0;
          let ECF = 0;
      
          // Loop through each row and calculate the UFP
          for (let i = 0; i < rows.length; i++) {
            var { input_category, complexity } = rows[i];
            var input_category = rows[i].input_category
            // Validate the input category and complexity
            if (!input_category || !complexity) {
              console.error(`Invalid data at index ${i}: input_category or complexity is missing.`);
              continue; // Skip invalid rows
            }
           
           
            else{
                console.log(input_category,complexity);

               // Calculate UFP for this row
            var ucp = calculateuucp(input_category, complexity);
            }
            // Add the UFP for this input to the total UFP
            totalUCP += ucp;
          }
          const [project_check] = await db.execute(
            'SELECT * FROM estimations WHERE estimation_id = ? and estimation_method = "FC"',
            [estimationid]
          );
          if(project_check.length > 0)
          {
            var [project_method] = await db.execute(
              'SELECT sum(complexity) as ucp FROM inputs WHERE project_id = ? AND estimation_id = ? AND input_category NOT LIKE "%Question%"',
              [project_id,estimationid]
            );
            totalUCP += project_method[0]["ucp"];

          }
          const [project_method2] = await db.execute(
            'SELECT sum(complexity) as tcf FROM inputs WHERE project_id = ? AND estimation_id = ?  and input_category like "%Question%"  and input_category LIKE "%TCF%"',
            [project_id,estimationid]
          );
          const [project_method3] = await db.execute(
            'SELECT sum(complexity) as ecf FROM inputs WHERE project_id = ? AND estimation_id = ?  and input_category like "%Question%"  and input_category LIKE "%ECF%"',
            [project_id,estimationid]
          );
        

           TCF += project_method2[0]["tcf"];
           ECF += project_method3[0]["ecf"];
           var Final_TCF = 0.6 + (TCF / 100);
           var Final_ECF = 1.4 + (-0.03 * ECF);

           var UC = totalUCP * Final_ECF * Final_TCF;
           const [avg_effort] = await db.execute('SELECT AVG(Effort_person_month) as avge FROM `fp_historical_data`');
           const [team_members] = await db.execute('SELECT count(team_id) as tt FROM team where project_id = ?',[project_id]);
        //    const [avg_cost] = await db.execute('SELECT AVG(cost) as avgc FROM `fp_historical_data`');
        //    const [avg_fp] = await db.execute('SELECT AVG(FP) as avgf FROM `fp_historical_data`');

           console.log(avg_effort,team_members);
           var Effort = 20 * UC;
           var Time = 20 / team_members[0]["tt"];
           var cost_per_fp = 45000 / UC;
           var cost = cost_per_fp * UC;
           if(UC)
           {
            const [save_ouput] = await db.execute('INSERT INTO `project_estimation`(`project_id`, `estimation_technique`, `effort`, `time`, `cost`) VALUES (?,?,?,?,?)',
              [project_id,estimationid,Effort,Time,cost]);
           }
          // Send the total UFP in the response
      
        } catch (error) {
          console.error('Database error:', error);
        }
      }

}
module.exports = new usecase();
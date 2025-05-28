// controllers/fp.js
const db = require('../config');  // Import the DB connection
const functionPoints = {
    EI: {
      Low: 4,
      Medium: 5,
      High: 7,
    },
    EO: {
      Low: 5,
      Medium: 6,
      High: 7,
    },
    EQ: {
      Low: 3,
      Medium: 4,
      High: 5,
    },
    ILF: {
      Low: 7,
      Medium: 10,
      High: 15,
    },
    EIF: {
      Low: 5,
      Medium: 7,
      High: 10,
    },
  };
  
  function calculateUFP(inputCategory, complexity) {
    // Check if the input category and complexity are valid
    if (!functionPoints[inputCategory] || !functionPoints[inputCategory][complexity]) {
      console.log(inputCategory,complexity);
      throw new Error('Invalid input category or complexity');
    }
    // Return the function points for the given category and complexity
    return functionPoints[inputCategory][complexity];
  }

class fp {

    async updatecomplexity(req, res) {
        const { id, field, value, developer_id } = req.body;  // Get the fields from the request body
        const query = `UPDATE fp_inputss SET ${field} = ? WHERE input_id = ? and developer_id = ?`;
    
        console.log(query, value, id,developer_id); // Log the query to check its structure
        
        try {
            // Try to update the record first
            const [result] = await db.execute(query, [value, id,developer_id]);
            return res.status(200).json({ message: `${field} updated successfully` });
        } catch (err) {
            // Catch any errors during the query execution
            console.error('Error updating field:', err);
            res.status(500).json({ message: 'Error updating field', error: err.message });
        }
    }
    async updatestatus(req, res) {
        const developer_id = req.body;
        const input_id = req.body;

        const projectId = req.params.project_id;
        const query = `UPDATE fp_inputss AS f1 JOIN inputs AS f2 ON f1.input_id = f2.input_id SET f1.status = 'Done' WHERE f2.project_id = ? AND f1.developer_id = ? and f1.input_id =?`;
    
        console.log(query, projectId,developer_id.developer_id,input_id.input_id); // Log the query to check its structure
        
        try {
            // Try to update the record first
            const [result] = await db.execute(query, [projectId,developer_id.developer_id,input_id.input_id]);
            return res.status(200).json({ message: `updated successfully` });

            }
         catch (err) {
            // Catch any errors during the query execution
            console.error('Error updating field:', err);
            res.status(500).json({ message: 'Error updating field', error: err.message });
        }
    }
    async fpcalculate(project,res) {
        const  project_id = project;

      
        // If project_id is missing in the request body
        // if (!project_id) {
        //   return res.status(400).json({ error: 'Project ID is required' });
        // }
      console.log(project_id);
        try {
          const [project_info] = await db.execute(
            `SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1;`,
             [project_id]);
             console.log(project_info[0].estimation_id);
          // Query the MySQL database to get all input categories and complexities for the project
          const [rows] = await db.execute(
            'SELECT input_category, complexity FROM inputs WHERE project_id = ? AND input_category NOT LIKE "%Question%" AND estimation_id = ?',
            [project_id,project_info[0].estimation_id]
          );
      
          if (rows.length === 0) {
            return null;
          }
      
          // Initialize a variable to accumulate the total UFP
          let totalUFP = 0;
          let TF = 0;
      
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
               // Calculate UFP for this row
               if(project_info[0].estimation_method === "PP")
               {
                var ufp = calculateUFP(input_category, complexity);
                // Add the UFP for this input to the total UFP
                totalUFP += ufp;
               }
            }

          }
          const [project_check] = await db.execute(
            'SELECT * FROM estimations WHERE estimation_id = ? and estimation_method = "FC"',
            [project_info[0].estimation_id]
          );
          if(project_check.length > 0)
          {
            var [project_method] = await db.execute(
              'SELECT sum(complexity) as ufp FROM inputs WHERE project_id = ? AND estimation_id = ?  AND input_category NOT LIKE "%Question%"',
              [project_id,project_info[0].estimation_id]
            );
            totalUFP = project_method[0].ufp;

          }
          const [project_method2] = await db.execute(
            'SELECT sum(complexity) as tf FROM inputs WHERE project_id = ? and estimation_id = ? and input_category like "%Question%"',
            [project_id,project_info[0].estimation_id]
          );
          

           TF += project_method2[0]["tf"];
           console.log(TF,totalUFP,CAF);
           var CAF = 0.65 + (0.01 * TF);
           var FP = totalUFP * CAF;
           const [avg_effort] = await db.execute('SELECT AVG(Effort_person_month) as avge FROM `fp_historical_data`');
           const [team_members] = await db.execute('SELECT count(team_id) as tt FROM team where project_id = ?',[project_id]);
           const [avg_cost] = await db.execute('SELECT AVG(cost) as avgc FROM `fp_historical_data`');
           const [avg_fp] = await db.execute('SELECT AVG(FP) as avgf FROM `fp_historical_data`');

           console.log(avg_effort,team_members);
           var Effort = avg_effort[0]["avge"] * FP;
           var Time = avg_effort[0]["avge"] / team_members[0]["tt"];
           var cost_per_fp = avg_cost[0]["avgc"] / avg_fp[0]["avgf"];
           var cost = cost_per_fp * FP;
           console.log(Effort,Time,cost_per_fp,cost,FP);
           if(FP)
           {
            const [save_ouput] = await db.execute('INSERT INTO `project_estimation`(`project_id`, `estimation_technique`, `effort`, `time`, `cost`) VALUES (?,?,?,?,?)',
              [project_id,project_info[0].estimation_id,Effort,Time,cost]);
           }
          // Send the total UFP in the response
      
        } catch (error) {
          console.error('Database error:', error);
        }
      }

     
      
}

module.exports = new fp();
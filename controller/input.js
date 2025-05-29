// controllers/fp.js
const db = require('../config');  // Import the DB connection
const fp_questions = [
    { category: "External Inputs", question: "How many user input screens or transactions exist?" },
    { category: "External Inputs", question: "How many unique data fields are captured through user inputs?" },
    { category: "External Outputs", question: "How many unique reports or outputs are generated?" },
    { category: "External Outputs", question: "How many calculations or processing logic steps are involved in generating outputs?" },
    { category: "External Queries", question: "How many user-initiated inquiries or search transactions are there?" },
    { category: "External Queries", question: "How many different query formats or combinations exist?" },
    { category: "Internal Logical Files", question: "How many internal data tables or files does the system use?" },
    { category: "Internal Logical Files", question: "How many unique data attributes or fields are stored internally?" },
    { category: "External Interface Files", question: "How many external data files or tables does the system interact with?" },
    { category: "External Interface Files", question: "How many distinct records or attributes are exchanged with external files?" },
    { category: "User Interfaces", question: "How many unique screens or forms are provided for user interaction?" },
    { category: "User Interfaces", question: "How many navigation or user control options (e.g., menus, buttons) are offered?" },
    { category: "Error Handling", question: "How many error messages, notifications, or prompts are displayed to the user?" },
    { category: "Data Transformation", question: "How many business rules or data transformations are applied during processing?" },
  ];

  const uc_question = [
    { question: "Does the system require complex internal processing?", category: "TCF" },
    { question: "Is the system heavily distributed?", category: "TCF" },
    { question: "Are performance objectives critical?", category: "TCF" },
    { question: "Will the system be used across multiple platforms?", category: "TCF" },
    { question: "Is the system designed to be highly reusable?", category: "TCF" },
    { question: "Does the system include complex data entry requirements?", category: "TCF" },
    { question: "Does the system require significant user interaction?", category: "TCF" },
    { question: "Are the business rules highly complex?", category: "TCF" },
    { question: "Will the system interface with other applications?", category: "TCF" },
    { question: "Does the system need to support concurrent users or processes?", category: "TCF" },
    { question: "Does the system require advanced security or encryption measures?", category: "TCF" },
    { question: "Does the system require high reliability or uptime?", category: "TCF" },
    { question: "Will the system process large volumes of data?", category: "TCF" },
    { question: "Does the team have prior experience with the development platform?", category: "ECF" },
    { question: "Is the team familiar with the business domain?", category: "ECF" },
    { question: "Are the requirements well-documented and stable?", category: "ECF" },
    { question: "Does the team have access to the required tools and technologies?", category: "ECF" },
    { question: "Is there strong customer involvement throughout the project?", category: "ECF" },
    { question: "Is the project timeline realistic?", category: "ECF" },
    { question: "Are the development resources (e.g., hardware, software) adequate?", category: "ECF" },
    { question: "Does the project have strong management support?", category: "ECF" },
    { question: "Is the development team experienced and skilled?", category: "ECF" },
    { question: "Are there clear and concise communication channels?", category: "ECF" },
    { question: "Are third-party dependencies minimal or manageable?", category: "ECF" },
    { question: "Does the development environment promote efficiency?", category: "ECF" },
    { question: "Are testing and quality assurance processes well-defined?", category: "ECF" }
  ];
  const intermediate_cocomo_questions = [
    { question: "Does the project require high reliability?", category: "RELY" },
    { question: "Is the database size significant?", category: "DATA" },
    { question: "Is the product complexity high?", category: "CPLX" },
    { question: "Does the system require high-performance constraints?", category: "TIME" },
    { question: "Is the system execution time critical?", category: "STOR" },
    { question: "Does the system need to meet strict memory limitations?", category: "VIRT" },
    { question: "Is the system developed for a highly volatile platform?", category: "PVOL" },
    { question: "Will the system be developed using modern programming practices?", category: "MODP" },
    { question: "Does the system involve complex integration with external systems?", category: "RUSE" },
    { question: "Is the software being developed on a multi-site team?", category: "SITE" },
    { question: "Are tools and technologies available for efficient development?", category: "TOOL" },
    { question: "Does the system require high-end security measures?", category: "SCED" },
    { question: "Are the development team members experienced with the used technology?", category: "ACAP" },
    { question: "Is the team experienced with the development tools?", category: "PCAP" },
    { question: "Does the team have previous experience in similar projects?", category: "PCON" }
];
const advanced_cocomo_questions = [
    { question: "Does the system require real-time processing?", category: "TIME" },
    { question: "Is the system highly modular and reusable?", category: "RUSE" },
    { question: "Are the algorithms used in the system complex and computationally intensive?", category: "CPLX" },
    { question: "Does the system need to be compatible with multiple platforms?", category: "PVOL" },
    { question: "Will the project require a large team with diverse skill sets?", category: "TEAM" },
    { question: "Are the requirements prone to frequent changes?", category: "PMAT" },
    { question: "Is there a need for extensive documentation and compliance standards?", category: "DOCU" },
    { question: "Does the system require significant software customization for different clients?", category: "RUSE" },
    { question: "Will the project be subject to stringent government or industry regulations?", category: "SCED" },
    { question: "Does the project involve the development of AI or machine learning models?", category: "CPLX" },
    { question: "Is the system expected to have a long lifecycle with frequent updates?", category: "PVOL" },
    { question: "Are the developers highly skilled in the programming language being used?", category: "LEXP" },
    { question: "Does the project require the use of advanced software tools?", category: "TOOL" },
    { question: "Are hardware constraints a major concern for development?", category: "HARD" },
    { question: "Is there a need for a structured or rigorous testing approach?", category: "TEST" },
    { question: "Does the system need to be developed using a strict software engineering methodology?", category: "SEXP" }
];

class inputController {  // Change class name to FpController (uppercase 'F')
    // async insertinput(req, res) {
    //     const inputs = req.body; // Expecting the payload as the object structure you've shared
    //     const projectId = req.params.project_id; // Get project_id from URL parameter
    //     const selectedOption2 = req.body
    //     const selectedOption = req.body
    //     const selectedweights = req.body;

    //     try {
    //         // Validate that inputs is an object and has categories as keys
    //         if (typeof inputs !== 'object' || inputs === null) {
    //             return res.status(400).json({ message: 'Invalid input format. Expected an object with categories as keys.' });
    //         }
    //         // Fetch all developers associated with the project
    //         const [teamResult] = await db.execute('SELECT developer_id FROM team WHERE project_id = ?', [projectId]);
    //        const [estimation] =  await db.execute(
    //             'UPDATE project SET estimation_technique = ?, method = ? WHERE project_id = ?',
    //             [selectedOption.selectedOption, selectedOption2.selectedOption2, projectId]
    //         );
    //         if(estimation.changedRows > 0)
    //         {
    //             if(selectedOption.selectedOption === "FP" && selectedOption2.selectedOption2 === "PP")
    //                 {
    //                     const [result] = await this.fp_questions(projectId,selectedOption2);
    //                 }
    //         }
                    
    //         if (!teamResult || teamResult.length === 0) {
    //             return res.status(404).json({ message: 'No developers found for this project.' });
    //         }
            
    //         // Transform the inputs object into a flat array
    //         const transformedInputs = [];
    //         for (const category in inputs) {
    //             if (Array.isArray(inputs[category])) {
    //                 inputs[category].forEach((value) => {
    //                     transformedInputs.push({
    //                         category,
    //                         value,
    //                         projectId
    //                     });
    //                 });
    //             }
    //         }

            
    //         // Verify the transformed inputs
    //         console.log('Transformed Inputs:', transformedInputs);
            
    //         // Prepare the queries for both tables
    //         const fpQuery = 'INSERT INTO inputs (input_category, input_name, project_id) VALUES (?, ?, ?)';
    //         const nfpQuery = 'INSERT INTO fp_inputss (input_id, developer_id,spell) VALUES (?, ?,?)';
            
    //         // Insert the inputs into the fp_inputs table
    //         for (const input of transformedInputs) {
    //             // Insert into fp_inputs table (for the project)
    //             const [fpResult] = await db.execute(fpQuery, [input.category, input.value, input.projectId]);
                
    //             console.log('Inserted into fp_inputs:', fpResult);
                
    //             // Insert into nfp_inputss table for each developer in the project
    //             for (const developer of teamResult) {
    //                 // Insert into nfp_inputss table (developer association with input)
    //                 const [nfpResult] = await db.execute(nfpQuery, [fpResult.insertId, developer.developer_id,1]);
    //                 console.log('Inserted into nfp_inputss for developer:', nfpResult);
    //             }
    //         }
    
    //         // Send success response
    //         res.status(200).json({ message: 'All inputs saved successfully in both tables' });
    //     } catch (err) {
    //         console.error('Database Error:', err);
    //         res.status(500).json({ message: 'Error saving inputs', error: err.message });
    //     }
    // }
    async insertinput(req, res) {
        const inputs = req.body.inputs; // Assuming `inputs` is sent as part of the payload
        const projectId = req.params.project_id; // Get `project_id` from URL parameter
        const selectedOption2 = req.body.selectedOption2 || "";
        const selectedOption = req.body.selectedOption || "";
        const selectedweights = req.body.selectedSwitches;
        const secondary_technique = req.body.primary_technique ?? ""; // Assuming `inputs` is sent as part of the payload
        const sprintdays = req.body.sprintdays ?? 0; // Assuming `inputs` is sent as part of the payload
        const teamvelocity = req.body.teamvelocity ?? 0; // Assuming `inputs` is sent as part of the payload

    
        try {
            console.log(inputs);
            // Validate inputs format
            if ((typeof inputs !== 'object' || inputs === null)) {
                console.log(inputs);
                return res.status(400).json({
                    message: 'Invalid input format. Expected an object with categories as keys.'
                });
            }
           
            // Add Estimation for  the project with selected options
            console.log(projectId,selectedOption,secondary_technique, selectedOption2);
            const [verify_estimation] = await db.execute(
                'select * from estimations where project_id = ? and primary_technique_id = ? and secondary_technique_id = ? and estimation_method = ?',
                [projectId,selectedOption,secondary_technique, selectedOption2, ]
            );
            if(verify_estimation.length <= 0)
            {
                
            var [estimation] = await db.execute(
                'INSERT INTO `estimations`(`project_id`, `primary_technique_id`, `secondary_technique_id`, `estimation_method`) VALUES (?,?,?,?)',
                [projectId,selectedOption,secondary_technique, selectedOption2 ]


                );
    
            }

            const [latest_estimation] = await db.execute(
                'SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1',
                [projectId]
            );
            if(selectedOption == "agile")
            {
                var [verify_sprint] = await db.execute(
                    'SELECT * FROM sprint WHERE estimation_id = ? AND status != 'In-progress' ORDER BY sprint_id DESC LIMIT 1;',
                    [latest_estimation[0].estimation_id]
                );
                var [verify_sprint2] = await db.execute(
                    'select * from sprint where estimation_id = ? and status ='In-progress'  order by sprint_id DESC limit 1',
                    [latest_estimation[0].estimation_id]
                );
                if(verify_sprint.length > 0)
                {
                    
                const [sprint] = await db.execute(
                    'INSERT INTO `sprint`(`sprint_no`, `velocity`, `sprint_days`, `Team Count`, `estimation_id`) VALUES (?,?,?,?,?)',
                    [verify_sprint[0].sprint_no+1,teamvelocity,sprintdays, 0, latest_estimation[0].estimation_id]
                    );
        
                }else{
                    if(verify_sprint2.length <= 0)
                    {
                        const [sprint] = await db.execute(
                            'INSERT INTO `sprint`(`sprint_no`, `velocity`, `sprint_days`, `Team Count`, `estimation_id`) VALUES (?,?,?,?,?)',
                            [1,teamvelocity,sprintdays, 0, latest_estimation[0].estimation_id]
                            );       
                    }
                }
            }
           

            if(selectedweights.length > 0)
                {
                    for(const weights in selectedweights)
                    {
                        console.log(weights);
                        const [existance_check] =  await db.execute(
                            'select * from fp_weights where project_id = ? and weight = ? and estimation_id = ?',
                            [projectId,selectedweights[weights],latest_estimation[0].estimation_id]
                        );
                        if(existance_check.length <= 0)
                        {
                        await db.execute(
                            'INSERT INTO `fp_weights`(`weight`, `project_id`,estimation_id) VALUES (?,?,?)',
                            [selectedweights[weights], projectId,latest_estimation[0].estimation_id]
                        );
                        }
                   
                    }
                }
            // Fetch all developers associated with the project
            const [teamResult] = await db.execute(
                'SELECT developer_id FROM team WHERE project_id = ?',
                [projectId]
            );
    
            if (!teamResult || teamResult.length === 0) {
                return res.status(404).json({
                    message: 'No developers found for this project.'
                });
            }
            var [verify_sprint] = await db.execute(
                'select * from sprint where estimation_id = ?  order by sprint_id DESC limit 1',
                [latest_estimation[0].estimation_id]
            );
            // Transform the inputs object into a flat array
            const transformedInputs = [];

            for (const category in inputs) {
                console.log(category);
                if (Array.isArray(inputs[category])) {
                    // Jab input ek array ho
                    inputs[category].forEach(value => {
                        console.log(category, value, projectId);
                        transformedInputs.push({ category, value, projectId });
                    });
                } else if (typeof inputs[category] === 'object' && inputs[category] !== null) {
                    // Jab input ek object ka array ho
                    Object.values(inputs).forEach(item => {
                        if (item.name) {
                            console.log(item.name, projectId);
                            transformedInputs.push({ category: selectedOption, value: item.name, projectId });
                        }
                    });
                }
            }
                        
            const uniqueInputs = transformedInputs.filter(
                (obj, index, self) =>
                  index === self.findIndex((t) => (
                    t.category === obj.category && t.value === obj.value
                  ))
              );
              
              console.log("Unique Inputs:", uniqueInputs);
    
            // Prepare the queries
            const fpQuery = 'INSERT INTO inputs (input_category, input_name, project_id,estimation_id) VALUES (?, ?, ?, ?)';
            const nfpQuery = 'INSERT INTO fp_inputss (input_id, developer_id, spell) VALUES (?, ?, ?)';
    
            // Insert the inputs into the `inputs` table and associate with developers
            for (const input of uniqueInputs) {
                // Insert into `inputs` table
                if(selectedOption == "agile"){
                    if(verify_sprint.length >0)
                    {
                       var sprintvalue = parseInt(verify_sprint[0].sprint_no, 10);
                       console.log(sprintvalue);
                        var [fpResult] = await db.execute(fpQuery, [
                        input.category, 
                        input.value+"("+sprintvalue+")", 
                        input.projectId,
                        latest_estimation[0].estimation_id
                    ]);
                    }else{
                        var [fpResult] = await db.execute(fpQuery, [
                            input.category, 
                            input.value+"(1)", 
                            input.projectId,
                            latest_estimation[0].estimation_id
                        ]);
                    }
                  
                }else{
                      var [fpResult] = await db.execute(fpQuery, [
                    input.category, 
                    input.value, 
                    input.projectId,
                    latest_estimation[0].estimation_id
                ]);
                }
              
    
                console.log('Inserted into inputs:', fpResult);
                if(selectedOption2 == "PP" || selectedOption2 == "FC" || selectedOption == "agile")
                {
                    // Insert into `fp_inputss` table for each developer
                    for (const developer of teamResult) {
                        const [nfpResult] = await db.execute(nfpQuery, [
                            fpResult.insertId, 
                            developer.developer_id, 
                            1 // Assuming `spell` is set to `1`
                        ]);
                        console.log('Inserted into fp_inputss for developer:', nfpResult);
                    }
                }
             
            }
        
                // If project update succeeds, handle FP-specific logic
                
                    if (selectedOption === "FP") {
                        await this.fp_questions(projectId,selectedOption2,fp_questions,latest_estimation[0].estimation_id);
                    }
                    else if(selectedOption === "UC")
                    {
                        await this.fp_questions(projectId,selectedOption2,uc_question,latest_estimation[0].estimation_id);
                    }
                    else if(selectedOption === "c1b" & secondary_technique =="fp")
                    {
                        await this.fp_questions(projectId,selectedOption2,fp_questions,latest_estimation[0].estimation_id);
                    }
                    else if(selectedOption === "c1i" & secondary_technique =="fp")
                    {
                        await this.fp_questions(projectId,selectedOption2,fp_questions,latest_estimation[0].estimation_id);
                        await this.fp_questions(projectId,selectedOption2,intermediate_cocomo_questions,latest_estimation[0].estimation_id);
                    }
                    else if(selectedOption === "c1a" & secondary_technique =="fp")
                    {
                        await this.fp_questions(projectId,selectedOption2,fp_questions,latest_estimation[0].estimation_id);
                        await this.fp_questions(projectId,selectedOption2,intermediate_cocomo_questions,latest_estimation[0].estimation_id);
                        await this.fp_questions(projectId,selectedOption2,advanced_cocomo_questions,latest_estimation[0].estimation_id);
                    }
                
            // Send success response
            res.status(200).json({
                message: 'All inputs saved successfully in both tables'
            });
        } catch (err) {
            console.error('Database Error:', err);
            res.status(500).json({
                message: 'Error saving inputs',
                error: err.message
            });
        }
    }
    
    
    
    async getinputs(req, res) {
        // Access developer_id from query parameters (for GET requests)
        const { developer_id } = req.query; // Should be passed in the query string
        const projectId = req.params.project_id;  // Get project_id from URL parameter
    
        console.log('Project ID:', projectId, 'Developer ID:', developer_id);  // Log project_id and developer_id to verify
    
        // SQL query to get the inputs based on project_id and developer_id
       
        try {
            const [project] = await db.execute('select * from estimations where project_id = ? order by estimation_id desc', [projectId]);
            const query = `
            SELECT fi.*, f.input_name ,f.input_category
            FROM fp_inputss fi
            JOIN inputs f ON fi.input_id = f.input_id
            WHERE f.project_id = ? and f.estimation_id = ?
            AND fi.developer_id = ? AND f.complexity = '' limit 1;
            `;
            // Execute the query to fetch inputs based on projectId and developerId
            if(project.length > 0 )
            {
                const [result] = await db.execute(query, [projectId,project[0].estimation_id, developer_id]);
                const [weights] =  await db.execute(
                    'select * from fp_weights where estimation_id = ?',
                    [project[0].estimation_id]
                );
                if(weights.length > 0)
                {
                    res.status(200).json({ message: 'All inputs are shown', data: result ,projectdetail:project,weights:weights});
                }
                else{
                    res.status(200).json({ message: 'All inputs are shown', data: result ,projectdetail:project});
                }
            }
            // Return the result in the response
        } catch (err) {
            // Handle any errors and return an appropriate error message
            console.error('Database Error:', err);
            res.status(500).json({ message: 'Error showing inputs', error: err.message });
        }
    }
    

    async getsprints(req,res)
    {
        const projectId = req.params.project_id;
        try{
            const [project] = await db.execute('select * from estimations where project_id = ? order by estimation_id desc', [projectId]);
            if(project.length > 0 )
                {
                    const [sprints] = await db.execute("select * from sprint where estimation_id = ?", [project[0].estimation_id]);
                    const [sprints_inputs] = await db.execute("select * from inputs where estimation_id = ?", [project[0].estimation_id]);

                    res.status(200).json({ message: 'All Sprints are shown', data: sprints,data2:sprints_inputs });
                }

        
        }catch(err )
        {
            console.error('Sprit Fetch Error:', err);

            res.status(500).json({ message: 'Error showing inputs', error: err.message });

        }
    }
  // Update a specific field (e.g., priority) of an input by its ID
  async updatecomplexity(req, res) {
    const { id, field, value } = req.body;  // Get the fields from the request body

    // Ensure that the field is a valid column name (for security)
    // const validFields = ['priority', 'status', 'type']; // Add more fields as necessary
    // if (!validFields.includes(field)) {
    //     return res.status(400).json({ message: 'Invalid field name' });
    // }

    const query = `UPDATE fp_inputs SET ${field} = ? WHERE input_id = ?`;
    console.log(query,value,id);

    try {
        const [result] = await db.execute(query, [value, id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: `${field} updated successfully` });
        } else {
            res.status(404).json({ message: 'Input not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating field:', err);
        res.status(500).json({ message: 'Error updating field', error: err.message });
    }
}


    async fp_questions(projectid,method,savingqustion,estimation_id)
    {
        try{
             // Fetch all developers associated with the project
             const [teamResult] = await db.execute('SELECT developer_id FROM team WHERE project_id = ?', [projectid]);
            
             if (!teamResult || teamResult.length === 0) {
                 return res.status(404).json({ message: 'No developers found for this project.' });
             }
                for(const ques of savingqustion)
                {
                     // Prepare the queries for both tables
                    const fpQuery = 'INSERT INTO inputs (input_category, input_name, project_id,estimation_id) VALUES (?, ?,?, ?)';
                    const nfpQuery = 'INSERT INTO fp_inputss (input_id, developer_id,spell) VALUES (?, ?,?)';
                    const [fpResult] = await db.execute(fpQuery, [ques.category+"(Question)", ques.question, projectid,estimation_id]);
                    if(method === "PP")
                    {
                        for (const developer of teamResult) {
                        // Insert into nfp_inputss table (developer association with input)
                        const [nfpResult] = await db.execute(nfpQuery, [fpResult.insertId, developer.developer_id,1]);
                        console.log('Inserted into nfp_inputss for developer:', nfpResult);
                    }
                    }
                    

                }
        }catch(err)
        {
            console.error('Error updating field:', err);
            res.status(500).json({ message: 'Error Gnerating Questions', error: err.message });
    
        }

    }

    async allinputs(req, res) {
        const projectId = req.params.project_id;  // Get project_id from URL parameter

        try {
            const [project] = await db.execute('select * from estimations where project_id = ? order by estimation_id desc', [projectId]);
            if(project.length > 0)
            {
                const [inputs] = await db.execute('select * from inputs where project_id = ? and estimation_id =?', 
                [projectId,project[0].estimation_id]);
                res.status(200).json({ message: 'All inputs are shown', data: inputs });
            }

          
            
        } catch (err) {
            // Handle any errors and return an appropriate error message
            console.error('Database Error:', err);
            res.status(500).json({ message: 'Error showing inputs', error: err.message });
        }
    }
}

module.exports = new inputController();  // Export the class as an instance

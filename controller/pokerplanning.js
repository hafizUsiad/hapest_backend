// const { response } = require('express');
// const db = require('../config'); // Import the DB connection
// const fp  = require('../controller/fp');
// const uc = require("../controller/usecase");
// const cocomo1 = require('./cocomo1');
// class ppController {
//     async checkAllStatus(req, res) {
//         const projectId = req.params.project_id;
//         const id = req.query;

//         console.log('Checking status for Project ID:', projectId);

//         try {
//             const [teamResult] = await db.execute('SELECT developer_id FROM team WHERE project_id = ?', [projectId]);
//             if (!teamResult.length) return res.status(404).json({ message: 'No developers found for this project.' });

//             const [inputsResult] = await db.execute('SELECT input_id FROM inputs WHERE project_id = ?', [projectId]);
//             if (!inputsResult.length) return res.status(404).json({ message: 'No inputs found for this project.' });

//             const developerIds = teamResult.map(d => d.developer_id);
//             const totalInputs = developerIds.length;

//             const [statusResult] = await db.execute(`
//                 SELECT COUNT(status) AS cs
//                 FROM fp_inputss
//                 LEFT JOIN inputs ON inputs.input_id = fp_inputss.input_id
//                 WHERE inputs.project_id = ? AND status = 'done' AND fp_inputss.input_id = ?;
//             `, [projectId, id.id]);

//             const allInputsDone = totalInputs.toString() === statusResult[0].cs.toString();

//             let finalResponse = { allInputsDone };

//             if (allInputsDone) {
//                 try {
//                     const [responsesave] = await db.execute(`
//                         SELECT fp_inputss.developer_id, fp_inputss.complexity, users.name AS developer_name
//                         FROM fp_inputss
//                         LEFT JOIN inputs ON inputs.input_id = fp_inputss.input_id
//                         LEFT JOIN users ON users.userid = fp_inputss.developer_id
//                         WHERE inputs.project_id = ? AND status = 'done' AND fp_inputss.input_id = ?;
//                     `, [projectId, id.id]);
//                     var [project_info] = await db.execute(
//                         `SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1;`,
//                          [projectId]);
//                          if (!project_info.length) {
//                             console.error("No estimation found for project:", projectId);
//                             return res.status(404).json({ message: "No estimation found" });
//                         }
//                         const estimationid = project_info[0]["estimation_id"];
                        
//                     // Build the formatted message
//                     let message = `This is System generated Message\nTeam Responses For Input No:${id.id}:\n`;
                    
//                     responsesave.forEach(record => {
//                         message += `Developer ${record.developer_name}: ${record.complexity} Complexity\n`;
//                     });

//                     await db.execute(`
//                         INSERT INTO messages 
//                         (sender_id, project_id, message_text, message_type, timestamp,input_id) 
//                         VALUES (?, ?, ?, ?, NOW(),?)
//                     `, [12, projectId, message, 'text',id.id]);                  

//                     const finalValueResponse = await this.finalvalue(id, projectId);
//                     finalResponse.finalValue = finalValueResponse;
//                     if(project_info[0]["primary_technique_id"] === "FP")
//                     {
//                        await fp.fpcalculate(projectId,project_info[0]["estimation_id"] );
//                     }
//                     else if(project_info[0]["primary_technique_id"] === "UC")
//                     {
//                         await uc.uc_calculate(projectId,project_info[0]["estimation_id"] );
//                     }
//                     else if(project_info[0]["primary_technique_id"] === "c1b" && project_info[0]["secondary_technique_id"] === "fp")
//                     {
//                        console.log("caculation time",project_info[0]["estimation_id"]);
//                        await fp.fpcalculate(projectId);
//                        await cocomo1.basic_calculate(projectId);

//                     }
//                     else if(project_info[0]["primary_technique_id"] === "c1b" && project_info[0]["secondary_technique_id"] === "kloc")
//                     {
//                         await fp.fpcalculate(projectId,project_info[0]["estimation_id"] );
//                         await cocomo1.basic_calculate();
//                     }

//                     console.log('All inputs for Project ID', projectId, 'have been marked as "Done" by all developers!');
//                 } catch (err) {
//                     console.error('Error in finalvaluessss:', err.message);
//                     finalResponse.finalValue = { message: 'Error in finalvalue yaha  issue h', error: err.message };
//                 }
//             } else {
//                 console.log('Not all developers have marked their inputs as "Done" for Project ID', projectId);
//                 finalResponse.finalValue = { message: 'Not all inputs are marked as "Done"' };
//             }

//             const developerComplexityResponse = await this.saveDeveloperComplexity(projectId, id.id);
//             finalResponse.developerComplexity = developerComplexityResponse;

//             res.status(200).json({ 
//                 message: 'Status check completed successfully.', 
//                 success: true,
//                 result: finalResponse
//             });
//         } catch (err) {
//             console.error('Database Error:', err);
//             res.status(500).json({ message: 'Error checking status', error: err.message });
//         }
//     }

//     async finalvalue(id, projectId) {
//         try {
//             console.log("Heyyy!");

//             const [result] = await db.execute(`
//                 UPDATE inputs SET complexity = (
//                     SELECT complexity FROM fp_inputss
//                     WHERE input_id = ? AND status = 'done' AND complexity IS NOT NULL
//                     GROUP BY complexity
//                     HAVING COUNT(complexity) * 100.0 / (
//                         SELECT COUNT(complexity) FROM fp_inputss
//                         WHERE input_id = ? AND status = 'done' AND complexity IS NOT NULL
//                     ) > 50 LIMIT 1
//                 ) WHERE input_id = ?;
//             `, [id.id, id.id, id.id]);

//             console.log('Final Value Updated:', result);
//             console.log("that issue!");

//             if (result.affectedRows === 0) {
//                 console.log("this issue!");
//                 const svc = await this.saveDeveloperComplexity(projectId, id.id);
//                 await db.execute(`UPDATE fp_inputss SET status = '', spell = spell + 1 WHERE input_id = ?`, [id.id]);
//                 console.log('No updates were made. The conditions for updating were not met.');
//                 return { message: 'No update performed: conditions not met.', result: svc };
//             }

//             return result;
//         } catch (err) {
//             console.error('Error in finalvalueee:', err.message);
//             throw err;
//         }
//     }

//     async saveDeveloperComplexity(projectId, inputid) {
//         try {
// // SELECT developer_id, complexity 
// // FROM fp_inputss 
// // WHERE input_id = ? 
// // AND complexity NOT IN (
// //     SELECT complexity 
// //     FROM fp_inputss 
// //     GROUP BY complexity 
// //     HAVING COUNT(*) > 1
// // );

//             const [result] = await db.execute(`
//             SELECT DISTINCT developer_id, complexity
//                 FROM fp_inputss
//                 WHERE input_id = ? and complexity != ""
//                 AND complexity NOT IN (
//                     SELECT complexity 
//                     FROM fp_inputss
//                     WHERE input_id = ?
//                     GROUP BY complexity
//                     HAVING COUNT(*) > 1
//             );
//             `, [inputid,inputid]);

//             if (result.length === 0) {
//                 return { message: 'No distinct complexity found', data: null };
//             }

//             const check = [];
//             for (const row of result) {
//                 const { developer_id, complexity } = row;

//                 const [existingMessages] = await db.execute(
//                     `SELECT COUNT(*) AS count FROM messages 
//                      WHERE sender_id = ? 
//                      AND project_id = ? 
//                      AND message_text = ? 
//                      AND message_type = ? 
//                      AND input_id = ?`,
//                     [developer_id, projectId, `Kindly justify your response: ${complexity}`, 'text', inputid]
//                 );
                
//                 if (existingMessages[0].count === 0) {
//                     const [insertResult] = await db.execute(
//                         `INSERT INTO messages 
//                         (sender_id, project_id, message_text, message_type, timestamp, input_id) 
//                         VALUES (?, ?, ?, ?, NOW(), ?)`,
//                         [developer_id, projectId, `Kindly justify your response: ${complexity}`, 'text', inputid]
//                     );

//                     if (insertResult.affectedRows > 0) {
//                         check.push(developer_id);
//                     }
//                 }
//             }

//             console.log('Message table updated with developer_id and complexity:', check);

//             return { message: 'Developer complexity saved successfully', devresponse: check };
//         } catch (err) {
//             console.error('Error saving developer complexity:', err.message);
//             return { message: 'Error saving developer complexity', error: err.message };
//         }
//     }
//     async outputvalues(req, res) {
//         const projectId = req.params.project_id;
      
//         try {
//           const [result] = await db.execute('SELECT * FROM project_estimation WHERE project_id =?',[projectId]);
//           res.status(200).json({ message: 'All inputs are shown', data: result });
//         } catch (err) {
//           res.status(500).json({ message: 'Error updating field', error: err.message });
//         }
//       }
// }

// module.exports = new ppController();
const db = require('../config'); // Import the DB connection
const fp = require('../controller/fp');
const uc = require("../controller/usecase");
const cocomo1 = require('./cocomo1');
const agilee = require('./agilee');

const AgileEstimator = require('./agile'); // Import the class


class ppController {
    async checkAllStatus(req, res) {
        const projectId = req.params.project_id;
        const id = req.query;

        if (!id.id) {
            return res.status(400).json({ message: "input_id is required" });
        }

        console.log('Checking status for Project ID:', projectId);

        try {
            // Check if developers exist
            

            
            const [teamResult] = await db.execute('SELECT developer_id FROM team WHERE project_id = ?', [projectId]);
            if (!teamResult.length) return res.status(404).json({ message: 'No developers found for this project.' });
            const teamCount = teamResult.length; // Number of rows (developers in the team)
            const [project_info] = await db.execute(`
                SELECT * FROM estimations WHERE project_id = ? ORDER BY estimation_id DESC LIMIT 1;
            `, [projectId]);
            // Check if inputs exist
            const [inputsResult] = await db.execute('SELECT input_id FROM inputs WHERE estimation_id=?', [project_info[0]["estimation_id"]]);
            if (!inputsResult.length) return res.status(404).json({ message: 'No inputs found for this project.' });

            const totalInputs = teamResult.length;

            // Check how many inputs are marked as 'done'
            const [statusResult] = await db.execute(`
                SELECT COUNT(status) AS cs
                FROM fp_inputss
                LEFT JOIN inputs ON inputs.input_id = fp_inputss.input_id
                WHERE inputs.estimation_id = ? AND status = 'done' AND fp_inputss.input_id = ?;
            `, [project_info[0]["estimation_id"], id.id]);

            const allInputsDone = totalInputs.toString() === statusResult[0].cs.toString();
            let finalResponse = { allInputsDone };

            if (allInputsDone) {
                try {
                    // Fetch responses for completed inputs
                    const [responsesave] = await db.execute(`
                        SELECT fp_inputss.developer_id, fp_inputss.complexity, users.name AS developer_name
                        FROM fp_inputss
                        LEFT JOIN inputs ON inputs.input_id = fp_inputss.input_id
                        LEFT JOIN users ON users.userid = fp_inputss.developer_id
                        WHERE inputs.estimation_id = ? AND status = 'done' AND fp_inputss.input_id = ?;
                    `, [project_info[0]["estimation_id"], id.id]);

                    // Fetch project estimation info
                   

                    if (!project_info.length) {
                        return res.status(404).json({ message: "No estimation found for this project." });
                    }

                    const estimation_id = project_info[0]["estimation_id"];

                    // Construct system-generated message
                    let message = `This is a System-generated Message\nTeam Responses For Input No: ${id.id}:\n`;
                    responsesave.forEach(record => {
                        message += `Developer ${record.developer_name}: ${record.complexity} Complexity\n`;
                    });

                    // Insert message into messages table
                    await db.execute(`
                        INSERT INTO messages 
                        (sender_id, project_id, message_text, message_type, timestamp, input_id) 
                        VALUES (?, ?, ?, ?, NOW(), ?);
                    `, [12, projectId, message, 'text', id.id]);

                    const finalValueResponse = await this.finalvalue(id);
                    finalResponse.finalValue = finalValueResponse;

                    // Perform the correct estimation calculations
                    if (project_info[0]["primary_technique_id"] === "FP") {
                      console.error("Testinggggggg.");
                        await fp.fpcalculate(projectId);
                    } else if (project_info[0]["primary_technique_id"] === "UC") {
                        await uc.uc_calculate(projectId);
                    } else if (project_info[0]["primary_technique_id"] === "c1b" && project_info[0]["secondary_technique_id"] === "fp") {
                        await fp.fpcalculate(projectId);
                        await cocomo1.basic_calculate(projectId);
                    } else if (project_info[0]["primary_technique_id"] === "c1b" && project_info[0]["secondary_technique_id"] === "kloc") {
                        await cocomo1.basic_calculate();
                    }else if (project_info[0]["primary_technique_id"] === "c1i" && project_info[0]["secondary_technique_id"] === "fp") {
                        await fp.fpcalculate(projectId);
                        await cocomo1.intermediate_calculate(projectId);
                    } else if (project_info[0]["primary_technique_id"] === "c1i" && project_info[0]["secondary_technique_id"] === "kloc") {
                        await cocomo1.intermediate_calculate();
                    }else if (project_info[0]["primary_technique_id"] === "c1a" && project_info[0]["secondary_technique_id"] === "fp") {
                        await fp.fpcalculate(projectId);
                        await cocomo1.detailed_calculate(projectId);
                    } else if (project_info[0]["primary_technique_id"] === "c1a" && project_info[0]["secondary_technique_id"] === "kloc") {
                        await cocomo1.detailed_calculate();
                    } else if (project_info[0]["primary_technique_id"] === "agile") {
                         await agilee.user_interruption(projectId);
                        // const [userStoriesResult] = await db.execute('SELECT input_id, complexity FROM inputs WHERE estimation_id = ?', [project_info[0]["estimation_id"]]);
                        // const userStories = userStoriesResult.map(row => ({
                        //     storyPoints: Number(row.complexity)  // Force convert to Number
                        //   }));
                        // const [salariesResult] = await db.execute('SELECT employ_salary FROM employees LEFT JOIN team ON login_id = developer_id WHERE project_id = ?', [projectId]);
                        // const monthlySalaries = salariesResult.map(row => Number(row.employ_salary));
                        // const [interruptionResult] = await db.execute(`SELECT SUM(interruptions.interruption_time) AS total_time FROM interruptions LEFT JOIN team ON team.developer_id = interruptions.developer_id WHERE interruptions.interruption_id IN (SELECT project_interruption_id FROM project_interruptions WHERE estimation_id = ?)`, [project_info[0]["estimation_id"]]);
                        // const interruptedHoursPerDay = Number(interruptionResult[0].total_time) || 0;
                        // var [verify_sprint] = await db.execute(
                        //     'select * from sprint where estimation_id = ?  order by sprint_id DESC limit 1',
                        //     [project_info[0]["estimation_id"]]
                        // );
                        // var [verify_task] = await db.execute(
                        //     `SELECT COUNT(DISTINCT input_id) as totaltask
                        //      FROM task
                        //      WHERE sprint_id = ?;
                        //      `,
                        //     [verify_sprint[0].sprint_id]
                        // );
                        // const [storycount] = await db.execute('SELECT count(input_id) as totalstory FROM inputs WHERE estimation_id = ?', [project_info[0]["estimation_id"]]);

                        // if(verify_task[0].totaltask == storycount[0].totalstory)
                        // {
                        // const estimator = new AgileEstimator(4, verify_sprint[0].velocity, monthlySalaries, teamCount, interruptedHoursPerDay, verify_sprint[0].sprint_days,projectId);
                        // const results = estimator.runEstimation(userStories);
                        // console.log(results);
                        // }
                       
                    }

                   
                } catch (err) {
                    console.error('Error in finalvalue:', err.message);
                    finalResponse.finalValue = { message: 'Error in finalvalue calculation', error: err.message };
                }
            } else {
                finalResponse.finalValue = { message: 'Not all inputs are marked as "Done"' };
            }

            const developerComplexityResponse = await this.saveDeveloperComplexity(projectId, id.id);
            finalResponse.developerComplexity = developerComplexityResponse;
            const [input_info] = await db.execute(`
                SELECT * FROM inputs WHERE input_id = ? limit 1;
            `, [id.id]);
            res.status(200).json({
                message: 'Status check completed successfully.',
                success: true,
                result: finalResponse,
                input_info: input_info[0].complexity
            });
        } catch (err) {
            console.error('Database Error:', err);
            res.status(500).json({ message: 'Error checking status', error: err.message });
        }
    }
    async agilecheck(req,res)
    {
        try{
            console.log("test");

            const projectId = req.params.project_id;
            const [project_info] = await db.execute(`
                SELECT * FROM estimations WHERE project_id = ? ORDER BY estimation_id DESC LIMIT 1;
            `, [projectId]);
            const [userStoriesResult] = await db.execute('SELECT input_id, complexity FROM inputs WHERE estimation_id = ?', [project_info[0]["estimation_id"]]);
            const userStories = userStoriesResult.map(row => ({
                storyPoints: Number(row.complexity)  // Force convert to Number
              }));
            const [salariesResult] = await db.execute('SELECT employ_salary FROM employees LEFT JOIN team ON login_id = developer_id WHERE project_id = ?', [projectId]);
            const monthlySalaries = salariesResult.map(row => Number(row.employ_salary));
            const [interruptionResult] = await db.execute(`SELECT SUM(interruptions.interruption_time) AS total_time FROM interruptions LEFT JOIN team ON team.developer_id = interruptions.developer_id WHERE interruptions.interruption_id IN (SELECT project_interruption_id FROM project_interruptions WHERE estimation_id = ?)`, [project_info[0]["estimation_id"]]);
            const interruptedHoursPerDay = Number(interruptionResult[0].total_time) || 0;
            var [verify_sprint] = await db.execute(
                'select * from sprint where estimation_id = ?  order by sprint_id DESC limit 1',
                [project_info[0]["estimation_id"]]
            );
            var [verify_task] = await db.execute(
                `SELECT COUNT(DISTINCT input_id) as totaltask
                 FROM task
                 WHERE sprint_id = ?;
                 `,
                [verify_sprint[0].sprint_id]
            );
            console.log(verify_sprint[0].sprint_id)
            const [storycount] = await db.execute('SELECT count(input_id) as totalstory FROM inputs WHERE estimation_id = ?', [project_info[0]["estimation_id"]]);
            const [teamResult] = await db.execute('SELECT developer_id FROM team WHERE project_id = ?', [projectId]);
            const teamCount = teamResult.length; // Number of rows (developers in the team)
            console.log("not fullfill");
            console.log("task"+verify_task[0].totaltask);
            console.log("story"+storycount[0].totalstory);
            if(verify_task[0].totaltask == storycount[0].totalstory)
            {
                console.log("check");
             await agilee.user_interruption(projectId);
            //     console.log("enter");
            // const estimator = new AgileEstimator(4, verify_sprint[0].velocity, monthlySalaries, teamCount, interruptedHoursPerDay, verify_sprint[0].sprint_days,projectId);
            // const results = estimator.runEstimation(userStories);
            // console.log(results);

            res.status(200).json({ message: 'Estimated', data: "results" });

            }
        }catch(err)
        {
            console.error('Error in finalvalue:', err.message);

        }
      
    }
    async finalvalue(id) {
        try {
            console.log("Updating final complexity value...");
           
            const [result] = await db.execute(`
                UPDATE inputs SET complexity = (
                    SELECT complexity FROM fp_inputss
                    WHERE input_id = ? AND status = 'done' AND complexity IS NOT NULL
                    GROUP BY complexity
                    HAVING COUNT(complexity) * 100.0 / (
                        SELECT COUNT(complexity) FROM fp_inputss
                        WHERE input_id = ? AND status = 'done' AND complexity IS NOT NULL
                    ) > 50 LIMIT 1
                ) WHERE input_id = ?;
            `, [id.id, id.id, id.id]);

            if (result.affectedRows === 0) {
                await db.execute(`UPDATE fp_inputss SET status = '', spell = spell + 1 WHERE input_id = ?`, [id.id]);
                return { message: 'No update performed: conditions not met.' };
            }

            return { message: 'Final complexity value updated successfully.' };
        } catch (err) {
            console.error('Error in finalvalue:', err.message);
            throw err;
        }
    }

    async saveDeveloperComplexity(projectId, inputid) {
        try {
            
                const [dbResult] = await db.execute(`
                    SELECT DISTINCT developer_id, complexity
                    FROM fp_inputss
                    WHERE input_id = ? AND complexity IS NOT NULL AND complexity != ''
                    AND complexity NOT IN (
                        SELECT complexity 
                        FROM fp_inputss 
                        WHERE input_id = ?
                        GROUP BY complexity 
                        HAVING COUNT(*) > 1
                    );
                `, [inputid, inputid]);

                if (!dbResult.length) return { message: 'No distinct complexity found', data: null };

                var result = dbResult;
            

            return { message: 'Developer complexity saved successfully', data: result };
        } catch (err) {
            console.error('Error saving developer complexity:', err.message);
            return { message: 'Error saving developer complexity', error: err.message };
        }
    }

    async outputvalues(req, res) {
        const projectId = req.params.project_id;

        try {
            console.log(projectId);
            const [result] = await db.execute(`SELECT pe.*, e.*
            FROM project_estimation pe
            JOIN estimations e ON pe.estimation_technique = e.estimation_id
            WHERE pe.project_id = ?;
            `, [projectId]);

            const [project_info] = await db.execute(
                `SELECT * FROM estimations WHERE project_id= ? ORDER BY estimation_id DESC LIMIT 1;`,
                [projectId]
            );
            var [sprint] = await db.execute(
                'select * from sprint where estimation_id = ? and status = ? order by sprint_id ',
                [project_info[0]["estimation_id"],"Completed"]
            );
            console.log(sprint);
            console.log(result);

            res.status(200).json({ message: 'All inputs are shown', data: result,sprint:sprint });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching output values', error: err.message });
        }
    }
}

module.exports = new ppController();

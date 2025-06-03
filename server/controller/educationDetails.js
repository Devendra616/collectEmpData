import EducationDetails from '../models/education.js'

const educationDetailsHandler = async(req, res)=>{
    try{
        const eduDetails = req.body;

        const employeeId = req.user.id;

        if (!employeeId) {
            return res.status(401).json({ message: "Unauthorized: Employee ID missing" });
        }

        // console.log(req.body)
        console.log("Received Edu details", eduDetails);
        // console.log(req.body.education)

        const savedEduDetails = await EducationDetails.findOneAndUpdate(
            {employeeId},
            {...eduDetails, employeeId},

            {new: true, upsert: true},
        )

        res.status(200).json({
            success: true,
            savedEduDetails,
            msg: "Got data",
            statusCode: 200
        })
    }catch(error){
        console.log("🚀 ~ educationDetailsHandler ~ error:", error)

        res.status(500).json({ message: "Internal server error" });
        
    }
}

export default educationDetailsHandler
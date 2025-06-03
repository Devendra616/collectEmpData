import Employee from '../models/employee.js'
import PersonalDetails from '../models/personalDetails.js'
import EducationDetails from '../models/education.js'
import FamilyDetails from '../models/family.js'
import WorkExperience from '../models/workExperience.js'


const fetchPersonalDetails = async (req, res) => {
    try {
        const employeeId = req.user.id
        console.log("🚀 ~ fetchPersonalDetails ~ employeeId:", employeeId)
        const personalData = await PersonalDetails.findOne({ employeeId });
        const employeeData = await Employee.findOne({_id: employeeId });
        
        console.log("🚀 ~ fetchPersonalDetails ~ employeeData:", employeeData)
        console.log("🚀 ~ fetchPersonalDetails ~ personalData:", personalData)
        return res.status(200).json({
            pData: personalData,
            emp: employeeData,
            success: true,
            msg: "Data successfully fetched from DB",
        });
    } catch (error) {
        console.log("🚀 ~ fetchPersonalDetails ~ error:", error)
        res.status(500).json({
            success: false,
            msg: "Error in fetching data"
        })

    }
}

const fetchEducation =()=>{

}

export default {
    fetchPersonalDetails,
    fetchEducation

}
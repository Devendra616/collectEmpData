const validateReg = (req, res, next) => {
  const { email, sapId, password, cpassword } = req.body;

  if (
    [email, sapId, password, cpassword].some((field) => field?.trim() === "")
  ) {
    return res.status(400).json("All fields are required...");
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%!?*&])[a-zA-Z\d@#$%!?*&]{8,}$/;
  if (!passwordRegex.test(password))
    return res
      .status(400)
      .json(
        "Password must be of minimum 8 charcter and contain digits, lowercase, uppercase and special characters"
      );

  const emailRegex = /^[a-zA-Z0-9._%+-]+@nmdc\.co\.in$/;
  if (!emailRegex.test(email))
    return res.status(400).json("Email ID must be a valid NMDC email Id");

  const sapRegex = /^[0-9]{8}$/;
  if (!sapRegex.test(sapId)) {
    return res.status(400).json("Provide a valid SAP ID");
  }

  next();
};

export default validateReg;

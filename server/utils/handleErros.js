const handleErrors = (err) => {
  let errors = { username: "", password: "" };
  console.log(err);
  if (err == "Invalid username") {
    errors.username = "That username is not registered";
    console.log("erros = ", errors);
    // return errors;
  } else if (err == "Invalid password") {
    console.log("erros = ", errors);
    errors.password = "Incorrect password";
  } else if (err.code === 11000) {
    errors.username = "Username already exists";
    return errors;
  } else if (err.message.includes("User Validation Failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};
module.exports = handleErrors;

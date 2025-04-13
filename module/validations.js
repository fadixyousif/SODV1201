// check email regex
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// check phone number valid regex
function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^(\+1)?[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
}

// register validation
function isRegisterationValid(user) {
  const { fullname, username, password, email, phone, role } = user;

  // check fullname length is between 4 and 20 characters
  if (fullname.length < 4 || fullname.length > 20) {

    return { message: 'Full name must be between 4 and 20 characters', success: false }

  }

  // check if fullname does not contains characters that are not allowed
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(fullname)) {
    return { message: 'Full name must contain only letters and spaces', success: false }
  }

  // check if username length is not between 4 and 20 characters
  if (username.length < 4 || username.length > 20) {
    return { message: 'Username must be between 4 and 20 characters', success: false }
  }

  // check if password length is not between 8 and 20 characters
  if (password.length < 8 || password.length > 20) {
    return { message: 'Password must be between 8 and 20 characters', success: false }
  }

  // check if not email is not valid
  if (!isValidEmail(email)) {
    return { message: 'Invalid email format', success: false }
  }

  // check if phone number is not valid
  if (!isValidPhoneNumber(phone)) { 
    return { message: 'Invalid phone number format', success: false }
  }

  // check if role is not owner and coworker
  if (role !== 'coworker' && role !== 'owner') {
    return { message: 'Role must be either coworker or owner', success: false }
  } 

  return { success: true };
}

// profile validation
function isUpdatedDataProfileValid(user) {
    const { username, email, phone, oldPassword, newPassword, newConfirmedPassword } = user;

    // check if the username, email, phone, oldPassword, newPassword, and newConfirmedPassword are not empty
    if (username.length < 4 || username.length > 20) {
        return { message: 'Username must be between 4 and 20 characters', success: false }
    }

    // old password length is between 8 and 20 characters
    if (oldPassword.length < 8 || oldPassword.length > 20) {
        return { message: 'Password must be between 8 and 20 characters', success: false }
    }

    // check new password length is between 8 and 20 characters
    if (newPassword.length < 8 || newPassword.length > 20 && newConfirmedPassword.length < 8 || newConfirmedPassword.length > 20) {
        return { message: 'New password must be between 8 and 20 characters', success: false }
    }

    // check if new password and confirmed password are same
    if (newPassword !== newConfirmedPassword) {
        return { message: 'New password and confirmed password do not match', success: false }
    }

    // check if old password and new password are same
    if (oldPassword == newPassword && oldPassword == newConfirmedPassword) {
        return { message: 'New password cannot be same as old password', success: false }
    }

    // check if email is valid
    if(!isValidEmail(email)) {
        return { message: 'Invalid email format', success: false }
    }

    // check if phone number is valid
    if (!isValidPhoneNumber(phone)) {
        return { message: 'Invalid phone number format', success: false }
    }

    return { success: true };
}

module.exports = {
    isRegisterationValid,
    isUpdatedDataProfileValid,
};
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
  if (fullname.length < 4 || fullname.length > 100) {

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

// check property validation with also check the type of is correct 
function isPropertyDataValid(property) {
    const { name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport, delisted } = property;

    // check types of the property
    if (typeof name !== 'string' || typeof address !== 'string' || typeof address2 !== 'string' || typeof province !== 'string' || typeof city !== 'string' || typeof country !== 'string' || typeof postal !== 'string' || typeof neighbourhood !== 'string' || typeof garage !== 'boolean' || typeof sqft !== 'number' || typeof transport !== 'boolean' || typeof delisted !== 'boolean') {
        return { message: 'Invalid property data type', success: false }
    }

    // check if the name is not empty
    if (name.length < 4 || name.length > 20) {
        return { message: 'Name must be between 4 and 20 characters', success: false }
    }

    // check if the address is not empty
    if (address.length < 4 || address.length > 20) {
        return { message: 'Address must be between 4 and 20 characters', success: false }
    }

    // check if the address2 is not empty
    if (address2.length !== 0) {
        if (address2.length < 4 || address2.length > 20) {
            return { message: 'Address2 must be between 4 and 20 characters', success: false }
        }
    }

    // check if the province is not empty
    if (province.length < 4 || province.length > 20) {
        return { message: 'Province must be between 4 and 20 characters', success: false }
    }

    // check if the city is not empty
    if (city.length < 4 || city.length > 20) {
        return { message: 'City must be between 4 and 20 characters', success: false }
    }

    // check if the country is not empty
    if (country.length < 4 || country.length > 20) {
        return { message: 'Country must be between 4 and 20 characters', success: false }
    }

    // check if the postal code is not empty
    if (postal.length < 6 || postal.length > 10) {
        return { message: 'Postal code must be between 6 and 10 characters', success: false }
    }

    // check if the neighbourhood is not empty
    if (neighbourhood.length < 4 || neighbourhood.length > 20) {
        return { message: 'Neighbourhood must be between 4 and 20 characters', success: false }
    }

    return { success: true };
} 

// similar to isPropertyValid but for workspace data
function isWorkspaceDataValid(workspace) {
    const { name, type, term, sqft, capacity, price, propertyID, rating, smoking_allowed, avalability_date, image, delisted } = workspace;

    // check types of the workspace
    if (typeof name !== 'string' || typeof type !== 'string' || typeof term !== 'string' || typeof sqft !== 'number' || typeof capacity !== 'number' || typeof price !== 'number' || typeof propertyID !== 'number' || typeof rating !== 'number' || typeof smoking_allowed !== 'boolean' || typeof avalability_date !== 'string' || typeof image !== 'string' || typeof delisted !== 'boolean') {
        return { message: 'Invalid workspace data type', success: false }
    }

    // check if the name is not empty
    if (name.length < 4 || name.length > 20) {
        return { message: 'Name must be between 4 and 20 characters', success: false }
    }

    // check if the type is not empty
    if (type.length < 4 || type.length > 20) {
        return { message: 'Type must be between 4 and 20 characters', success: false }
    }

    // check if the term is not empty
    if (term.length < 4 || term.length > 20) {
        return { message: 'Term must be between 4 and 20 characters', success: false }
    }

    // check if the sqft is not empty
    if (sqft < 0) {
        return { message: 'Sqft must be greater than or equal to 0', success: false }
    }

    // check if the capacity is not empty
    if (capacity < 0) {
        return { message: 'Capacity must be greater than or equal to 0', success: false }
    }

    // check if the price is not empty
    if (price < 0) {
        return { message: 'Price must be greater than or equal to 0', success: false }
    }

    // check if the propertyID is not empty
    if (propertyID < 0) {
        return { message: 'Property ID must be greater than or equal to 0', success: false }
    }

    // check if the rating is not empty
    if (rating < 0 || rating > 5) {
        return { message: 'Rating must be between 0 and 5', success: false }
    }

    return { success: true };
}


module.exports = {
    isRegisterationValid,
    isUpdatedDataProfileValid,
    isPropertyDataValid,
    isWorkspaceDataValid,
};
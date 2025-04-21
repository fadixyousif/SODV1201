$(async function(){
        // Fetch user details
        const response = await fetch('http://localhost:3300/api/users/login/verify', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('auth-token')
          }
      });
  
      if (response.status === 401) {
          // User is not authenticated, redirect to login page
          if (($('.edit-profile-body').length > 0) || ($('.listing-body').length > 0) || ($('.management-body').length > 0) || ($('.workspace-body').length > 0) || ($('.profile-body').length > 0) ) { 
            window.location.replace('/authentication.html');
            return;
          }
      }

      const user = await response.json();
  
      if (user.success) {
          const { name, role } = user;
  
          if ($('.management-body').length > 0) {
            if (role !== 'owner') {
              window.location.replace('/index.html');
              return;
            }
          }

          // Update navigation bar
          const navItems = $('#nav-items');
          $('#auth-link').remove(); // Remove Login/Signup link
  
          // Add user menu
          navItems.append(`
              <li class="user-menu">
                  <a href="#" id="user-name" class="user-menu-toggle">${name} ▼</a>
                  <ul class="user-menu-dropdown">
                      <li><a href="/edit_profile.html">Edit Profile</a></li>
                      ${role === 'owner' ? '<li><a href="/management.html">Manage Properties</a></li>' : ''}
                      <li><a href="#" id="logout-btn">Logout</a></li>
                  </ul>
              </li>
          `);
  
          // Logout functionality
          $('#logout-btn').on('click', function () {
              localStorage.removeItem('auth-token');
              window.location.replace('/authentication.html');
          });
      }
})
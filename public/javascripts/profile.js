class Profile extends UserInterface {
    constructor() {
        super();
        super.loadNavigationBarData();
        super.labels = [
            { innerText: 'User profile',    name: 'panel-title' },
            { innerText: 'Email',           name: 'email-section' },
            { innerText: 'Bio',             name: 'bio-section' }
        ];
        super.loadLabels();
        
        this.loadData();
    }
    
    editProfile() {
        if(this.isDefined(Storage)) {
            window.location.href = `/profile/edit?token=${sessionStorage.userToken}`; 
        }
    }
    
    loadData() {
        if(this.isDefined(Storage)) {
            let username = document.getElementById('username');
            let userEmail = document.getElementById('userEmail');
            let userBio = document.getElementById('userBio');
            let userImage = document.getElementById('userImage');

            let editProfileBtn = document.getElementsByName('edit-profile-btn')[0];

            if(this.isDefined(sessionStorage.userToken)) {
                if(this.isDefined(_userData.username)) {
                    let bio = _userData.bio || 'Unknown...';
                    
                    username.innerHTML = _userData.username;
                    userEmail.innerHTML = _userData.email;
                    userBio.innerHTML = xssFilters.inHTMLData( bio );
                    userImage.src = _userData.image 
                        ? `../images/uploads/${_userData.image}`
                        : '../images/Default-avatar.jpg';

                    if(_userData.username === sessionStorage.username) {
                        editProfileBtn.style.visibility = 'visible';
                    }

                } else {
                    let bio = sessionStorage.userBio || 'Unknown...';
                    
                    username.innerHTML = sessionStorage.username;
                    userEmail.innerHTML = sessionStorage.userEmail;
                    userBio.innerHTML = xssFilters.inHTMLData( bio );
                    userImage.src = sessionStorage.userImage 
                        ? `../images/uploads/${sessionStorage.userImage}`
                        : '../images/Default-avatar.jpg';

                    editProfileBtn.style.visibility = 'visible';
                }

            } else {
                window.location.href = '/login';
            }
        }
    }
}

let profile = new Profile();

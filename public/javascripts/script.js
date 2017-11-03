const   MAX_AVATAR_SIZE = 10240,
        AVATAR_TYPE = 'image/jpeg',
        MAX_AVATAR_WIDTH = 128,
        MAX_AVATAR_HEIGHT = 128,
        avatarValidationMsg = `
            avatar's image must be *.jpg file & 
            can't be bigger than 128x128 & 10kB`;

let isDefined = (target) => {
    return typeof(target) !== 'undefined';
};

let dontRedirect = document.getElementsByName('user')[0];
if (isDefined(dontRedirect)) {
    dontRedirect.addEventListener('submit', (e) => {
            e.preventDefault();
    });
}

let validAvatar = false;
let uploadedAvatar = null;
if(window.location.pathname === '/profile/edit') {
    let fileInput = document.getElementsByName('avatar')[0];
    fileInput.addEventListener('change', () => {
        let file = fileInput.files[0];

        let fileReader = new FileReader;
        fileReader.onload = () => {
            let img = new Image;

            img.onload = () => {
                validAvatar = true;
                uploadedAvatar = file;

                let alert = document.getElementsByClassName('alert')[0];
                if( file.size > MAX_AVATAR_SIZE || file.type !== AVATAR_TYPE || 
                    img.width > MAX_AVATAR_WIDTH || img.height > MAX_AVATAR_HEIGHT) {
                    alert.innerHTML = avatarValidationMsg;
                    alert.className = 'alert col-sm-12 alert-danger';
                    alert.style.display = 'inline';
                    
                    validAvatar = false;
                    uploadedAvatar = null;
                    
                } else if(alert.innerHTML !== '') {
                    alert.style.display = 'none';
                }
            };

            img.src = fileReader.result; // because called with readAsDataURL
        };

        fileReader.readAsDataURL(file);
    }, false);
}

let login = (xhttp) => {
    let response = JSON.parse(xhttp.responseText);

    if (isDefined(response.user.username)) {
        sessionStorage.username = response.user.username;
    }
    
    if (isDefined(response.user.email)) {
        sessionStorage.userEmail = response.user.email;
    }
    
    if (isDefined(response.user.bio)) {
        sessionStorage.userBio = response.user.bio;
    }
    
    if (isDefined(response.user.image)) {
        sessionStorage.userImage = response.user.image;
    }
    
    if (isDefined(response.user.token)) {
        sessionStorage.userToken = response.user.token;
        window.location.href = `/profile?token=${sessionStorage.userToken}`;
        
    } else {
        console.error('Something went wrong. No token - no access, sorry.');
    }
};

let showAlert = (xhttp) => {
    let alert = document.getElementsByClassName('alert')[0];
    let responseObj = JSON.parse(xhttp.responseText);
    let response = responseObj.message || responseObj.messages || responseObj.errors;

    alert.className = 'alert col-sm-12 alert-danger';
    alert.style.display = 'inline';
    
    if(isDefined(responseObj.message)) {
        alert.innerHTML = `${response}`;
        
    } else {
        let name = Object.keys(response)[0];
        let description = Object.values(response)[0];
        
        alert.innerHTML = `${name}: ${description}`;
        
        if(isDefined(responseObj.messages)) {
            alert.className = 'alert col-sm-12 alert-success';
        } 
    }
    
};

let customAlert = (message) => {
    let alert = document.getElementsByClassName('alert')[0];
    
    alert.innerHTML = message;
    alert.className = 'alert col-sm-12 alert-danger';
    alert.style.display = 'inline';
};

let succesResponse = (xhttp) => {
    let response = JSON.parse(xhttp.responseText);
    
    if(isDefined(response.user)) {
        login(xhttp);
    } else {
        successAlert(xhttp);
    }
};

let successAlert = (xhttp) => {
    showAlert(xhttp);
};

let validationErrorAlert = (xhttp) => {
    showAlert(xhttp);
};

let unprocessableEntityAlert = (xhttp) => {
    showAlert(xhttp);
};

let errorAlert = (xhttp) => {
    console.error(xhttp.responseText);
};

let makeRequest = (method, destination) => {
    let xhttp = new XMLHttpRequest();
    xhttp.open(method, destination, true);
    
    if(isDefined(Storage)) {
        if(isDefined(sessionStorage.userToken)) {
            xhttp.setRequestHeader('Authorization', `Token ${sessionStorage.userToken}`);
        }
    }
    else {
        console.error('Sorry, your browser does not support web storage.');
        return;
    }

    xhttp.onreadystatechange = () => {
        if(xhttp.readyState === XMLHttpRequest.DONE) {
            if (xhttp.status === 200) {
                succesResponse(xhttp);

            } else if (xhttp.status === 400) {
                validationErrorAlert(xhttp);

            } else if (xhttp.status === 422) {
                unprocessableEntityAlert(xhttp);

            } else if (xhttp.status === 500) {
                errorAlert(xhttp);
            }            
        }
    };
    
    let form = document.getElementsByName('user')[0];
    let fd = new FormData();
    
    if(isDefined(form.elements.username) && form.elements.username.value !== '') {
        fd.append('username', form.elements.username.value);
    }
    
    if(isDefined(form.elements.email) && form.elements.email.value !== '') {
        fd.append('email', form.elements.email.value);
    }
    
    if(isDefined(form.elements.password) && form.elements.password.value !== '') {
        fd.append('password', form.elements.password.value);
    }
    
    if(isDefined(form.elements.bio) && form.elements.bio.value !== '') {
        fd.append('bio', form.elements.bio.value);
    }
    
    if(validAvatar) {
        fd.append('avatar', uploadedAvatar);
    }
    
    if(isDefined(form.elements['g-recaptcha-response'])) {
        if(form.elements['g-recaptcha-response'].value !== '') {
            fd.append('g-recaptcha-response', form.elements['g-recaptcha-response'].value);
        } else {
            return customAlert('You forgot about reCAPTCHA');
        }
    } 
    
    xhttp.send(fd);
};

let postLoginData = () => {
    makeRequest('POST', '/user/login');
};

let postSignUpData = () => {
    makeRequest('POST', '/user/signup');
};

let sendResetPasswordRequest = () => {
    makeRequest('POST', '/user/reset/password');
};

let postToken = (method, destination) => {
    let xhttp = new XMLHttpRequest();
    xhttp.open(method, destination, true);
    
    if(isDefined(Storage)) {
        xhttp.setRequestHeader('Authorization', 'Token ' + sessionStorage.userToken);
    }
    else {
        console.error('Sorry, your browser does not support web storage...');
        return;
    }
    
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === XMLHttpRequest.DONE) {
            if (xhttp.status === 200) {
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('userEmail');
                sessionStorage.removeItem('userBio');
                sessionStorage.removeItem('userImage');
                sessionStorage.removeItem('userToken');

                window.location.href = '/login';

            } else {
                errorAlert(xhttp);
            }
        }
    };
    
    xhttp.send();
};

let loadData = () => {
    if(isDefined(Storage)) {
        if(window.location.pathname === '/profile') {
            let username = document.getElementById('username');
            let userName = document.getElementsByName('user-name')[0];
            if (isDefined(sessionStorage.username)) {
                username.innerHTML = sessionStorage.username;
                userName.innerHTML = `${sessionStorage.username} `;
            } else {
                window.location.href = '/login';
            }

            let userEmail = document.getElementById('userEmail');
            if (isDefined(sessionStorage.userEmail)) {
                userEmail.innerHTML = sessionStorage.userEmail;
            } else {
                window.location.href = '/login';
            }

            let userBio = document.getElementById('userBio');
            if (isDefined(sessionStorage.userBio)) {
                userBio.innerHTML = sessionStorage.userBio;
            } else {
                userBio.innerHTML = '>>Top Secret<<';
            }

            let userImage = document.getElementById('userImage');
            if (isDefined(sessionStorage.userImage)) {
                userImage.src = `../images/uploads/${sessionStorage.userImage}`;
            } else {
                userImage.src = '../images/Default-avatar.jpg';
            }

            let pageTitle = document.getElementsByName('page-title')[0];
            pageTitle.innerHTML = window.location.pathname.slice(1).replace('/', ' | ');

        } else if (window.location.pathname === '/profile/edit') {
            let pageTitle = document.getElementsByName('page-title')[0];
            pageTitle.innerHTML = window.location.pathname.slice(1).replace('/', ' | ');

            let userName = document.getElementsByName('user-name')[0];
            if (isDefined(sessionStorage.username)) {
                userName.innerHTML = `${sessionStorage.username} `;
                userName.href = `/profile?token=${sessionStorage.userToken}`;
            } else {
                window.location.href = '/login';
            }
            
            resetForm();
        }
    }
};

let editProfile = () => {
    if(isDefined(Storage)) {
        window.location.href = `/profile/edit?token=${sessionStorage.userToken}`; 
    }
};

let delUser = () => {
    let result = confirm('Do you really want to delete your account?');
    if (result) {
        postToken('POST','/user/del');
    }
};

let logout = () => {
    postToken('POST','/logout');
};

let resetForm = () => {
    let form = document.getElementsByName('user')[0];
    form.reset();
    
    validAvatar = false;
    
    let alert = document.getElementsByClassName('alert')[0];
    alert.style.display = 'none';
};

let cancelEdit = () => {
    if(isDefined(Storage)) {
        window.location.href = `/profile?token=${sessionStorage.userToken}`; 
    }
};

let postUserData = () => {
    makeRequest('PUT', '/user');
};
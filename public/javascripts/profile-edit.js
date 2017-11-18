class ProfileEdit extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
        super.loadNavigationBarData();
        this.loadData();
        
        this.MAX_AVATAR_SIZE = 10240,
        this.AVATAR_TYPE = 'image/jpeg',
        this.MAX_AVATAR_WIDTH = 128,
        this.MAX_AVATAR_HEIGHT = 128,
        this.avatarValidationMsg = `
            avatar's image must be *.jpg file & 
            can't be bigger than 128x128 & 10kB`;
        
        this.validateFileInput();
    }
    
    validateFileInput() {
        let fileInput = document.getElementsByName('avatar')[0];
        fileInput.addEventListener('change', () => {
            let file = fileInput.files[0];

            let fileReader = new FileReader;
            fileReader.onload = () => {
                let img = new Image;

                img.onload = () => {
                    this.validAvatar = true;
                    this.uploadedAvatar = file;

                    let alert = document.getElementsByClassName('alert')[0];
                    if( file.size > this.MAX_AVATAR_SIZE || file.type !== this.AVATAR_TYPE || 
                        img.width > this.MAX_AVATAR_WIDTH || img.height > this.MAX_AVATAR_HEIGHT) {
                        alert.innerHTML = this.avatarValidationMsg;
                        alert.className = 'alert col-sm-12 alert-danger';
                        alert.style.display = 'inline';

                        this.validAvatar = false;
                        this.uploadedAvatar = null;

                    } else if(alert.innerHTML !== '') {
                        alert.style.display = 'none';
                    }
                };

                img.src = fileReader.result; // because called with readAsDataURL
            };

            fileReader.readAsDataURL(file);
        }, false);
    }
    
    resetForm() {
        let form = document.getElementsByName('user')[0];
        form.reset();

        this.validAvatar = false;

        let alert = document.getElementsByClassName('alert')[0];
        alert.style.display = 'none';
    }

    cancelEdit() {
        if(this.isDefined(Storage)) {
            window.location.href = `/profile?token=${sessionStorage.userToken}`; 
        }
    }

    delUser() {
        let result = confirm('Do you really want to delete your account?');
        if (result) {
            this.postToken('POST','/user/del');
        }
    }

    postUserData() {
        this.makeRequest('PUT', '/user');
    }

    loadData() {
        this.resetForm();
    }
}

let profileEdit = new ProfileEdit();

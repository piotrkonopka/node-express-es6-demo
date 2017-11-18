class ResetPassword extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
    }
    
    postNewPassword() {
        this.makeRequest('PUT', window.location.pathname);
    }
}

let resetPassword = new ResetPassword();

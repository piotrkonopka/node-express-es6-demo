class LoginHelp extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
    }
    
    sendResetPasswordRequest() {
        this.makeRequest('POST', '/user/reset/password');
    } 
}

let loginHelp = new LoginHelp();

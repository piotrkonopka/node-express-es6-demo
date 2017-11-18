class Login extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
    }
    
    postLoginData() {
        this.makeRequest('POST', '/user/login');
    }
}

let login = new Login();

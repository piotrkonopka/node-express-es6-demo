class Signup extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
    }
    
    postSignUpData() {
        this.makeRequest('POST', '/user/signup');
    }
}

let signup = new Signup();

const services = require("../services");
const jwt = require("jsonwebtoken");
const boom = require("boom");

async function signUp(data){
    try {
        let checkEmail = await services.customerServices.checkEmail(data.email);
        if(checkEmail[0] == null){
            let otp = Math.floor(Math.random() * 9000) + 1000;
            console.log("OTP =======> " + otp);
            let registerCustomer = await services.customerServices.register(data, otp);
            let getId = await services.customerServices.checkEmail(data.email);
            let token = jwt.sign(getId[0].customer_id, 'signSecretKey');

            return {
                statusCode: 200,
                message: "Registered Succesfully",
                result: {
                    name: data.email,
                    phone: data.phone,
                    email: data.email,
                    accessToken: token
                }
            }
        }
        else{
            return "Email is already registered";
        }
    } catch (error) {
        return error;
    }
}

async function login(data){
    try {
        let login = await services.customerServices.login(data.email, data.password);
        if(login.length != 0){
            let token = jwt.sign(login[0].customer_id, 'secretKey');
            return {
                statusCode: 200,
                message: "Successfully Logged In",
                data: {
                    name: login[0].customer_name,
                    phone: login[0].customer_phone,
                    email: login[0].customer_email,
                    accessToken: token
                }
            }
        }
        else{
            return "Wrong Email or Password";
        }
    } catch (error) {
        return error;
    }
}

async function verifyOtp(req) {
    try {
        let verifyToken = await jwt.verify(req.headers.token, 'signSecretKey');
        let checkOtp = await services.customerServices.checkOtp(verifyToken, req.body.otp);
        if(checkOtp[0] != null){
            let updateAccount = await services.customerServices.updateAccount(verifyToken);
            return {
                statusCode: 200,
                message: "Account Verified"
            }
        }
        else{
            return "Wrong OTP"
        }
    } catch (error) {
        return error
    }
}

async function addAddress(data) {
    try {
        let verifyToken = await jwt.verify(data.headers.token, 'secretKey');
        let address = await services.customerServices.addAddress(verifyToken, data.body);
        return {
            statusCode: 200,
            message: "Address Added",
            data: {
                details: data.body.detail,
                latitude: data.body.latitude,
                longitude: data.body.longitude
            }
        } 
    } catch (error) {
        return error;
    }
}

module.exports = {
    signUp,
    login,
    verifyOtp,
    addAddress
}
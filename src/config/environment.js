import dotEnv from "dotenv";

dotEnv.config({quiet: true, override: true});

const environment = {
    development: {
        database: {
            host: "18.214.151.123",
            port: "5432",
            user: "apiuser",
            pass: "api123",
            dbName: "exim_portal_db"
        },
        mail: {
            fromEmail: "no-reply@cypherexim.com",
            fromPassword: "noreply@123#",
            mailSMTP: "smtp.mail.us-east-1.awsapps.com",
            userRegisterationmailSubject: "User Registered Successfully!",
            userUpdatemailSubject: "User Updated Successfully!",
            accountcreationmailBody: "Congratulations! Your account has been created successfully Your password is the first five letters of your first name, followed by the last five digits of your contact number.\n\n\ne.g abcdefg@xyz.com and +91 9876543210 so password will be Abcde3210 Click here to Login : https://cypherexim.com Thank you for showing your trust in our services. Your satisfaction is our priority, and we will continue to strive to provide you with the highest quality products and services. We look forward to continuing to build our relationship and for the opportunities that lie ahead. If you have any questions or concerns, please do not hesitate to contact us.",
            downloadsourceemail: "Cypher<dispatch@cypherexim.com>",
            downloadSubject: "Download the Report!"
        },
        region:"us-east-1",
        defaultPass: "Cypher@123",
        secretId: "cypher-access-key",
        tokenKey: "CypherSecretKey"
    },

    production: {
        database: {
            host: "18.214.151.123",
            port: "5432",
            user: "cypher",
            pass: "cypher123",
            dbName: "exim_portal_db"
        },
        mail: {
            fromEmail: "no-reply@cypherexim.com",
            fromPassword: "noreply@123#",
            mailSMTP: "smtp.mail.us-east-1.awsapps.com",
            userRegisterationmailSubject: "User Registered Successfully!",
            userUpdatemailSubject: "User Updated Successfully!",
            accountcreationmailBody: "Congratulations! Your account has been created successfully Your password is the first five letters of your first name, followed by the last five digits of your contact number.\n\n\ne.g abcdefg@xyz.com and +91 9876543210 so password will be Abcde3210 Click here to Login : https://cypherexim.com Thank you for showing your trust in our services. Your satisfaction is our priority, and we will continue to strive to provide you with the highest quality products and services. We look forward to continuing to build our relationship and for the opportunities that lie ahead. If you have any questions or concerns, please do not hesitate to contact us.",
            downloadsourceemail: "Cypher<dispatch@cypherexim.com>",
            downloadSubject: "Download the Report!"
        },
        region:"us-east-1",
        defaultPass: "Cypher@123",
        secretId: "cypher-access-key",
        tokenKey: "CypherSecretKey"
    }
}

export default environment[process.env.IS_PRODUCTION==="true" ? "production": "development"];


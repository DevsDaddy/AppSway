//=================================================================
//  AppSway Email Library
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
const path          =       require('path');                            // Path Library
const fs            =       require('fs');                              // File System
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const nodemailer    =       require("nodemailer");                      // Node Mailer Class
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library

// Email Transport
const transporter = nodemailer.createTransport(Config?.Nodemailer);

// Emails Class
class Emails {
    // Send Template
    async SendTemplate(to, subject, template, data){
        let self = this;
        let html = "";
        try{
            // Open Template
            let pathToTemplate = `${VIEWS_DIR}/emails/${template}.html`;
            if(!fs.existsSync(pathToTemplate)){
                throw new Error(`Failed to send activation email. Template is not found at ${pathToTemplate}`);
                return;
            }
            html = fs.readFileSync(pathToTemplate, { encoding: 'utf8', flag: 'r' });

            // Work with Template and Data
            for (var key in data) {
                html = html.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
            }

            // Send Email
            await self.SendEmail(to, subject, html);
        }catch(err){
            Debug.Log(err);
            return;
        }
    }

    // Send Email
    async SendEmail(to, subject, html){
        try{
            await transporter.sendMail({
                from: Config?.Nodemailer?.From,
                to: to,
                subject: subject,
                html: html
              });
            return true;
        }catch(err){
            Debug.Log(`Failed to send Email. Error: ${err}`)
            return;
        }
    }
}

// Export Emails Class Instance
module.exports = new Emails();
//=================================================================
//  AppSway Debug Library
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
const path          =       require('path');                            // Path Library
const fs            =       require('fs');                              // File System
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const clc           =       require("cli-color");                       // Colors for Console

// Debug Library
class Debug{
    // Constructor
    constructor(){
        this.logStream = null;
        this.Log("Initialized Application Logger.", false);
        this.WriteFileLogHeader();
    }

    // Log Info Message
    Log(message, write_file = true){
        let type = "INFO";
        if(Config?.Debug?.LogLevel != "all" && Config?.Debug?.LogLevel != "infos") return;
        console.log(this.GetMessage(type, message));

        if(!write_file || !Config?.Debug?.FileLog) return;
        this.WriteFileLine(message, type);
    }

    // Log Info Message
    LogWarning(message, write_file = true){
        let type = "WARNING";
        if(Config?.Debug?.LogLevel != "all" && Config?.Debug?.LogLevel != "infos" && Config?.Debug?.LogLevel != "warnings") return;
        console.log(this.GetMessage(type, message));

        if(!write_file || !Config?.Debug?.FileLog) return;
        this.WriteFileLine(message, type);
    }

    // Log Info Message
    LogError(message, write_file = true){
        let type = "ERROR";
        if(Config?.Debug?.LogLevel != "all" && Config?.Debug?.LogLevel != "infos" && Config?.Debug?.LogLevel != "warnings" && Config?.Debug?.LogLevel != "errors") return;
        console.log(this.GetMessage(type, message));

        if(!write_file || !Config?.Debug?.FileLog) return;
        this.WriteFileLine(message, type);
    }

    // Get Message
    GetMessage(type, message){
        type = type.toLowerCase();
        var prefMsg = clc.xterm(15).bgXterm(93);
        var iPrefMsg = clc.xterm(15).bgXterm(32);
        var fullMsg = clc.xterm(15).bgXterm(38);
        if(type == "warning"){
            iPrefMsg = clc.xterm(15).bgXterm(202);
            fullMsg = clc.xterm(15).bgXterm(208);
        }else if(type == "error"){
            iPrefMsg = clc.xterm(15).bgXterm(196);
            fullMsg = clc.xterm(15).bgXterm(160);
        }
        return prefMsg(` ${Config?.Application?.Name ?? "AppSway"} `) + iPrefMsg(` ${type.toUpperCase()} `) + fullMsg(` (${this.GetLogDateFormat("d.m.y, h:i:s")}): ${message}`);
    }

    // Write File Log Header
    WriteFileLogHeader(){
        let logPath = path.join(LOG_DIR, `/${this.GetFileLogName()}`);
        if(this.logStream == null) this.logStream = fs.createWriteStream(logPath, {flags: 'a'});
        let message = (fs.existsSync(logPath)) ? "\n\n" : "";
        message += `== ${Config?.Application?.Name.toUpperCase() ?? "AppSway".toUpperCase()} APPLICATION LOG STARTED ==\n`;
        this.logStream.write(message);
    }

    // Write File Log Line
    WriteFileLine(type, message){
        if(this.logStream == null) this.WriteFileLogHeader();
        let finalMessage = `[${type.toUpperCase()}] (${this.GetLogDateFormat("d.m.y, h:i:s")}): ${message}\n`;
        this.logStream.write(finalMessage);
    }

    // Get File Log Name
    GetFileLogName(){
        let logFilename = `log_${this.GetLogDateFormat("d-m-y")}.log`;
        return logFilename;
    }


    // Get Log Date Format
    GetLogDateFormat(format){
        let formatted = format;
        let dateObj = new Date();
        let d,m,y,h,i,s;
        d = dateObj.getDate();
        m = dateObj.getMonth() + 1;
        y = dateObj.getFullYear();
        h = dateObj.getHours();
        i = dateObj.getMinutes();
        s = dateObj.getSeconds();
        
        if(d < 10) d = `0${d}`;
        if(m < 10) m = `0${m}`;
        if(h < 10) h = `0${h}`;
        if(i < 10) i = `0${i}`;
        if(s < 10) s = `0${s}`;

        formatted = formatted.toLowerCase();
        formatted = formatted.replaceAll()
        formatted = formatted.replaceAll("d",d);
        formatted = formatted.replaceAll("m",m);
        formatted = formatted.replaceAll("y",y);
        formatted = formatted.replaceAll("h",h);
        formatted = formatted.replaceAll("i",i);
        formatted = formatted.replaceAll("s",s);
        return formatted;
    }
}

// Export Debug Instance
let debugInstance = new Debug();
module.exports = debugInstance;
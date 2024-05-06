//=================================================================
//  AppSway HBS Addons
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
const path          =       require('path');                            // Path Library
const fs            =       require('fs');                              // File System
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library

class HBSUtils {
    constructor(){
        this.app = null;
        this.hbs = null;
    }

    // Initialize HBS Utils
    Init(app, hbs){
        this.app = app;
        this.hbs = hbs;

        // Register Helpers
        this.LinkHelper();
        this.FileReader();
        this.Operators();
        this.Split();
        this.ForArr();
    }

    // Link Helper
    // {{{link 'barc.com' href='http://barc.com'}}}
    LinkHelper(){
        let self = this;
        self.hbs.registerHelper('link', function(text, options) {
            var attrs = [];
            for(var prop in options.hash) {
              attrs.push(prop + '="' + options.hash[prop] + '"');
            }
            return new self.hbs.SafeString(
              "<a " + attrs.join(" ") + ">" + text + "</a>"
            );
        });
    }

    // Split Comma-Separated Lists
    // {{#split data ','}}
    Split(){
        let self = this;
        self.hbs.registerHelper('split', function(text, separator, block) {
            var splitted = text.split(separator);
            var accum = '';
            for(var i = 0; i < splitted.length; ++i){
                if(splitted[i].length > 0)
                    accum += block.fn(splitted[i]);
            }
            
            return accum;
        });
    }

    // For Array
    // {{#ForArr data}}
    ForArr(){
        let self = this;
        self.hbs.registerHelper('ForArr', function(data, block) {
            var accum = '';
            for(var i = 0; i < data.length; ++i){
                if(data[i].length > 0)
                    accum += block.fn(data[i]);
            }
            
            return accum;
        });
    }

    // File Reader
    // {{{readFile 'tos.txt'}}}
    FileReader(){
        let self = this;
        self.hbs.registerAsyncHelper('readFile', function(filename, cb) {
            fs.readFile(path.join(viewsDir, filename), 'utf8', function(err, content) {
              cb(new self.hbs.SafeString(content));
            });
        });
    }

    // Operators
    // {{#if (or section1 section2)}}
    Operators(){
        let self = this;
        const reduceOp = function(args, reducer){
            args = Array.from(args);
            args.pop(); // => options
            var first = args.shift();
            return args.reduce(reducer, first);
        };

        self.hbs.registerHelper({
            eq  : function(){ return reduceOp(arguments, (a,b) => a === b); },
            ne  : function(){ return reduceOp(arguments, (a,b) => a !== b); },
            lt  : function(){ return reduceOp(arguments, (a,b) => a  <  b); },
            gt  : function(){ return reduceOp(arguments, (a,b) => a  >  b); },
            lte : function(){ return reduceOp(arguments, (a,b) => a  <= b); },
            gte : function(){ return reduceOp(arguments, (a,b) => a  >= b); },
            and : function(){ return reduceOp(arguments, (a,b) => a  && b); },
            or  : function(){ return reduceOp(arguments, (a,b) => a  || b); }
        });
    }
}

// Return HBS Utils
const HBSAddons = new HBSUtils();
module.exports = HBSAddons;
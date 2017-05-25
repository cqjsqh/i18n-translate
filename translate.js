var path = require('path');
var fs = require('fs');

function I18n () {
    this.options = {
        locales: ['en', 'zh-cn', 'zh-tw'],
        directory: path.join(__dirname, 'langMap'),
        defaultLocale: 'zh-cn'
    };
    this.locale = this.options.defaultLocale;
}

I18n.prototype.configure = function ( options ) {
    this.options = Object.assign(this.options, options);
    this.setLocale(this.options.defaultLocale);

    //saveJson(this.options.directory, 'zh-cn',{a: 123})
    this.options.locales.forEach( val => {
        let data = getJson(this.options.directory, val) || {};
        saveJson(this.options.directory, val, data);
    })
}

I18n.prototype.setLocale = function ( locale ) {
    this.locale = locale;
}

I18n.prototype.open = function () {
    if( !this.temp ) {
        this.temp = getJson(this.options.directory, this.locale) || {};
    }
}
I18n.prototype.close = function () {
    if( this.temp ) {
        saveJson(this.options.directory, this.locale, this.temp);
        this.temp = null;
    }
}

I18n.prototype.__n = function ( text ) {
    if( this.temp ) {
        let trans = this.temp[text] === undefined ? text : this.temp[text];
        return this.temp[text] = trans
    } else {
        return text;
    }
}

I18n.prototype.__ = function ( text ) {
    this.open();
    this.__n(text);
    this.close();
}

module.exports = new I18n();

// 获取数据
function getJson(dirPath, fileName){
    let filePath = path.join(dirPath, fileName + '.json');
    if( fs.existsSync(filePath) ) {
        let context = fs.readFileSync(filePath, 'utf-8');
        return context ? JSON.parse(context) : null;
    } else {
        return null
    }
}

// 保存数据
function saveJson(dirPath, fileName, data){
    let filePath = path.join(dirPath, fileName + '.json');
    if( mkdirsSync(dirPath) ) {
        fs.writeFile(filePath, JSON.stringify(data, null, '    '), 'utf-8')
    }
}

//创建多层文件夹 同步
function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            } else {
                pathtmp = dirname === '' ? path.sep : dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}
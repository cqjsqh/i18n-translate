var path = require('path');
var fs = require('fs');
var Chinese = require('chinese-s2t');

function I18n () {
    this.options = {
        locales: ['en', 'zh-cn', 'zh-tw'],
        directory: path.join(__dirname, 'lang-map')
    };
    this.locale = 'en';
}

I18n.prototype.setLocale = function ( locale ) {
    if( this.options.locales.indexOf(locale) !== -1 )
        this.locale = locale;
};

I18n.prototype.open = function () {
    if( !this.temp ) {
        this.temp = getJson(this.options.directory, this.locale) || {};
    }
}

I18n.prototype.__n = function ( text ) {
    if( this.temp ) {
        // map优先
        let trans = this.temp[text] === undefined ? this.translate(text) : this.temp[text];
        return this.temp[text] = trans
    } else {
        return text;
    }
}

I18n.prototype.translate = function ( text ) {

    switch ( this.locale ) {
        case 'zh-tw':
            return Chinese.s2t(text);
        case 'en':
            return '';

        default :
            return text;
    }

}

I18n.prototype.close = function () {
    if( this.temp ) {
        saveJson(this.options.directory, this.locale, this.temp);
        this.temp = null;
    }
}

I18n.prototype.__ = function ( text ) {
    this.open();
    this.__n( text );
    this.close();
}


// 获取json数据
function getJson(dirPath, fileName){
    let filePath = path.join(dirPath, fileName + '.json');
    if( fs.existsSync(filePath) ) {
        let context = fs.readFileSync(filePath, 'utf-8');
        return context ? JSON.parse(context) : null;
    } else {
        return null
    }
}

// 保存json数据
function saveJson(dirPath, fileName, data){
    let filePath = path.join(dirPath, fileName + '.json');
    if( mkdirsSync(dirPath) ) {
        fs.writeFile(filePath, JSON.stringify(data, null, '    '), 'utf-8')
    }
}

//创建多层文件夹 同步
function mkdirsSync(dirPath, mode) {
    if (!fs.existsSync(dirPath)) {
        var pathTmp;
        dirPath.split(path.sep).forEach(function(dirName) {
            if (pathTmp) {
                pathTmp = path.join(pathTmp, dirName);
            } else {
                pathTmp = dirName === '' ? path.sep : dirName;
            }
            if (!fs.existsSync(pathTmp)) {
                if (!fs.mkdirSync(pathTmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}


module.exports = new I18n();
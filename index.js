var fs = require('fs');
var path = require('path');

var map = require('map-stream');
var vfs = require('vinyl-fs');
var i18n = require('./translate');

var srcPath = './dist'
var distPath = './dist/lang'


function fileHandler (file, cb) {
    if( file.isBuffer() && file.stat.isFile() ){
        var fileName = path.basename( file.path );
        var fileType = path.extname( fileName );

        if( ['.html', '.js'].includes(fileType) ) {
            var content = textReplace( file.contents.toString('utf8') );
            file.contents = new Buffer(content);
        }
    }

    cb(null, file);
}


function textReplace ( str ) {
    var reg = /[\u4E00-\u9FA5]+/g;

    i18n.open();
    str =  str.replace(reg, ( ...arg ) => {
        return i18n.__n( arg[0] );
    });
    i18n.close();
    return str;
}


vfs.src([srcPath + '/**', '!' + srcPath + '/lang', '!' + srcPath + '/lang/**'])
    .pipe(map(fileHandler))
    .pipe(vfs.dest(distPath));







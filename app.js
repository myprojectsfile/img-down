const exec = require('child_process').exec;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/init', function (req, res) {
    res.status(200).send();
});

app.post('/run', function (req, res) {
    var meta = (req.body || {}).meta;
    var value = (req.body || {}).value;
    var image = req.body.image;
    var tag = req.body.tag;
    var dir = image + '_' + tag;

    var download_command = './image-downloader.sh ' + dir + ' ' + image + ':' + tag;
    var compress_command = 'tar -C ./' + dir + ' -cvf ' + dir + '.tar ./';
    var upload_command = './dropbox_uploader.sh upload ' + dir + '.tar' + ' /vps';
    var delete_dir_command = 'rm -r ' + dir;
    var delete_file_command = 'rm ' + dir + '.tar';

    console.log('1 ---> downloading ' + image + ':' + tag + ' from docker Hub...');
    exec(download_command,
        (error, stdout, stderr) => {
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error === null) {
                console.log('*** download completed successfully ***');
                console.log('2 ---> compressing downloaded layers ...');
                exec(compress_command,
                    (error, stdout, stderr) => {
                        if (error === null) {
                            console.log('*** compression completed successfully ***');
                            console.log('3 ---> Now , Uploading file to dropbox...');
                            exec(upload_command,
                                (error, stdout, stderr) => {
                                    if (error === null) {
                                        console.log('*** Uploading file completed Successfully ***');
                                        console.log('4 ---> Now , Deleting directory...');
                                        exec(delete_dir_command,
                                            (error, stdout, stderr) => {
                                                if (error === null) {
                                                    console.log('*** temporary directory deleted Successfully ***');
                                                    exec(delete_file_command,
                                                        (error, stdout, stderr) => {
                                                            if (error === null) {
                                                                console.log('*** temporary file deleted Successfully ***');
                                                                res.status(200).json(dir + '.tar file uploaded to dropbox successfully.');
                                                            }
                                                            else {
                                                                console.log(`delete file exec error: ${error}`);
                                                                res.status(400).json(`delete file exec error: ${error}`);                                                                
                                                            }
                                                        });                                                 
                                                }
                                                else {
                                                    console.log(`delete directory exec error: ${error}`);
                                                    res.status(400).json(`delete directory exec error: ${error}`); 
                                                }
                                            });
                                    }
                                    else {
                                        console.log(`uploading file exec error: ${error}`);
                                        res.status(400).json(`uploading file exec error: ${error}`);
                                    }
                                });
                        }
                        else {
                            console.log(`compressing direcotry exec error: ${error}`);
                            res.status(400).json(`compressing direcotry exec error: ${error}`);
                        }
                    });
            }
            else {
                console.log(`downloading exec error: ${error}`);
                res.status(400).json(`downloading exec error: ${error}`);
            }
        });    
});

app.listen(8080, function () {
})

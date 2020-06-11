const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/wikiDB', {useNewUrlParser : true, useUnifiedTopology : true});
const articleSchema = new mongoose.Schema({
    title: String,
    content: String
}, {
    versionKey: false
});

const Article = mongoose.model('Article', articleSchema);

///////////////////////// Request Targetting All Articles ///////////////////////////////

app.route('/articles')
    
    .get(function(req, res) {
        Article.find({}, function(err, foundItems) {
            if(!err) {
                if(!foundItems) {
                    res.json({message: "No Articles Found"});
                }else{
                    res.json(foundItems);
                }
            }else{
                res.status(500);
            }
        });
    })
   
    .post(function(req, res) {
        const title = req.body.title;
        const content = req.body.content;
        const data = new Article({
            title: title,
            content: content
        });
        data.save(function(err) {
            if(!err){
                res.json({message: 'Successfully Posted the data.'});
            }else{
                res.json({message: 'Something is weong! Could not save the data!'});
            }
        });
    })
    
    .delete(function(req, res) {
        Article.deleteMany({}, function(err) {
            if(err) {
                res.json({message:"Could not able to delete!"})
            }else{
                res.json({message: "Successfully Deleted all the items"});
            }
        });
    });


///////////////////////// Request Targetting A Specific Articles ///////////////////////////////

app.route('/articles/:articleTitle')

    .get(function(req, res) {
        const matchTitile = req.params.articleTitle;
        Article.findOne({title: matchTitile}, function(err, foundItem) {
            if(foundItem) {
                res.json(foundItem);
            }else{
                res.json({
                    message: 'Cound not find any article'
                });
            }
        });
    })

    .put(function(req, res) {
        Article.update(
            { title: req.params.articleTitle},
            { title: req.body.title,
              content: req.body.content },
            {overwrite: true},
            function(err) {
                if(!err) {
                    res.json({message: 'Data Updates Successfully'});
                }else {
                    res.json({message: 'Could not found the Item which you wannted to update'});
                }
            });
    })

    .patch(function(req, res) { // this updates only the specific updates
        Article.update(
            { title: req.params.articleTitle},
            {$set : req.body},
            function(err) {
                if(!err) {
                    res.json({message: 'Successfully Updates'});
                }else{
                    res.json({message: 'Could not set the data'});   
                }
            }
        );
    })

    .delete(function(req, res) {
        Article.deleteOne({title: req.params.articleTitle}, function(err) {
            if(err){
                res.json({
                    message: 'No Article found'
                });
            }else{
                res.json({
                    message: 'Successfully deleted the Item'
                });
            }
        });
    });
app.listen(8080, function() {
    console.log('server started on port 8080');
});
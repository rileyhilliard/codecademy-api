var express = require('express');
var router = express.Router();
var fs = require('fs');
var http = require('request');
var cheerio = require('cheerio');
var _ = require('../underscore.js');
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({extended: false});

var buildJson = function($,username){
  var json, rating, release, title;
  var badges = [];
  $('.achievement-card').each( function(index, card){
    card = $(card);
    var t = {
      image_class: card.find('.cc-achievement').attr('class').replace("cc-achievement ", ""),
      title: card.find('h5').text(),
      date: card.find('small.text--ellipsis').text(),
      href: "http://www.codecademy.com"+card.find('a').attr('href')
    };
    badges.push(t);
  });

  return {
    username: username,
    user: $('.avatar.avatar--inline').parent().find('a').text(),
    avatar:$('.avatar.avatar--inline img').attr("src"),
    badges_count: badges.length,
    badges: badges
  };
};

router.route('/')

  .get(function(request, response){
    response.send('try adding a username like: "/codecademy/{username}"');
  });

  router.route('/badges/:name')
  .all(function(request, response, next){
    var name = request.params.name.toLowerCase();
    request.username = name;
    next();
  })

  .get(function(request, response){
    var username = request.username;
    if(username){
      var url = "http://www.codecademy.com/users/"+username+"/achievements";
      http(url, function(error, res, html){
        var $ = cheerio.load(html);
        if ($('.fit-fixed h1').text() != "404 error"){
          var json = buildJson($, username);
          response.send(json);
        } else {
          var msg = "Check that <a href=\""+url+"\">"+username+"</a> is a valid codecademy username";
          response.status(404).send(msg);
        }
      });
    } else {
      response.status(404).json('No username found, or we dont know what "'+username+'" is');
    }
  });

  router.route('/:name')
  .all(function(request, response, next){
    var name = request.params.name.toLowerCase();
    request.username = name;
    next();
  })

  .get(function(request, response){
    var username = request.username;
    if(username){
      var url = "http://www.codecademy.com/users/"+username+"/";
      http(url, function(error, res, html){
        var $, json, rating, release, title;
        var $ = cheerio.load(html);
        if ($('.fit-fixed h1').text() != "404 error"){
          var courses = [];
          $('#completed .completed').each( function(index, card){
            card = $(card);
            var t = {
              title: card.find('h5').text(),
              date: card.find('.table-row__last-active').text(),
              href: "http://www.codecademy.com"+card.find('a').attr('href')
            };
            courses.push(t);
          });

          json = {
            username: username,
            user: $('.avatar.avatar--large').parent().find('h3').text(),
            avatar:$('.avatar.avatar--large img').attr("src"),
            badges_complete: $('.fit-fixed .link-area').eq(1).find('h3').text(),
            skills_complete_count: courses.length,
            skills_complete: courses,
            stats: {
              joined_formatted: $('.profile-time div small').eq(0).text(),
              joined_timestamp: new Date( Date.parse($('.profile-time div small').eq(0).text().replace("Joined ", ""))),
              total_points: $('.profile-time div').eq(1).text(),
              streak: $('.profile-time div').eq(2).text(),
              last_coded: $('.profile-time div').eq(3).text()
            }
          };
          response.send(json);
        } else {
          var msg = "Check that <a href=\""+url+"\">"+username+"</a> is a valid codecademy username";
          response.status(404).send(msg);
        }
      });
    } else {
      response.status(404).json('No username found, or we dont know what "'+username+'" is');
    }
  });

module.exports = router;

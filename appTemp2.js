var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var request = require('request');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// var graphqlRouter = require('./routes/graphq');
var router = express.Router();
var app = express();

// ====== graphql =======
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
var schema = buildSchema(`
  type Query {
    course(id: Int!): Course
    courses(topic: String): [Course]
  },
  type Course {
    id: Int
    title: String
    author: String
    description: String
    topic: String
    url: String
  }
`);

// var root = {
//   message: () => 'Hello',
// };

var coursesData = [
  {
      id: 1,
      title: 'The Complete Node.js Developer Course',
      author: 'Andrew Mead, Rob Percival',
      description: 'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
      topic: 'Node.js',
      url: 'https://codingthesmartway.com/courses/nodejs/'
  },
  {
      id: 2,
      title: 'Node.js, Express & MongoDB Dev to Deployment',
      author: 'Brad Traversy',
      description: 'Learn by example building & deploying real-world Node.js applications from absolute scratch',
      topic: 'Node.js',
      url: 'https://codingthesmartway.com/courses/nodejs-express-mongodb/'
  },
  {
      id: 3,
      title: 'JavaScript: Understanding The Weird Parts',
      author: 'Anthony Alicea',
      description: 'An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.',
      topic: 'JavaScript',
      url: 'https://codingthesmartway.com/courses/understand-javascript/'
  }
];

var getCourse = function(args) { 
  var id = args.id;
  return coursesData.filter(course => {
      return course.id == id;
  })[0];
};


var getCourses = function(args) {
  if (args.topic) {
      var topic = args.topic;
      return coursesData.filter(course => course.topic === topic);
  } else {
      return coursesData;
  }
};

var root = {
  course: getCourse,
  courses: getCourses
};


app.use('/graphql', express_graphql({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

//==============================
var birds = require('./routes/birds');

// app.all('*', (req, res, next) => {
//   console.log('1');
//   next();
// }, (req, res, next) => {
//   console.log('2');
//   next();
// });

// app.get(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function(req, res){
//   var from = req.params[0];
//   var to = req.params[1] || 'HEAD';
//   res.send('commit range ' + from + '..' + to);
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// express.static('public');
// console.log(__dirname);
app.use('/static', express.static(path.join(__dirname, 'public')));
// app.use('/static', express.static('public'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// get api
app.get('/test', function(req, res) {
  request('https://conduit.productionready.io/api/articles/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body)
      // do more stuff
      res.send(info.articles);
    }
  })
});
app.use('/birds', birds);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // res.send('not found');
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

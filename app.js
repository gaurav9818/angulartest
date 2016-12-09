// JavaScript Document
var myapp = angular.module('myApp',['ngRoute','ngCookies']);

myapp.controller('HomeController', function($scope,$rootScope,$location) {
  $scope.message = 'Hello from HomeController';
  $scope.getClass = function (path) {
      return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    }
});
myapp.run(run);
run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];
    function run($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login', '/register','/home','/about','/blog']) === -1;
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                $location.path('/login');
            }
        });
    }

myapp.controller('BlogController', function($scope,$rootScope,blogdata,$routeParams) {
       
            
       var init = function () {
            
            if ($routeParams.id) {
                blogdata.getBlogData().then(function(){
                  $(blogdata.getData()).each(function(){
                  
                     if(this.id == $routeParams.id){
                       $scope.blogdetails = this;
                       console.log($scope.blogdetails);
                     }
                  })
                 
              });
               
            }else{
              blogdata.getBlogData().then(function(){
                  $scope.blogs = chunk(blogdata.getData(),3);
                 
              });
            }
        };
        
        function chunk(arr, size) {
            var newArr = [];
            for (var i=0; i<arr.length; i+=size) {
              newArr.push(arr.slice(i, i+size));
            }
            return newArr;
          }

        // fire on controller loaded
        init();
        

  
});

myapp.controller('EditBlogController', function($scope,$rootScope,blogdata,$routeParams) {
       
            
    
            $scope.blogdetails={};
            if ($routeParams.id) {
                blogdata.getBlogData().then(function(){
                  $(blogdata.getData()).each(function(){
                  
                     if(this.id == $routeParams.id){
                       $scope.blogdetails = this;
                       
                     }
                  })
                 
              });
               
            }
      
        

        

  
});

myapp.controller('AboutController', function($scope,$rootScope) {
  $scope.message = 'Hello from AboutController';
  
});

myapp.controller('LoginController', function($scope,$location, AuthenticationService, FlashService) {
 (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();
  })();
 $scope.login = {};
 $scope.submitForm = function(isValid) {

    // check to make sure the form is completely valid
    if (isValid) {
     
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.login.username, $scope.login.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials($scope.login.username, $scope.login.password);
                    $location.path('/');
                } else {
                    FlashService.Error(response.message);
                    $scope.dataLoading = false;
                }
            });
        
    }

  };
  
});

myapp.controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$scope','UserService', '$location', '$rootScope', 'FlashService'];
    function RegisterController($scope,UserService, $location, $rootScope, FlashService) {
        $scope.user = {};

       

         $scope.submitForm = function(isValid) {
            $scope.dataLoading = true;
            UserService.Create($scope.user)
                .then(function (response) {
                    if (response.success) {
                        FlashService.Success('Registration successful', true);
                        $location.path('/login');
                    } else {
                        FlashService.Error(response.message);
                        $scope.dataLoading = false;
                    }
                });
        }
    }

myapp.controller('MainController', function($scope,$rootScope) {
 
  
});

myapp.config(function($routeProvider){
  $routeProvider
  .when('/home',{
   templateUrl: 'page/home.html',
   controller: 'HomeController'
  
  })
  .when('/blog',{
   templateUrl: 'page/blog.html',
   controller: 'BlogController'
  
  })
  .when('/blog/detail/id/:id',{
   templateUrl: 'page/blogdetails.html',
   controller: 'BlogController'
  
  })
  
  .when('/about',{
   templateUrl: 'page/about.html',
   controller: 'AboutController'
  
  })
  .when('/login',{
   templateUrl: 'page/login.html',
   controller: 'LoginController'
  
  })
  .when('/register',{
   templateUrl: 'page/register.html',
   controller: 'RegisterController'
  
  })
  .when('/blog/edit/id/:id',{
   templateUrl: 'page/edit_blog.html',
   controller: 'EditBlogController'
  
  })
  .when('/blog/new',{
   templateUrl: 'page/edit_blog.html',
   controller: 'EditBlogController'
  
  })
  
  .otherwise({redirectTo:'/home'});

});

   myapp.filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                  //Also remove . and , so its gives a cleaner result.
                  if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                    lastspace = lastspace - 1;
                  }
                  value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    });

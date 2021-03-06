'use strict';
angular
  .module('openflix', [
    'ngRoute',
    'ngStorage',
    'angular-loading-bar',
    'slugifier',
    'ui.bootstrap'
  ])
  .constant('TMDBAPI','a21723b09e32b44cfbea649fe81ea9c7')
  .constant('SSAPI','954f62bffd117187da50a243f981c7d9a50c1153')
  .config(function($routeProvider, $locationProvider){
    $routeProvider
      .when('/movies', {
        controller: 'MoviesController',
        controllerAs: 'mvVm',
        templateUrl: '/views/movies',
        resolve: {
          title: function() {
            return 'Popular';
          },
          collection: moviesResolver
        }
      })
      .when('/favorites', {
        controller: 'MoviesController',
        controllerAs: 'mvVm',
        templateUrl: '/views/movies',
        resolve: {
          title: function() {
            return 'Favorites';
          },
          collection: function(favService) {
            return favService.get();
          }
        }
      })
      .when('/search/:query', {
        controller: 'MoviesController',
        templateUrl: '/views/movies',
        resolve: {
          title: function() {
            return 'Results';
          },
          collection: function(tmDB, $route) {
            return tmDB.search($route.current.params.query);
          }
        }
      })
      .when('/movies/:slug/:tmdb', {
        controller: 'MovieController',
        templateUrl: '/views/movie',
        resolve: {
          movie: function(tmDB, yts, favService, subService, $route) {
            return tmDB
              .movie($route.current.params.tmdb)
              .then(function(movie){
                movie.data.inFavs = favService.check(movie.data.imdb_id);
                return yts.find(movie.data.imdb_id)
                  .then(function(torrents){
                    movie.data.torrents = false;
                    if(!torrents.data.error) {
                      movie.data.torrents = torrents.data.MovieList;
                    }
                    return subService
                      .get(movie.data.imdb_id)
                      .then(function (subs) {
                        movie.data.subtitles = subs.data.subs[movie.data.imdb_id];
                        return movie.data;
                      });
                });
              });
          }
        }
      })
      .when('/genres/:slug/:id', {
        controller: 'MoviesController',
        controllerAs: 'mvVm',
        templateUrl: '/views/movies',
        resolve: {
          title: function($route) {
            return $route.current.params.slug;
          },
          collection: function($route, MockMovieSvc) {
            return MockMovieSvc.getByGenre($route.current.params.id);
          }
        }
      })
      .otherwise({ redirectTo: '/movies'});
    $locationProvider.html5Mode(true);
  })
  .config(['cfpLoadingBarProvider', CfpLoadingBar]);


CfpLoadingBar.$inject = ['cfpLoadingBarProvider'];
function CfpLoadingBar(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
}

moviesResolver.$inject = ['MockMovieSvc'];
function moviesResolver (MockMovieSvc) {
  return MockMovieSvc.getPopular();
}

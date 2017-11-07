"user strict"
angular.module("psFramework").controller("psFrameworkController",
    ['$scope', '$window', '$timeout','$rootScope', '$location',
        function ($scope, $window, $timeout,$rootScope,$location) {

            $scope.isMenuVisible = true;
            $scope.isMenuButtonVisible = true;

            $scope.$on('ps-menu-item-selected-event', function (evt, data) {
                $scope.routeString = data.route;
                $location.path(data.route);
            });

            $($window).on('resize.psFramework', function () {
                $scope.$apply(function () {
                    checkWidth();
                });
            });
            $scope.$on("$destroy", function () {
                $($window).off("resize.psFramework"); // remove the handler added earlier
            });

            var checkWidth = function () {
                var width = Math.max($($window).width(), $window.innerWidth);
                $scope.isMenuVisible = (width >= 768);
                $scope.isMenuButtonVisible = !$scope.isMenuVisible;
            };

            $timeout(function () {
                checkWidth();
            }, 0);

        }
    ]);
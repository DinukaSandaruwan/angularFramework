"use strict"
angular.module("psFramework").directive("psFramework", function (){
    return {
        transclude:true,
        restrict: "E",
        scope: {
            title: '@',
            subtitle: '@',
            iconFile: '@'
        },
        controller: "psFrameworkController",
        templateUrl: "extModule/psFramework/psFrameworkTemplate.html"
    }

});
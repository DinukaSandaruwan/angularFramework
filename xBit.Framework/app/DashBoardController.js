"user strict"
angular.module("app").controller("DashBoardController",
    ['$scope', '$window', '$timeout','$location','$http', '$q','$interval','dataService',
        function ($scope, $window, $timeout,$location,$http,$q,$interval,dataService) {

$scope.gridOptions = {
        enableCellEditOnFocus: true,
    };

  $scope.gridOptions.columnDefs = [
    { name: 'id' },
    { name: 'name'},
    { name: 'temperature' ,type: 'number'},
    { name: 'guides', displayName: 'guides' ,type: 'number'},
    { name: 'rafts', displayName: 'rafts', type: 'number'},
    { name: 'vests', displayName: 'vests', type: 'number'},
    { name: 'image', displayName: 'image'},
    { name: 'status',displayName:'', cellTemplate :'view/sparkline-cell.html'}
  ];

  $scope.saveRow = function( rowEntity ) {
    // create a fake promise - normally you'd use the promise returned by $http or $resource
    var promise = $q.defer();
    $scope.gridApi.rowEdit.setSavePromise( rowEntity, promise.promise );

    // fake a delay of 3 seconds whilst the save occurs, return error if gender is "male"
    $interval( function() {
      if (rowEntity.temperature == '55' ){
        promise.reject();
      } else {
        promise.resolve();
      }
    }, 1, 1);
  };

  $scope.gridOptions.onRegisterApi = function(gridApi){
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
  };
  dataService.getLocations().then(function(data){
    $scope.gridOptions.data = data;
  });

  $scope.DeleteRecord = function(){
    alter("Are you sure , you want delete");
  };
   

  $scope.addData = function() {
    var n = $scope.gridOptions.data.length + 1;
    $scope.gridOptions.data.push({
                "firstName": "New " + n,
                "lastName": "Person " + n,
                "company": "abc",
                "age": 10+ n,
                "gender": "male"
              });
  };

    }]);

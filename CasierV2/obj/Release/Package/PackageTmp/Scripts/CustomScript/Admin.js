
var app = angular.module('AdminApp', ['ui.bootstrap'])

.controller('AdminController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    getMenu();
    getCategory();
    function getMenu() {
        $http({
            method: 'Get',
            url: '/Admin/getAllItems',
            dataType: "json"
        })
         .success(function (data) {
          
             var recieveData = JSON.parse(data);
             $scope.items = recieveData;
             angular.forEach($scope.items, function (obj) {
                 obj["showEdit"] = true;
             })

         });
        }


    function getCategory() {
        $http({
            method: 'Get',
            url: '/Admin/getAllCategory',
            dataType: "json"
        })
         .success(function (data) {
             if (data.length)
               
             var recieveData = JSON.parse(data);
             $scope.categoryItems = recieveData;
             console.log($scope.categoryItems);
             angular.forEach($scope.categoryItems, function (obj) {
                 obj["showEditCategory"] = true;
             })

         }, function (error) {
             console.log(error);
         });
    }
   // categoryItems
    $scope.toggleCategory = function (emp) {
        emp.showEditCategory = emp.showEditCategory ? false : true;
        console.log(emp);
    }
    $scope.AddCategory = function (CategorySet) {
        $http({
            method: "post",
            url: "/Admin/AddCategory",
            data: JSON.stringify(CategorySet),
            dataType: "json"
        }).success(function () {
            getCategory();
        });
    }

  //  $http({
  //      method: 'Get',
  //      url: '/Admin/GetCategory',
  //      dataType: "json"
  //  })
  //.success(function (data) {
  //    var recieveData = JSON.parse(data);
  //    $scope.Category = recieveData;
  //}, function (error) {
  //    console.log(error);
  //});

    //$scope.toggleCategoryEdit = function (emp) {
    //    emp.showEditCategory = emp.showEditCategory ? false : true;
    //    if (emp.showEditCategory) {
    //        $http({
    //            method: 'Post',
    //            url: '/Admin/UpdateItemSet',
    //            dataType: "json",
    //            data: { ItemSet: emp },
    //        })
    //        .success(function (data) {
    //        }, function (error) {
    //            console.log(error);
    //        });
    //    }
    //}
    // items.showEdit, items.ItemSetId, items.Name, items.Number, items.Price, items.Discount
    $scope.UpdateItem = function (ItemSetId, Name, Number, Price, Discount) {
      
      
            $http({
                method: 'Post',
                url: '/Admin/UpdateItemSet',
                dataType: "json",
                   //  string Name, int ItemSetId, string Number, decimal Price, short Discount
                data: { Name: Name, ItemSetId: ItemSetId, Number:Number, Price: Price, Discount: Discount},
            })
            .success(function (data) { 
            }, function (error) {
                console.log(error);
            });
        
    }

    $scope.AddItems = function (item) {
           $http({
                method: "post",
                url: "/Admin/AddItems",
                data: JSON.stringify(item),
                dataType: "json"
           }).success(function (response) {
               console.log(response);
               getMenu();
               getCategory();
               $scope.showCreateReservatioForm = false;
           });
    }

    $scope.DeleteItem = function (item) {
        alert(item);
        $http({
            method: "post",
            url: "/Admin/DeleteItem",
            data: JSON.stringify(item),
            dataType: "json"
        }).success(function () {
            getMenu();
        });
    }
    $scope.DeleteCategory = function (category) {
        alert(category);
        $http({
            method: "post",
            url: "/Admin/DeleteCategory",
            data: JSON.stringify(category),
            dataType: "json"
        }).success(function () {
            getCategory();
        });
    }

    $scope.GetOrderItems = function (category) {
        alert(category);
        $http({
            method: "get",
            url: "/Admin/getReservationSet",
            data: JSON.stringify(category),
            dataType: "json"
        }).success(function (data) {
            var recieveData = JSON.parse(data);
            $scope.getOrders = recieveData;    
        });
    }

    $scope.AddReservationSet = function (ReservationSet) {
        alert(ReservationSet);
        $http({
            method: "post",
            url: "/Admin/createReservationSet",
            data: JSON.stringify(ReservationSet),
            dataType: "json"
        }).success(function () {
            getCategory();
        });

    }

}]); 
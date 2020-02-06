
(function () {
    'use strict';

    angular.module('CasierApp', ['ngMaterialDatePicker', 'ui.bootstrap', 'ui.toggle', 'ui.calendar'])
.controller('CasierController', ['$scope', '$http', '$timeout', '$q', '$window', 'uiCalendarConfig', function ($scope, $http, $timeout, $q, $window, uiCalendarConfig) {

   
   

    //$scope.SelectedEvent = null;
    //var isFirstTime = true;

    //$scope.events = [];
    //$scope.eventSources = [$scope.events];



    

    $scope.switchviewMode = false;
    $scope.changeViewMode = function () {

        if ($scope.toggleValue) {
            $scope.switchviewMode = true;
        } else {
          
            $scope.switchviewMode = false;
        }
    }

    var startOfWeek = moment().startOf('week');
    var endOfWeek = moment().endOf('week');

    var days = [];
    var day = startOfWeek;

    while (day <= endOfWeek) {
        days.push(day.format("YYYY-MM-DDTHH:mm:ssZ"));
        day = day.clone().add(1, 'd');
    }

    $scope.date = new Date();
    $scope.time = new Date();
    $scope.dateTime = new Date();
    $scope.minDate = moment().subtract(1, 'month');
    $scope.maxDate = moment().add(1, 'month');
    $scope.dates = days


    $scope.upDateInvoiceByDate = function () {

            $scope.init();
    }




    $scope.plus = "";
    $scope.SetMenuNumbers = function (input) {


        if ($scope.menuNumbers == null) {
            $scope.menuNumbers = input;
        } else if ($scope.menuNumbers != null) {
            $scope.menuNumbers = $scope.menuNumbers + input;
        }
    }
    $scope.SetInvoiceSetNumber = function (input) {


        if ($scope.InvoiceSetNumber == null) {
            $scope.InvoiceSetNumber = input;
        } else if ($scope.InvoiceSetNumber != null) {
            $scope.InvoiceSetNumber = $scope.InvoiceSetNumber + input;
        }

    }

    $scope.ChangeView = true;
    $scope.startOrder = function (item) {

        var findMutiple = [];
        var currentItem = item;
        $scope.Quantity = null;
        if ($scope.menuNumbers) {
            if ($scope.menuNumbers.indexOf("*") >= 0) {
                findMutiple = $scope.menuNumbers.split('*');
                $scope.Quantity = findMutiple[0];
            }
            else if ($scope.menuNumbers.indexOf("*") <= 0) {
                $scope.Quantity = $scope.menuNumbers;
            }

        } else {
            $scope.Quantity = 1;
        }

        $http({
            method: 'Post',
            url: '/Casier/InsertInvoiceDeitails',
            dataType: 'json',
            data: { invoiceHeader: $scope.CurrentInvoice.InvoiceHeaderSetId, quantity: $scope.Quantity, number: item },
        }).then(function (data) {
            var recieveData = JSON.parse(data.data);
            $scope.CurrentInvoice = recieveData;
            $timeout(function () {
                $('.WriteMenuTable  > tbody  > tr').each(function () {
                    if ($(this).attr('class') === currentItem) {
                        $(this).addClass("selected");
                    }
                    //else if ($(this).attr('class') !== currentItem) {
                    //    $(this).removeClass("selected");
                    //}
                });

            }, 200);
        })
        $scope.menuNumbers = null;
    }
    $scope.showTobMenuMethod = function (findTheDiv) {

        $(".MenuChoice").hide();
        $(".Sub" + findTheDiv).show();
        $("#Back").show();

    }

    $scope.returnToMainMenu = function (findTheDiv) {

        $(".MenuChoice").show();
        $("#Back").hide();
        $(".Sub" + findTheDiv).hide();


    }
    $scope.ShowItemImages = function (item) {

        var modal = document.getElementById('ImageKeeper');

        var img = document.getElementById(item);
        var modalImg = document.getElementById("img01");
        var captionText = document.getElementById("caption");

        var test = document.getElementById(item).getElementsByTagName('img')[0];
        modal.style.display = "block";
        modalImg.src = test.src;
        captionText.innerHTML = test.alt;

        var span = document.getElementsByClassName("close")[0];

        span.onclick = function () {
            modal.style.display = "none";
        }
    }
    $scope.resetMenu = function () {
        $(".subMenu").hide();
        $(".MenuChoice").show();
        $("#Back").hide();
    }
    $scope.DeleteItems = function (invoiceHeaderSet) {
        $http({
            method: "post",
            url: "/Casier/DeleteCurrentItem",
            dataType: "json",
            data: invoiceHeaderSet
        }).then(function (date) {
            $scope.CurrentInvoice = [];
            $scope.goBackToMain();
        });
    }
    $scope.getTotal = function () {

        var total = 0;
        if (!$scope.ChangeView) {
            if ($scope.CurrentInvoice) {

                if (($scope.CurrentInvoice.InvoiceHeaderDetailsSet)) {
                    for (var i = 0; i < $scope.CurrentInvoice.InvoiceHeaderDetailsSet.length; i++) {
                        var product = $scope.CurrentInvoice.InvoiceHeaderDetailsSet[i];
                        if (product) {
                            total += (product.Quantity * product.ItemSet.Price);
                        }
                    }
                }
                return total;
            }
        }
    }

    $scope.ReservationAlreadyExist = false;
    $scope.CreateReservationSetOrUpdate = function (invoiceHeaderSet) {

            $http({
                method: "post",
                url: "/Casier/CreateReservationSetOrUpdate",
                dataType: "json",
                data: { invoiceHeaderSet: invoiceHeaderSet, searchDate: $scope.datePicker }
            }).then(function (data) {
                var recieveData = JSON.parse(data.data);
                if (recieveData == null) {
                    $scope.ReservationAlreadyExist = true;
                }else{
                    $scope.showCreateReservatioForm = false;
                    $scope.getReservationBydate();
                }
            });
        
    }

    $scope.getTotalTakeAway = function () {
        var total = 0;
        var rabat = 0;
        if ($scope.CurrentInvoice) {
        if (!$scope.ChangeView) {
            {
                for (var i = 0; i < $scope.CurrentInvoice.InvoiceHeaderDetailsSet.length; i++) {
                    var product = $scope.CurrentInvoice.InvoiceHeaderDetailsSet[i];
                 
                    if (product.ItemSet.Discount) {
                        rabat += product.ItemSet.Discount * product.ItemSet.Price / 100;
                    }
                   
                    total += (product.Quantity * product.ItemSet.Price);
                }
            }
            var sum = total - rabat;
            return sum;
        }
        }
    }
    $scope.getCategory = function () {

        $http({
            method: 'Get',
            url: '/Casier/getAllCategory',
            dataType: "json"
        })
       .then(function (data) {
           var recieveData = JSON.parse(data.data);
           $scope.getCategoryList = recieveData;
                

       });
    }

    $scope.getInvoiceHeaderDetails = function () {

        $http({
            method: 'Post',
            url: '/Casier/getInvoiceHeaderDetails',
            dataType: "json",
            data: { searchDate: $scope.datePicker }
        }).then(function (data) {
           
            var recieveData = JSON.parse(data.data);
            $scope.getInvoiceHeaderDetailsList = recieveData;
            console.log($scope.getInvoiceHeaderDetailsList);

        });
    }
    $scope.ChangeViewsItems = function () {

        $http({
            method: 'Post',
            url: '/Casier/getOrderTables',
            dataType: "json",
            data: { options: $scope.optionValue },
        }).then(function (data) {
            var recieveData = JSON.parse(data.data);
            $scope.Reservations = recieveData;
        });
    }
    $scope.GetPaidItems = function () {

        $http({
            method: 'Post',
            url: '/Casier/GetpaidItems',
            dataType: "json",
            data: { searchDate: $scope.datePicker }
        }).then(function (data) {
            $scope.getSumPaid = 0;
            var recieveData = JSON.parse(data.data);
            $scope.GetPaidItemsList = recieveData;

            angular.forEach($scope.GetPaidItemsList, function (value, key) {
                $scope.getSumPaid += value.Total;
             
            });

        });
    }

    $scope.GetDeleteItems = function () {

        $http({
            method: 'Post',
            url: '/Casier/GetDeleteItems',
            dataType: "json",
            data: { searchDate: $scope.datePicker }
        }).then(function (data) {

            var recieveData = JSON.parse(data.data);
            $scope.GeDeleteItemsList = recieveData;

        });
    }
    $scope.datePicker = new Date();
    $scope.init = function ()
    {

        $http({
            method: 'Post',
            url: '/Casier/getAllItems',
            dataType: "json",
            data: { searchDate: $scope.datePicker }
        }).then(function (data) {
            var recieveData = JSON.parse(data.data);
            $scope.CurrentInvoice = recieveData;
        });
        $http({
            method: 'Post',
            url: '/Casier/getOrderAllItems',
            dataType: "json",
            data: { searchDate: $scope.datePicker }
        }).then(function (data) {
            var recieveData = JSON.parse(data.data);
            $scope.CurrentOrderedInvoice = recieveData;
        });

        $scope.InvoiceSetNumber = "";
        $scope.getSumPaid = 0;
    }
    $scope.ReservationDetails = function (InvoiceHeaderSet) {
        $scope.InvoiceHeaderSet = InvoiceHeaderSet;
        $scope.showCreateReservatioForm = true;

    }

    $scope.CreatorDetails = function (CreatorSet) {
        $scope.CreatorSet = CreatorSet;
        $scope.showCreator = true;

    }
    $scope.DeleteReservationSet = function (InvoiceHeaderSet) {
    
       
        $http({
            method: "post",
            url: "/Casier/DeleteReservationSet",
            data: JSON.stringify(InvoiceHeaderSet),
            dataType: "json"
        }).then(function (data) {
            var recieveData = JSON.parse(data.data);
            if (recieveData){
                $scope.showCreateReservatioForm = false;
                $scope.getReservationBydate();
            }
        });

    }
    $scope.CancelReservationSet = function (InvoiceHeaderSet) {
        $scope.InvoiceHeaderSet = null;
        $scope.showCreateReservatioForm = false;
    }
    $scope.GOtoDetails = function (currentObject) {
        $('.WriteMenuTable  > tbody  > tr').removeClass('selected');
        $scope.CurrentInvoice = currentObject;

        if (currentObject.Number.indexOf("T") >= 0) {
            $scope.takeItwayOrnot = true;
        } else {
            $scope.takeItwayOrnot = false;
        }

        $scope.ChangeViews();


        angular.forEach($scope.CurrentInvoice.InvoiceHeaderDetailsSet, function (obj) {
            obj["splitEntity"] = 0;
        })
    }
    $scope.ChangeViews = function () {

        if ($scope.ChangeView) {
            $scope.ChangeView = false;
        } else {
            $scope.ChangeView = true;
        }
    }

    $scope.WantToSplit = false;
    $scope.splitUpMethod = function () {
        if ($scope.WantToSplit) {
            $scope.WantToSplit = false;
            $('.WriteMenuTable  > tbody  > tr').removeClass('selected');
        } else {
            $scope.WantToSplit = true;
        }
    }
    $scope.arr = [];

    function add(invoiceHeader) {
        var found = $scope.arr.some(function (el) {
            if (el.ItemSet.ItemSetId === invoiceHeader.ItemSet.ItemSetId) {
                el.Quantity = invoiceHeader.Quantity;
            }
            return el.ItemSet.ItemSetId == invoiceHeader.ItemSet.ItemSetId;
        });
        if (!found) {
            $scope.arr.push(invoiceHeader);
        };
    }
    $scope.selectedRow = null;  // initialize our variable to null
    $scope.setNewItem = function (InvoiceHeaderSetId, Quantity, ItemSet) {

        if (Quantity > 0) {

            var invoiceHeader = { InvoiceHeaderSet: InvoiceHeaderSetId, Quantity: Quantity, ItemSet: ItemSet };

            add(invoiceHeader);
        }
    }
    $scope.setClickedRow = function (hignligth) {  //function that sets the value of selectedRow to current index
        if ($scope.WantToSplit) {
            $scope.selectedRow = hignligth;
        }
    }

    function printContent(response) {

        //var popupWin = window.open('', '', 'width=300,height=300');
        //popupWin.document.open();
        //popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="../Content/Print.css" media="print, screen" /></head><body>' + response + '</body></html>');
        //setTimeout(function () {
        //    popupWin.focus();
        //    popupWin.print();
        //    popupWin.close();
        //}, 2000);
       
        var prtContent = response;
        var WinPrint = window.open('', '', 'width=600,height=500');
        WinPrint.document.write('<html>');
        WinPrint.document.write('<head><link rel="stylesheet" type="text/css" href="../Content/Print.css" media="print, screen" /></head><body>');
        WinPrint.document.write(prtContent);
        WinPrint.document.write('</body></html>');
        setTimeout(function () {
        WinPrint.focus();
        WinPrint.print();
            WinPrint.close();
        }, 500);
    }

    $scope.TakeAway = function () {

        var total = 0;
        if (!$scope.ChangeView) {
            {
                for (var i = 0; i < $scope.CurrentInvoice.InvoiceHeaderDetailsSet.length; i++) {
                    var product = $scope.CurrentInvoice.InvoiceHeaderDetailsSet[i];
                    var rabat = 20 * product.ItemSet.Price / 100;
                    total += (product.Quantity * product.ItemSet.Price) - rabat;
                }
            }
            return total;
        }

    }

    $scope.payment = function (splitOrNot) {
        var total = 0;
        if ($scope.takeItwayOrnot === false) {
            total = $scope.getTotal();
        } else if ($scope.takeItwayOrnot) {
            total = $scope.getTotalTakeAway();
        }

        if ($scope.WantToSplit === false) {

            $http({
                method: 'Post',
                url: '/Casier/payment',
                data: { total: total, id: $scope.CurrentInvoice.InvoiceHeaderSetId},
            }).then(function (response) {
                printContent(response.data);
                $scope.CurrentInvoice = [];
                $scope.goBackToMain();
                $scope.createItemInfo = "";
                $scope.WantToSplit = false;
                angular.forEach($scope.CurrentInvoice.InvoiceHeaderDetastartOrderilsSet, function (obj) {
                    obj["splitEntity"] = 0;
                });

            });
        }
        else if ($scope.WantToSplit === true) {

            $http({
                method: "post",
                url: "/Casier/splitUpForV",
                dataType: "json",
                data: { invoiceHeaderSet: $scope.CurrentInvoice, invoiceDetails: $scope.arr, takeAway: $scope.takeItwayOrnot, total: total }
            }).then(function (data) {
             
                //  $timeout(function () {
                    $scope.CurrentInvoice = [];
                    var recieveData = JSON.parse(data.data);
                    //$scope.WantToSplit = false;
                    $scope.createItemInfo = "";
                    $scope.CurrentInvoice = recieveData;
                angular.forEach($scope.CurrentInvoice.InvoiceHeaderDetailsSet, function (obj) {
                    obj["splitEntity"] = 0;
                });
                    $scope.arr = [];
                    $scope.splitUpMethod();
              //  });
            });



        }
    }
    $scope.StartCreateInvoiceOrfindexists = function () {

        if ($scope.InvoiceSetNumber){
        $http({
            method: 'Post',
            url: '/Casier/StartCreateInvoiceOrfindexists',
            dataType: 'json',
            data: { number: $scope.InvoiceSetNumber, searchDate: $scope.datePicker },
        }).then(function (data) {
            //   if (data.data != null)
            $scope.CurrentInvoice = [];
            var recieveData = JSON.parse(data.data);
            $scope.CurrentInvoice = recieveData;
            //     ChangeViews();
          
                $scope.ChangeViews();
                //  $scope.getCategory();
           
        });
        }
    }
    $scope.ReturnToMainView = function () {
        if ($scope.CurrentInvoice) {
           
            $http({
                method: 'Post',
                url: '/Casier/DeleteEmpyItems',
                dataType: 'json',
                data: { invoiceHeaderSet: $scope.CurrentInvoice, searchDate: $scope.datePicker },
            }).then(function () { 
                      //  $('.WriteMenuTable  > tbody  > tr').removeClass('selected');
                        $scope.CurrentInvoice = [];
                        $scope.init();
                        $scope.ChangeViews();
                        $scope.WantToSplit = false;
                        $scope.makeOrderOrNot = false;
                        $scope.takeItwayOrnot == false;
                     
            });
        }
        $(".writetable").css('background-color', 'white');
        $scope.menuNumbers = null;         
    }
    $scope.goBackToMain = function () {
        $scope.WantToSplit = false;
        $scope.makeOrderOrNot = false;
        $scope.ChangeViews();
        $scope.init();
        $scope.GetPaidItems();
    }
    $scope.makeOrderOrNot = false;
    $scope.makeOrder = function () {
        
        if ($scope.makeOrderOrNot == false) {
            $scope.makeOrderOrNot = true;
        } else {
            $scope.makeOrderOrNot = false;
        }

    }
    $scope.SetInvoiceSetNumberToNull = function () {

        $scope.InvoiceSetNumber = null;
    }
    $scope.CopyRegning = function (currenItem) {
        //if ($("#BestilleBord").hasClass("active")) {
            $http({
                method: 'Post',
                url: '/Casier/CopyRegning',
                dataType: 'text/plain',
                data: { current: currenItem.InvoiceHeaderSetId },
            }).then(function (response) {
                $("#printDiv").html(response.data);
                printContent(response.data);
                //var sWinHTML = document.getElementById('printContent').outerHTML;
                //$window.open('');
                //$window.document.write('<html><head>');
                //$window.document.write('<link rel="stylesheet" type="text/css" href="~/Content/Print.css" media="print, screen" />');
                //$window.document.write('');
                //$window.document.write('</head><body>');
                //$window.document.write(sWinHTML);
                //$window.document.write('</body></html>');
                //$timeout(function () {
                //    $window.print();
                //    $window.document.close();
                //});

            }, function () {

            });

        //}
        //else {

        //    $http({
        //        method: 'Post',
        //        url: '/Casier/CopyRegning',
        //        dataType: 'text/plain', 
        //        data: { current: currenItem.InvoiceHeaderSetId },
        //    }).then(function (response) {
        //        printContent(response.data);
        

        //    }, function () {

        //    });
        //}

    }
    $scope.Reservation = function (currenItem) {


        $http({
            method: 'Post',
            url: '/Casier/print',
            dataType: 'text/plain',
            data: { current: currenItem.InvoiceHeaderSetId },
        }).then(function (response) {


            $timeout(function () {
                $window.print();
            }, 500);

        }, function () {
            console.log("Failure");
        });


    }
    $scope.menuNumbersSetToNull = function () {
        $scope.menuNumbers = null;
    }
    $scope.refresh = function () {
        if (!angular.isUndefined($scope.menuNumbers)) {
            var findMutiple = [];

            $scope.Quantity;
            $scope.ItemSetId;


            if (angular.isNumber($scope.menuNumbers)) {
                $scope.Quantity = 1;
                $scope.ItemSetId = scope.menuNumbers;
            }
            else if ($scope.menuNumbers.indexOf("*") >= 0) {
                findMutiple = $scope.menuNumbers.split('*');
                $scope.Quantity = findMutiple[0];
                $scope.ItemSetId = findMutiple[1];
            }
            else if ($scope.menuNumbers.indexOf("*") <= 0) {
                $scope.Quantity = 1;
                $scope.ItemSetId = $scope.menuNumbers;
            }

            $scope.menuNumbers = null;
            $http({
                method: 'Post',
                url: '/Casier/InsertInvoiceDeitails',
                dataType: 'json',
                data: { invoiceHeader: $scope.CurrentInvoice.InvoiceHeaderSetId, quantity: $scope.Quantity, number: $scope.ItemSetId },
            }).then(function (data) {

                var recieveData = JSON.parse(data.data);
                $scope.CurrentInvoice = recieveData;
                $timeout(function () {

                    $('.WriteMenuTable  > tbody  > tr').each(function () {
                        if ($(this).attr('class') == $scope.ItemSetId) {
                            $(this).addClass("selected");
                        }
                        //else {
                        //    $(this).removeClass("selected");
                        //}
                    });

                }, 100);

            })

        }
    }
    $scope.takeItwayOrnot = false;
    $scope.StartTakeAway = function () {

        $scope.takeItwayOrnot = true;

    }
    $scope.ReservationDatePicker = new Date();
    $scope.getReservationBydate = function () {
       
        $http({
            method: 'Post',
            url: '/Casier/getReservationDate',
            dataType: "json",
            data: { searchDate: $scope.ReservationDatePicker }
        }).then(function (data) {

            var recieveData = JSON.parse(data.data);
            $scope.ReservationSetList = recieveData;

        });
    }
    $scope.DeleteCreatorSet = function (creatorSet) {

        $http({
            method: "post",
            url: "/Casier/GetAndUpdateCreators",
            dataType: "json",
            data: { creator: creatorSet }
        }).then(function (data) {
            $scope.showCreator = false;
            $scope.GetCreators();
        });
    }
    $scope.CancelCreatorSet = function () {
        $scope.CreatorSet = null;
        $scope.showCreator = false;
    }
    $scope.showCreatorSetOrUpdate = function (creatorSet) {
        $http({
            method: "post",
            url: "/Casier/GetAndUpdateCreators",
            dataType: "json",
            data: { creator: creatorSet }
        }).then(function (data) {
            $scope.showCreator = false;
            $scope.GetCreators();
        });
    }

    $scope.SelectedEvent = null;
    var isFirstTime = true;

    $scope.events = [];
    $scope.eventSources = [$scope.events];

    
    $scope.Repport = function () {

        $scope.uiConfig = {
            calendar: {
                //defaultView: "agendaWeek",
                lang: "da",
                height: 600,
                editable: false,
                displayEventTime: false,
                header: {
                    left: 'month basicWeek agendaDay',
                    center: 'title',
                    right: 'today prev,next'
                },
                eventClick: function (event) {
                    $scope.SelectedEvent = event;
                },
                eventAfterAllRender: function () {
                    if ($scope.events.length > 0 && isFirstTime) {
                        //Focus first event
                        uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start);

                        isFirstTime = false;
                    }
                }
            }
        };

        $http.get('/Casier/CreatorsEvents', {
            cache: false,
            params: {}
        }).then(function (data) {

            var recieveData = JSON.parse(data.data);

            $scope.eventSources[0].splice(0, $scope.eventSources[0].length);
            angular.forEach(recieveData, function (value) {
                $scope.eventSources[0].push({
                    title: value.CreatorSet.Name,
                    cpr: value.CreatorSet.CPR,
                    WorkinghoursSet: value,
                    description: value.StartHour,
                    start: (value.StartHour),
                    end: (value.EndHour),
                    allDay: false,
                    stick: true
                });
            });

            setTimeout(function () {
                $(".fc-state-active").click();
                $('#calendar').fullCalendar('refetchEvents');
            }, 200);
        });
    }

    $scope.GetCreators = function () {
      
        $http({
            method: 'Get',
            url: '/Casier/GetCreators',
            dataType: "json",
        }).then(function (data) {
            var recieveData = JSON.parse(data.data);
            $scope.GetCreatorsSetList = recieveData;
        });
    }

 
    $scope.CreatorsTimeReg = function (users, WorkinghoursSet, addStartWorkingHourSet, addEndWorkingHourSet) {

        $http({
            method: 'Post',
            url: '/Casier/addCreatorWorkingHours',
            dataType: "json",
            data: { creatorSet: users, workingHourDate: WorkinghoursSet, addStartWorkingHourSet: addStartWorkingHourSet, addEndWorkingHourSet: addEndWorkingHourSet } //CreatorSet creatorSet, DateTime addStartWorkingHourSet, DateTime addEndWorkingHourSet
        }).then(function (data) {
            var recieveData = JSON.parse(data.data);
            if (recieveData != null) {
                $scope.WorkinghoursSet = null;
                $scope.GetCreators();
            }
        });


    }
    $scope.GeneretRapport = function (creatorStartDate, creatorEndDate) {

        $http({
            method: 'Post',
            url: '/Casier/GeneretRapport',
            dataType: "json",
            data: { creatorStartDate: creatorStartDate, creatorEndDate: creatorEndDate }
        }).then(function (data) {
            // START PRINT
            printContent(data.data);
            //var popupWin = window.open('', '_blank', 'width=300,height=300');
            //popupWin.document.open();
            //popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + data.data + '</body></html>');
            //popupWin.document.close();
        });
    }
    $scope.CreatorsCheckIn = function (element,item) {
        $http({
            method: 'Post',
            url: '/Casier/CreatorsCheckIn',
            dataType: "json",
            data: { creator: item }
        }).then(function (data) {
               $scope.GetCreators();
            //$scope.calendar.fullCalendar('rerenderEvents');
            //console.log($scope.events);
            //console.log($scope.eventSources);

          
        });
    }
    $scope.CreatorsCheckOut = function (item, WorkinghoursSet) {
        $http({
            method: 'Post',
            url: '/Casier/CreatorsCheckOut',
            dataType: "json",
            data: { creator: item, workinghoursSet: WorkinghoursSet }
        }).then(function (data) {
            $scope.GetCreators();
        });
    }
    $scope.SaveTimeReg = function (SelectedEvent) {
         $http({
             method: 'Post',
             url: '/Casier/SaveTimeReg',
             dataType: "json",
             data: { workinghoursSet: SelectedEvent }
         }).then(function (data) {
             $scope.SelectedEvent = null;
             $scope.GetCreators();

         });
    }
    $scope.RemoveTimeReg = function (SelectedEvent) {
     
        $http({
            method: 'Post',
            url: '/Casier/RemoveTimeReg',
            dataType: "json",
            data: { workinghoursSet: SelectedEvent }
        }).then(function (data) {
            $scope.SelectedEvent = null;
         //   $("#" + SelectedEvent.WorkingHoursId).hide();
            $scope.GetCreators();
        });
    }
    $scope.hub = $.connection.noti;
    $scope.initPushNotification = function () {
        $scope.hub.client.NewInvoiceHeader = function (data) {
            $scope.$apply(function () {
                var recieveData = JSON.parse(data.Data);
                $scope.CurrentInvoice = recieveData;
            });
        }
        $scope.hub.client.newReservations = function (data) {
            $scope.$apply(function () {
                var recieveData = JSON.parse(data.Data);
                $scope.CurrentOrderedInvoice = recieveData;
            });
        }
        $.connection.hub.start();
    }
    $scope.initPushNotification();

}]).directive('exSourceCode', function () {
    return {
        template: '<h4>{{title}}</h4><pre  hljs class="html"><code>{{sourceCode}}</code></pre>',
        scope: {},
        link: function (scope, element, attrs) {
            var tmp = angular.element((element.parent()[0]).querySelector(attrs.target || 'md-input-container'));
            if (tmp.length) {
                scope.title = attrs.title || "Source Code";
                var sourceCode = tmp[0].outerHTML
                  .replace('ng-model=', 'angularModel=')
                  .replace(/ng-[a-z\-]+/g, '')
                  .replace(/ +/g, ' ')
                  .replace('angularModel=', 'ng-model=')
                ;
                scope.sourceCode = style_html(sourceCode, {
                    'indent_size': 2,
                    'indent_char': ' ',
                    'max_char': 78,
                    'brace_style': 'expand'
                });
            }
        }
    };
})
      .directive('hljs', function ($timeout) {
          return {
              link: function (scope, element) {
                  $timeout(function () {
                      hljs.highlightBlock(element[0].querySelector('code'));
                  }, 100);
              }
          };
      });
})();
import $ from "jquery";
$(document).ready(function () {
  $(".subMenu").hide();

  $(".mainMenu > li > a").click(function () {

    if ($(this).next(".subMenu").is(":visible")) {
      // If it's open, close it
      $(this).next(".subMenu").slideUp();
      $(this).children("i").removeClass("rotate90");
    } else {
      // If it's closed, close all other submenus and open the clicked one
      $(".subMenu").slideUp();
      $(".mainMenu > li > a").children("i").removeClass("rotate90");
      $(this).next(".subMenu").slideDown();
      $(this).children("i").addClass("rotate90");
    }
  });

  $(".navToggle").click(function () {
    $(".mainNavbar").toggleClass("mobNav webNav");
    $(".sideBar").toggleClass("mobSidebar webSidebar");
    $(".mainAdmin").toggleClass("mobAdmin");
  });
});

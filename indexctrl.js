// indexctrl.js
// javascript file for index page


$(document).ready(function() {

    // selectors for DOM elements
    var $menuItem = $(".menu a:not('#btnPlay a')");
    var $root = $("html, body");
    var $gotoTop = $("#gotoTop");


    // handler for index page menus
    $menuItem.click(function(event) {
        event.preventDefault();
        // event.stopPropagation();
        $root.animate({
                scrollTop: $($(this).attr("href")).offset().top
        }, 500);
    });

    $gotoTop
        .hover(function() {
            $(this).css("fill", "#17c935");
        }, function() {
            $(this).css("fill", "#1f5825");
        })
        .click(function() {
            $root.animate({
                scrollTop: 0
            }, 500);
    });

    $(window).scroll(function() {
        if ($root.scrollTop() === 0) {
            $gotoTop.fadeOut();
        } else {
            $gotoTop.fadeIn();
        }
    });
});

// ==UserScript==
// @name         Netflix ratings exporter
// @namespace    https://github.com/daneilsan/netflix_backup_tools
// @include      https://www.netflix.com/MoviesYouveSeen
// @version      1
// @description  Create a button at the bottom of www.netflix.com/MoviesYouveSeen to export your ratings
// @author       daneilsan
// ==/UserScript==

(function(){
    function getId(node) {
        var id = node.querySelector("div.col.title>a").href;
        var j = id.lastIndexOf("/");
        return id.substring(j + 1);
    }
    function getTitle(node) {
        return node.querySelector("div.col.title>a").innerHTML;
    }
    function isStarRating(node) {
        return node.querySelector("div.starbar") != null;
    }
    function isHandRating(node) {
        return node.querySelector("div.thumbs") != null;
    }
    function getRatingType(node) {
        if (isStarRating(node))
            return "star";
        else if (isHandRating(node))
            return "hand";
        else
            return "unknown";
    }
    function getRatingStarValue(node) {
        return node.querySelectorAll("span.star.personal").length;
    }
    function getRatingHandValue(node) {
        return node.querySelector("svg.svg-icon-thumb-up-filled") != null ? "up" : "down";
    }
    function getRating(node) {
        var id = getId(node);
        var title = getTitle(node);
        var type = getRatingType(node);
        var value;

        if (type === "star")
            value = getRatingStarValue(node);
        else if (type === "hand")
            value = getRatingHandValue(node);
        else
            value = "unknown";

        return {
            id: id,
            title: title,
            type: type,
            value: value
        }
    }
    function getAllRatings() {
        var j;
        var ratingsNodeList = document.querySelectorAll(".retableRow");
        var processedRatings = [];

        for (j = 0; j < ratingsNodeList.length; j++) {
            processedRatings.push(getRating(ratingsNodeList[j]))
        }

        return processedRatings;
    }
    function createExportationObject(ratings) {
        return {
            "description": "Netflix ratings exportation database",
            "databaseVersion": "1",
            "timestamp": getTimestamp(),
            "generatedWith": "https://github.com/daneilsan/netflix_backup_tools",
            "ratings": ratings
        }
    }
    function exportRatings() {
        var exportationData = createExportationObject(getAllRatings());
        downloadRatings(exportationData);
    }
    function getTwoDigits(number) {
        return (("" + number).length === 1) ? "0" + number : number;
    }
    function getTimestamp() {
        var d = new Date();
        return d.getFullYear() +
                getTwoDigits(d.getMonth()) +
                getTwoDigits(d.getDay()) +
                getTwoDigits(d.getHours()) +
                getTwoDigits(d.getMinutes()) +
                getTwoDigits(d.getSeconds());
    }
    function downloadRatings(exportationData) {
        var a = document.createElement("a");
        a.href = prepareFileHref(exportationData);
        a.download = "Netflix ratings " + getTimestamp() + ".json";
        a.click();
    }
    function prepareFileHref(ratings) {
        var blob = new Blob([JSON.stringify(ratings)], {type: "application/json"});
        return window.URL.createObjectURL(blob);
    }
    function doExtensionStuff() {
        var downloadButton = document.createElement("button");
        ["btn", "btn-blue", "btn-small"].map(function(c) {
            downloadButton.classList.add(c);
        });
        var downloadButtonText = document.createTextNode("Export");
        downloadButton.appendChild(downloadButtonText);
        downloadButton.addEventListener("click", function(e) {
            exportRatings();
        });
        var bottomDiv = document.querySelector(".btn-bar.top-padding.btn-bar-left");
        bottomDiv.appendChild(downloadButton);
    }

    if (document.readyState === "complete")
        doExtensionStuff();
    else
        document.addEventListener("load", doExtensionStuff, false);
}());

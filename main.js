/// <reference path="jquery-3.6.0.js" />

"use strict";

$(() => {

    let coins = [];
    let coinsMoreInfo = [];
    let favorites = [];

    //On loading page, display the home page (section).
    $("section").hide();
    $("#homeSection").show();

    //Switch between pages
    $("a").on("click", function () {
        const dataSection = $(this).attr("data-section")
        $("section").hide();
        $("#" + dataSection).show();
    });

    //Search coins in the home page.
    $("#searchBtn").on("click", function () {
        const textToSearch = $(this).prev().val().toLowerCase();

        const filteredCoins = coins.filter(coin => coin.symbol.indexOf(textToSearch) >= 0); // ??
        if (filteredCoins.length > 0) {
            displayCoins(filteredCoins);
        }
    });

    //Clear Search on click the X in the input & Display all coins.
    $("input[type=search]").on("search", function () {
        displayCoins(coins);
    });

    // $("#homeSection").on("click", ".card > button", function () {
    //     $(this).hasClass("open") ? $(this).removeClass("open").next().slideUp() : $(this).addClass("open").next().slideDown();
    // });
    // $("#homeSection" > "label" > "input").prop( "checked", true ,function () {
    //     alert("Test");
    // } );

    // $('input[type="checkbox"]').change(function() {
    //     if(this.checked) {
    //         alert("Test");
    //         //Do stuff
    //     }
    // });
 
    // $(".switch").prop( "checked", false );
    
    // Handle the More Info Button
    $("#homeSection").on("click", ".card > button", async function () {
        $(this).hasClass("open") ? $(this).removeClass("open").next().slideUp() : $(this).addClass("open").next().slideDown();
        const loaderGif = `<img src="assets/img/loader.gif" class="loaderGif"/>`
        $(this).next().html(loaderGif);
        const coinId = $(this).attr("id");
        const coin = coinsMoreInfo.find(obj => obj.id === coinId) ? readMoreInfo(coinId) : await createMoreInfo(coinId);
        const content = `
            $ ${coin.usd} <br>
            € ${coin.eur} <br>
            $ ${coin.ils}`;
        $(this).next().html(content);

    });
    

    //Handle Favorite Listener
    $("#homeSection").on("change", `.card > .switch > input`, function () {
        const id = $(this).parent().siblings("button").attr("id");
        if ($(this).is(':checked')) {
            saveFavorite(id);
            console.log(favorites);
        }
    });

    function saveFavorite(coin){
        const f = favorites.find(x => x.id === coin);
        if(!f){
            if(favorites.length >= 5){
                alert("Modal");
            }
            else{
                favorites.push(coin);
                localStorage.setItem("Favorites", JSON.stringify(favorites));
            }
        }
    }

    function getFavorites(){
        try {
            favorites = JSON.parse(localStorage.getItem("Favorites"));
        } catch (err) {
            alert(err.message);
        }
    }

    function deleteFavorite(id){
        let index = favorites.findIndex(x => x.id === id);
        favorites = favorites.slice(index, 1);
        localStorage.setItem("Favorites", JSON.stringify(favorites));
    }

    function openModalFavorite(coin){
        console.log(coin);
        $("#favorites").css("display: block");
        //Print modal + buttens on loop on favorites
        //on lisinter, fined index in favorites
    }

    handleCoins();
    
    async function handleCoins() {
        try {
            displayCoins(await getJSON("https://api.coingecko.com/api/v3/coins"));
        }
        catch (err) {
            alert(err.message);
        }
    }

    function displayCoins(coins) {
        let content = "";
        for (const coin of coins) {
            const card = createCard(coin);
            content += card;
        }
        $("#homeSection").html(content)
    }

    function createCard(coin) {
        const card = `
                <div class="card">
                <label class="switch">
                    <input type="checkbox" class="checkbox">
                    <span class="slider round"></span>
                </label> <br>
                <span>${coin.symbol}</span> <br>
                <span>${coin.name}</span> <br>
                <img src="${coin.image.thumb}"/> <br>
                <button id="${coin.id}">More Info</button>
                <span class="moreInfoArea"></span>
            </div>
        `;
        return card;
    }

    async function getMoreInfo(coinId) {
        const coin = await getJSON("https://api.coingecko.com/api/v3/coins/" + coinId);
        return coin;
    }

    async function createMoreInfo(coinId){
        const coin = await getMoreInfo(coinId);
        const coinMoreInfo = {
            id: coinId,
            usd: coin.market_data.current_price.usd,
            eur: coin.market_data.current_price.eur,
            ils: coin.market_data.current_price.ils
        };
        coinsMoreInfo.push(coinMoreInfo);
        saveInStorage(coinsMoreInfo);

        
        return coinMoreInfo;
    }
    function setClearLocalStorageTimer(coinId){
        setTimeout(() => {
            deleteMoreInfo(coinId);
            console.log(coinsMoreInfo);
        }, 120000);
    }
    
    function saveInStorage(coinsMoreInfo){
        localStorage.setItem("moreInfoCoins", JSON.stringify(coinsMoreInfo));
        setClearLocalStorageTimer(coinsMoreInfo.id);
    }

    function readMoreInfo(coinId){
        return coinsMoreInfo.find(obj => obj.id === coinId);
    }

    // Delete from storage, more info of coin 
    function deleteMoreInfo(coinId){
        const index = coinsMoreInfo.indexOf(coinsMoreInfo.find(obj => obj.id === coinId)); // check index
        coinsMoreInfo.splice(index, 1);
        saveInStorage(coinsMoreInfo);
    }

    function getJSON(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                success: data => {
                    resolve(data);
                },
                error: err => {
                    reject(err);
                }
            })
        });
    }

});

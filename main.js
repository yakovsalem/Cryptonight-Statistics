/// <reference path="jquery-3.6.0.js" />

"use strict";

$(() => {

    let coins = [];
    let coinsMoreInfo = [];
    let favorites = [];

    handleCoins();

    //On loading page, display the home page (section).
    $("section").hide();
    $("#homeSection").show();

    //Switch between pages
    $("a").on("click", function () {
        const dataSection = $(this).attr("data-section")
        $("section").hide();
        $("#" + dataSection).show();
    });

    // Search coins in the home page.
    $("#searchBtn").on("click", function () {
        const textToSearch = $(this).prev().val().toLowerCase();

        const notFound = `<div class="searchNotFound">
                    Your search - "${textToSearch}" -<br/>
                    did not match any coin...
            </div>`;

        const filteredCoins = coins.filter(coin => coin.symbol.indexOf(textToSearch) >= 0);
        if (filteredCoins.length > 0) {
            displayCoins(filteredCoins);
        }
        else {
            $("#homeSection").html(notFound);
        }
    });

    // Clear Search on click the X in the input & Display all coins.
    $("input[type=search]").on("search", function () {
        displayCoins(coins);
    });

    
    // Handle the More Info Button
    $("#homeSection").on("click", ".card > button", async function () {
        $(this).hasClass("open") ? $(this).removeClass("open").next().slideUp() : $(this).addClass("open").next().slideDown();
        const loaderGif = `<img src="assets/img/loader.gif" class="loaderGif"/>`
        $(this).next().html(loaderGif);
        const coinId = $(this).attr("id");
        const coin = coinsMoreInfo.find(obj => obj.id === coinId) ? readMoreInfo(coinId) : await createMoreInfo(coinId);
        const content = `
            <h3>Current Price: </h3>
            $ ${coin.usd} <br>
            € ${coin.eur} <br>
            ₪ ${coin.ils}`;
        $(this).next().html(content);

    });
    
    // Handle Favorite Listener
    $("#homeSection").on("change", `.card > .switch > input`, function () {
        const id = $(this).parent().siblings(".coinSymbol").attr("id");
        if ($(this).is(':checked')) {
            saveFavorite(id);
        }
        else{
            deleteFavorite(id); 
        }
    });


    // Add Favorite coin to favorites
    function saveFavorite(coin){
        
        const f = favorites.find(x => x.id === coin);
        if(!f){
            if(favorites.length >= 5){
                openModalFavorite(coin);
            }
            else{
                favorites.push(coin);
                localStorage.setItem("Favorites", JSON.stringify(favorites));
            }
        }
    }
    
    // Read Favorites from local storage
    function getFavorites(){
        try {
            const str = localStorage.getItem("Favorites");
            favorites = str === null? [] : JSON.parse(str);
        } catch (err) {
            alert(err.message);
        }
    }
    
    // Delete Favorite from Array & local storage
    function deleteFavorite(id){
        let index = favorites.findIndex(x => x === id);
        favorites.splice(index, 1);
        localStorage.setItem("Favorites", JSON.stringify(favorites));
    }
    
    // Handle Favorites Modal
    function openModalFavorite(coin){
        $(".modal").css("display", "block");
        for(const f of favorites){
            const contain = `
            <div class="favoriteCard">
                <p>${f}</p>
                <label class="switch">
                    <input type="checkbox" class="checkbox" checked>
                    <span class="slider round"></span>
                </label> <br>
            </div>`;
            $("#favoriteListInModal").append(contain);
        }

        // listener to close button in favorite modal (Cancel)
        $("#closeFavoriteModalBtn").on("click", ()=>{
            $(".modal").css("display", "none");
            $("#favoriteListInModal").html("");
            $(`#${coin}`).siblings(".switch").children("input").prop("checked", false);
            $( "#favoriteListInModal" ).unbind("change"); // kill event listener - unchecked coin in favorite modal
        });
            
        // listener to unchecked coin in favorite modal
        $("#favoriteListInModal").on("change", ".favoriteCard > .switch > input", function(){
            const id = $(this).parent().prev().html();
            deleteFavorite(id);
            $(`#${id}`).siblings(".switch").children("input").prop("checked", false);
            $("#favoriteListInModal").html("");
            $(".modal").css("display", "none");
            saveFavorite(coin);   
            $( "#closeFavoriteModalBtn" ).unbind("click"); // kill event listener 
        });
    }



    // Handle all Coins - Get, Create, Print on screen
    async function handleCoins() {
        try {
            coins = await getJSON("https://api.coingecko.com/api/v3/coins");
            displayCoins(coins);
        }
        catch (err) {
            alert(err.message);
        }
    }

    // Print cards coins on page
    function displayCoins(coins) {
        let content = "";
        for (const coin of coins) {
            const card = createCard(coin);
            content += card;
        }
        $("#homeSection").html(content)

        getFavorites();
        for(const f of favorites){
            $(`#${f}`).siblings(".switch").children("input").prop("checked", true);
        }
    }

    // Create Card coin from coins list 
    function createCard(coin) {
        const card = `
            <div class="card">
                <label class="switch">
                    <input type="checkbox" class="checkbox">
                    <span class="slider round"></span>
                </label> <br>
                <span id="${coin.symbol}" class="coinSymbol">${coin.symbol}</span> <br>
                <span class="coinName">${coin.name}</span> <br>
                <img src="${coin.image.thumb}"/> <br>
                <button id="${coin.id}">More Info</button>
                <span class="moreInfoArea"></span>
            </div>
        `;
        return card;
    }

    // Get More info for coin from server 
    async function getMoreInfo(coinId) {
        const coin = await getJSON("https://api.coingecko.com/api/v3/coins/" + coinId);
        return coin;
    }

    // Create More info data from JSON 
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

    // Clear coin data (More Info) on Local Storage after 2 minutes  
    function setClearLocalStorageTimer(coinId){
        setTimeout(() => {
            deleteMoreInfo(coinId);
            console.log(coinsMoreInfo);
        }, 120000);
    }

    // Save more info in Local storage 
    function saveInStorage(coinsMoreInfo){
        localStorage.setItem("moreInfoCoins", JSON.stringify(coinsMoreInfo));
        setClearLocalStorageTimer(coinsMoreInfo.id);
    }

    // Read more info by id 
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

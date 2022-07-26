/// <reference path="jquery-3.6.0.js" />

$(() => {

    let coins = [];

    //On loading page, display the home page (section).
    $("section").hide();
    $("#homeSection").show();

    //Switch between pages
    $("a").on("click", function () {
        const dataSection = $(this).attr("data-section")
        $("section").hide();
        $("#" + dataSection).show();
    });

    // Handle the More Info Button
    $("#homeSection").on("click", ".card > button", async function () {
        const coinId = $(this).attr("id");
        const coin = await getMoreInfo(coinId);
        const content = `
        <br>
        💲 ${coin.market_data.current_price.usd} <br>
        💶 ${coin.market_data.current_price.eur} <br>
        🎼 ${coin.market_data.current_price.ils}
        `
        $(this).next().html(content);
    });

    //Search coins in the home page.
    $("input[type=search]").on("keyup", function () {

        const textToSearch = $(this).val().toLowerCase();
        if (textToSearch === "") {
            displayCoins(coins);
        }
        else {
            const filteredCoins = coins.filter(c => c.symbol.indexOf(textToSearch) >= 0);
            if (filteredCoins.length > 0) {
                displayCoins(filteredCoins);
            }
        }
        
    });

    handleCoins();

    async function handleCoins() {
        try {
            coins = await getJSON("https://api.coingecko.com/api/v3/coins");
            displayCoins(coins);
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
                <span>${coin.symbol}</span> <br>
                <span>${coin.name}</span> <br>
                <img src="${coin.image.thumb}" /> <br>
                <button id="${coin.id}">More Info</button>
                <span></span>
            </div>
        `;
        return card;
    }

    async function getMoreInfo(coinId) {
        const coin = await getJSON("https://api.coingecko.com/api/v3/coins/" + coinId);
        return coin;
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

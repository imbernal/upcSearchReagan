var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var sql = require('mssql');

var config = {

    user: 'sa',
    password: 'Miami*365',
    server: '192.168.1.49',
    database: 'TEST_ISRAEL_scandb'
};

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static("static"));

sql.connect(config , function (error) {

    if(error) console.log(error);


});


app.post("/upc" , function(req,res){


        var request = new sql.Request();


        var upc = req.body.itemBySearch;

        console.log(upc);

        request.query("WITH MyRowSet AS( SELECT IP.upc , IP.sdate as ScanDate ,IPL.lname AS ListName,IP.palletno AS PalletNo ,ROW_NUMBER() OVER (PARTITION BY IP.palletno ORDER BY IP.sdate DESC ) AS RowNum ,COUNT(*) OVER (PARTITION BY IP.palletno) AS #PerItem FROM [InboundPlocUpcScan] AS IP WITH(NOLOCK) INNER JOIN [InboundPlocListNames] AS IPL WITH(NOLOCK) ON IP.lid = IPL.lid LEFT JOIN web_users AS U WITH(NOLOCK) ON IP.userid = U.id LEFT JOIN InboundOrigins AS IO WITH(NOLOCK) ON IO.oid = IPL.oid WHERE IP.upc = '"+ upc +"' ) SELECT Upc  , ScanDate , ListName , PalletNo , #PerItem FROM MyRowSet WHERE RowNum = 1" ,  function (error , recordset) {

            if(error) console.log(error);

            res.send(recordset) ;

        });

});


app.post("/palletno" , function(req,res){


    var request = new sql.Request();


    var palletno = req.body.itemBySearch;


    request.query("WITH MyRowSet AS( SELECT IP.upc , IP.sdate as ScanDate,IPL.lname AS ListName,IP.palletno AS PalletNo ,ROW_NUMBER() OVER (PARTITION BY IP.upc ORDER BY IP.sdate DESC ) AS RowNum ,COUNT(*) OVER (PARTITION BY IP.upc) AS #PerItem FROM [InboundPlocUpcScan] AS IP WITH(NOLOCK) INNER JOIN [InboundPlocListNames] AS IPL WITH(NOLOCK) ON IP.lid = IPL.lid LEFT JOIN web_users AS U WITH(NOLOCK) ON IP.userid = U.id LEFT JOIN InboundOrigins AS IO WITH(NOLOCK) ON IO.oid = IPL.oid WHERE IP.palletno = '"+ palletno +"' ) SELECT Upc  , ScanDate , ListName , PalletNo , #PerItem FROM MyRowSet WHERE RowNum = 1" ,  function (error , recordset) {

        if(error) console.log(error);

        res.send(recordset) ;

    });

});

app.listen(9203, function () {
   console.log("Listing");
});

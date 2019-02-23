const puppeteer=require('puppeteer');
// const express=require('express');const app=express();app.use(express.static('/Users/cipri/Documents/logoFacturier'));app.listen(3000);
const fs=require('file-system');
const datetime = require('node-datetime');

function Company(name, cif, regCom, adress, logo)
{
	this.name=name;
	this.cif=cif;
	this.regCom=regCom;
	this.adress=adress;
	this.logo=logo;
}

function Product(name, measureUnit, quantity, priceUnit, tvaCrt)
{
	this.name=name;
	this.measureUnit=measureUnit;
	this.quantity=quantity;
	this.priceUnit=priceUnit;
	this.tvaCrt=tvaCrt;
	this.brutPrice=(quantity*priceUnit);
	this.tvaTotal=(quantity*priceUnit*tvaCrt/100);
	this.netPrice=(quantity*priceUnit*(tvaCrt+100)/100);
	
}
// parametri teoretic
var provider=new Company('Probiro SRL', 'RO2134', 'J32/214/321', 'Str.Lunga, Sibiu','http://localhost:3000/apple.png');
var client=new Company('Cipri SRL', 'RO4232','J321/21/2','Str.Meteor, Cluj','logo1.jpg');
var products=[];
var tva=19;
var numberTicket='AB345';
var cashier='Luminita Giurgiu';
var p1=new Product('Paine', 'kg', 2, 2.4, 9);
var p2=new Product('telefon', 'buc', 1, 10000000,19);
var products=[p1,p2];
var dt = datetime.create();
var formattedDate = dt.format('d.m.Y');

var total=0,totalBrut=0,totalTva=0;
calcTotals();

//auxiliare
var resultHTML="";

buildPage();

function buildPage()
{
	resultHTML+='<html>\n';
	resultHTML+='<head>'
	addCss();
	resultHTML+='</head>';
	resultHTML+='<body>';
	buildHeader();
	buildProductTable();
	resultHTML+='<body>';
	resultHTML+='</html>';
	createHtmlFile();
	createPdfFile();
}

function addCss()
{
	resultHTML+='<style>';
	var text = fs.readFileSync("style.css").toString('utf-8');
	resultHTML+=text;
	resultHTML+='</style>';
}

function buildHeader()
{
	resultHTML+='\t<header>\n';
	topBox();
	middleBox();
	bottomBox();
	resultHTML+='\t</header>\n';
}
//aia cu imaginea si factura
function topBox()
{
	resultHTML+='<div width=\"100%\" height=\"200\">';
	insertLogo(provider.logo, '30%',135);
	resultHTML+='<div style=\"float:left;width:20%\"><h2>FACTURA</h2><h5>Data emiterii:'+formattedDate+'</h5></div>';
	resultHTML+='<div style=\"float:left;padding-top:5px;\"><h3>'+numberTicket+'</h3><h5>Cota T.V.A: '+tva+'%</h5></div>';

	resultHTML+='</div>';
}
//totalul
function middleBox()
{
	resultHTML+='<div style=\"width:100%;clear:both;height=100\">';
	insertTotalBox(total);
	resultHTML+='</div>';
}
//datele firmei
function bottomBox()
{
	resultHTML+='<div style=\"width: 100%;clear:both; padding-top:20px\">';
	//furnizor
	resultHTML+='<div style=\"width:55%;float:left\">';
	insertCompany(provider,'furnizor');
	resultHTML+='</div>';
	//client
	resultHTML+='<div style=\"float:right;width:45%;\">';
	insertCompany(client,'client');
	resultHTML+='</div>';
	resultHTML+='</div>';
}

function insertLogo(logo, width, height)
{
	resultHTML+='<div style=\"float:left;width:55%;\"><img src='+logo+' width=\"'+width+'\" height=\"'+height+'\"></div>';
}

function insertTotalBox(total)
{
	resultHTML+='<div style=\"width:45%;background-color:lightgreen;float:right\">';
	resultHTML+='<div style=\"float:left\"><h4>TOTAL PLATA</h4></div><div style=\"float:right\"><h4>'+total.toFixed(2)+' Lei</h4></div>';
	resultHTML+='</div>';
}

function insertCompany(currentCompany, type)
{
	//punem ce ii
	resultHTML+='<u>'+type.toUpperCase()+'</u><br>';
	//incepem lista de identificare
	resultHTML+='<p>';
	resultHTML+='<h3 style=\"padding:0px;margin:0px;padding-bottom:3px;\"><strong>'+currentCompany.name+'</strong></h3>';
	resultHTML+='CIF: '+currentCompany.cif+'<br>';
	resultHTML+='Reg. com.: '+currentCompany.regCom+'<br>';
	resultHTML+='Adresa: '+currentCompany.adress+'<br>';
	resultHTML+='</p>';
}

//face fisier html, nu prea trebuie
function createHtmlFile()
{
	fs.writeFile("factura.html", resultHTML, function(err) {
    if(err) {
        return console.log(err);
    }
	console.log("The file was saved!");
	});
}

//face un server, cred. nu am prea inteles ce fac. in orice caz, genereaza pdf-ul
function createPdfFile()
{
	(async function()
	{
		try
		{
			const browser=await puppeteer.launch();
			const page=await browser.newPage();
			await page.goto(`data:text/html,${resultHTML}`, { waitUntil: 'networkidle0' });
 			await page.pdf(
 			{	
 				path: `Factura.pdf`,
   			 	format: 'A4',
   			 	printBackground: true,
   			 	margin: { 
   			 		left: '10px', 
   			 		top: '4px', 
   			 		right: '10px', 
   			 		bottom: '20px' 
   			 	}
   			});
			console.log('pdf facut');
			await browser.close();
			process.exit();
		}
		catch (e)
		{
			console.log('error', e);
		}
	})();
}



function buildProductTable()
{
	resultHTML+='<div>';
	resultHTML+='<table>';
	buildTableHead();
	buildTableContent();
	buildTableSemiTotal();
	buildTableTotal();
	resultHTML+='</table>';
	resultHTML+='</div>';
}

function buildTableHead()
{
	resultHTML+='<tr class=\"tableHead\">';

	// numarul prod
	resultHTML+='<th style=\"width:5%\">Nr.<br>crt.</th>';
	//numele
	resultHTML+='<th style=\"width:35%\">Denumirea produsului</th>';
	//unitatea de masura
	resultHTML+='<th style=\"width:15%\">U.M.</th>';
	//cantitate de produs
	resultHTML+='<th style=\"width:5%\">Cant.</th>';
	//Pret unitate
	resultHTML+='<th style=\"width:15%\">Pret unitar<br>(fara T.V.A.)-Lei-</th>';
	//valoarea
	resultHTML+='<th style=\"width:12%\">Valoarea<br>-Lei-</th>';
	//valoarea tva
	resultHTML+='<th style=\"width:13%\">Valoarea T.V.A<br>-Lei-</th>';

	resultHTML+='</tr>';
}

function buildTableContent()
{
	//content
	for(var i=0;i<products.length;i++)
	{
		resultHTML+='<tr>';
		//nr crt
		resultHTML+='<td>'+(i+1)+'</td>';
		for(var property1 in products[i])
		{
			if(property1=='tvaCrt'||property1=='netPrice')
				continue;
			var aux=products[i][property1];
			if(typeof aux == 'number')
				aux=aux.toFixed(2);
			resultHTML+='<td>'+aux+'</td>';
		}

		resultHTML+='</tr>';
	}
}

function buildTableSemiTotal()
{
	resultHTML+='<tr>';

	//cine o facut
	resultHTML+='<td colspan=\"3\"style=\"text-align:left;border:none;\">Intocmit de:<br>'+cashier+'</td>';
	//total
	resultHTML+='<td colspan=\"2\"style=\"text-align:left;border:none;background-color:lightgreen;\">Total</td>';
	//punem preturile
	resultHTML+='<td style=\"border:none;text-align:center;background-color:lightgreen;\">'+totalBrut.toFixed(2)+'</td>';
	resultHTML+='<td style=\"border:none;background-color:lightgreen;\">'+totalTva.toFixed(2)+'</td>';

	resultHTML+='</tr>';
}

function buildTableTotal()
{
	resultHTML+='<tr>';
	//semnatura
	resultHTML+='<td colspan=\"3\" style=\"border:none;text-align:center;color:DarkSlateGray;\"><br>Semnatura si stampila<br>furnizorului: </td>';
	resultHTML+='</tr>';
}

function calcTotals()
{
	for(var i=0;i<products.length;i++)
	{
		//console.log(products[i].netPrice);
		total+=products[i].netPrice,totalBrut+=products[i].brutPrice,totalTva+=products[i].tvaTotal;
	}
}

var vCanvas = undefined;
var vContexto = undefined;
var vPlayerX = 10; 
var vPlayerY =10;
var vGridSize = 20;
var vTileCount = 20;
var vAppleX = 15;
var vAppleY= 15;
var vVelocidadX = 0;
var vVelocidadY = 0;
var vSnake =[];
var tail = 5;
var vJugando = false;
var vMovimiento = false;
var jugador = undefined;
var partida = undefined;
var partidas = [];
var relojJuego = undefined;
var puntaje = 0;

var colorCabeza = "orange";
var colorCuerpo = "lime";
var colorManzana =  "red";
var colorPiso = "#033300"


window.onload=function(){
    vCanvas = document.getElementById("canPrincipal");
    vContexto = vCanvas.getContext("2d");
    document.addEventListener("keydown",document_keydown);

    $("#divMsjError").hide();

    $("#btnAbandonar").click(function(){
        gameOver();
    });
    $('input[name="radDificultad"]').on('keydown', function(e){
        e.preventDefault();
    });
    $("#rboDefecto").attr('checked', 'checked');
    $("#btnComenzar").click(nuevoJuego);
    inicializarJuego();

    $('#modNuevoJuego').on('hidden.bs.modal', function (e) {
        if(!vJugando){
            game();
        }
    });

    $("#modGameOver").on('hidden.bs.modal', function (e) {
        vVelocidadX = 0;
        vVelocidadY = 0;
        vSnake = [];
        vPlayerX = 10;
        vPlayerY = 10;
        inicializarJuego();
    });

}

function nuevoJuego(){
    jugador = undefined;
    $("#divMsjError").hide();
    if($("#txtNombreJugador").val() != ""){
        var valido = true;
        if($("#radIronMan").is(":checked")){
            colorCabeza = "orange";
            colorCuerpo = "#8A0808";
            colorManzana = "lime";
            colorPiso = "#171075";
        }
        else if($("#radHulk").is(":checked")){
            colorCabeza = "lime";
            colorCuerpo = "green";
            colorManzana = "red";
            colorPiso = "black";
        }
        else if($("#radCaptain").is(":checked")){
            colorCabeza = "white";
            colorCuerpo = "blue";
            colorManzana = "red";
            colorPiso = "#8A0808";
        }
        else{
            $("#divMsjError").html("<p><strong>Atenci&oacute;n!</strong> Debes seleccionar un skin para tu personaje...");
            $("#divMsjError").show();
            valido = false;
        }
        if(valido){
            jugador = $("#txtNombreJugador").val();
            vJugando = true;
            tail = 5;
            puntaje = 0;
            inicializarJuego();
            $('#modNuevoJuego').modal('hide');
        }
    }
    else{
        $("#divMsjError").html("<p><strong>Atenci&oacute;n!</strong> Debes ingresar un nombre.");
        $("#divMsjError").show();
    }
}

function game (){
    if(!vJugando){
        pausarJuego();
        $('#modNuevoJuego').modal('show');
    } 
    else {
        vPlayerX += vVelocidadX;
        vPlayerY += vVelocidadY;
        espejarParedes();

        vContexto.fillStyle = colorPiso;
        vContexto.fillRect(0,0, vCanvas.width, vCanvas.height);

        vContexto.fillStyle = colorCuerpo;
        for (var i = 0; i < vSnake.length; i++){
            if(i == vSnake.length - 1){
                vContexto.fillStyle = colorCabeza;
            }
            else{
                vContexto.fillStyle = colorCuerpo;
            }
            vContexto.fillRect(vSnake[i].x * vGridSize, vSnake[i].y * vGridSize, vGridSize - 2, vGridSize - 2);
            if(vSnake[i].x == vPlayerX && vSnake[i].y == vPlayerY){
                if(vMovimiento){
                    gameOver();                    
                }
            }
        }
        vSnake.push({x: vPlayerX, y: vPlayerY});
        while(vSnake.length > tail){
            vSnake.shift();
        }
        if(vAppleX == vPlayerX && vAppleY == vPlayerY){
            tail = tail + obtenerDificultad();
            vAppleX = Math.floor(Math.random() * vTileCount);
            vAppleY = Math.floor(Math.random() * vTileCount);
            puntaje++;
        }
        vContexto.fillStyle = colorManzana;
        vContexto.fillRect(vAppleX * vGridSize, vAppleY * vGridSize, vGridSize -2, vGridSize -2);
        $("#puntajeActual").text("Puntaje actual: "  + Number(puntaje));
    }
}

function obtenerDificultad(){  
    return Number($('input[name="radDificultad"]:checked').val());
}

function document_keydown(pEvento){
    if(pEvento.keyCode == 37 || pEvento.keyCode == 38 || pEvento.keyCode == 39 || pEvento.keyCode == 40){
        vMovimiento = true;
        $("#btnAbandonar").focus();
        switch(pEvento.keyCode) {
            case 37:
                if(vVelocidadX != 1){
                    vVelocidadX=-1;vVelocidadY=0;
                }
                break;
            case 38:
                if(vVelocidadY != 1){
                    vVelocidadX=0;vVelocidadY=-1;
                }
                break;
            case 39:
                if(vVelocidadX != -1){
                    vVelocidadX=1;vVelocidadY=0;
                }
                break;
            case 40:
                if(vVelocidadY != -1){
                    vVelocidadX=0;vVelocidadY=1;
                }
                break;
        }
    }
}

function gameOver(){
    pausarJuego();
    vMovimiento = false;
    vJugando = false;
    var vPartida = {puntaje: puntaje, jugador: jugador};
    //alert("Game over: Puntaje: " + vPartida.puntaje);
    var msj = "";
    if(vPartida.puntaje > obtenerMayorPuntaje()){
      msj = "<h3>Felicitaciones, nuevo record!!!</h3><h4>Puntaje: <strong>" + vPartida.puntaje + "</strong></h4>"
    }
    else{
        msj = "<h4>Puntaje: <strong>" + vPartida.puntaje + "</strong></h4>";
    }
    actualizarDatos(vPartida);
    $("#divGameOver").html(msj);
    $("#modGameOver").modal('show');
}

function actualizarDatos(pPartida){
    partidas.push(pPartida);

    var vContador = 0;
    var vTotalPartidas = partidas.length - 1 ;
    var tabla = "";
    while(vContador < 10 && vTotalPartidas - vContador >= 0){
        tabla += "<tr>";
        tabla += "<td>" + partidas[vTotalPartidas - vContador].jugador + "</td>";
        tabla += "<td>" + partidas[vTotalPartidas - vContador].puntaje + "</td>";
        tabla += "</tr>";
        vContador ++;
    }
    $("#tblResultados").html(tabla);
}

function obtenerMayorPuntaje(){
    var vResultado = 0;
    for(var i = 0; i < partidas.length; i++){
        if(vResultado < partidas[i].puntaje){
            vResultado = partidas[i].puntaje;
        }
    }
    return vResultado;
}

function inicializarJuego(){
    relojJuego = setInterval(game, 1000/15);
}

function pausarJuego(){
    clearInterval(relojJuego);
}

function espejarParedes(){
    if(vPlayerX<0) {
        vPlayerX = vTileCount-1;
    }
    if(vPlayerX>vTileCount-1) {
        vPlayerX = 0;
    }
    if(vPlayerY<0) {
        vPlayerY = vTileCount-1;
    }
    if(vPlayerY>vTileCount-1) {
        vPlayerY = 0;
    }
}
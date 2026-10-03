/*========================================
  VERSÃO COM PLAYLIST PERSISTENTE
  - Vídeos guardados por "handle" (File System Access API)
  - Fallback com File para navegadores sem a API
  - Salva só a pasta alterada
========================================*/

/*1. ELEMENTOS DO HTML*/
/*Vídeo principal*/ 
const video = document.querySelector(".video-player");
/*09170546 - CONTROLES DO PLAYER*/
const btnVolume = document.querySelector("#btnVolume");
const controleVolume = document.querySelector("#controleVolume");
const btnRecuar = document.querySelector("#btnRecuar");
const btnAnterior = document.querySelector("#btnAnterior");
const btnProximo = document.querySelector("#btnProximo");
const btnAdiantar = document.querySelector("#btnAdiantar");
const btnPlayPause = document.querySelector("#btnPlayPause");
const barraProgresso = document.querySelector("#barraProgresso");
const tempoAtual = document.querySelector("#tempoAtual");
const tempoTotal = document.querySelector("#tempoTotal");
const btnFullscreen = document.querySelector("#btnFullscreen");
const controleVelocidade = document.querySelector("#controleVelocidade");
const mensagemBloqueio = document.querySelector("#mensagemBloqueio");

/*Pede ao navegador para não apagar os dados salvos*/
if(navigator.storage && navigator.storage.persist){
    navigator.storage.persist();
}

/*09170547 - CONTROLES DE TEMPO*/
/*PLAY / PAUSE*/
btnPlayPause.addEventListener("click", () => {
    // Não faz nada se nenhum vídeo estiver selecionado
    if(!enderecoVideoAtual){
        return;
    }
    // Se existe vídeo, funciona normalmente
    if(video.paused){
        video.play();
    } else {
        video.pause();
    }
});

video.addEventListener("play", () => {
    btnPlayPause.textContent = "⏸";
});

video.addEventListener("pause", () => {
    btnPlayPause.textContent = "▶";
});
/*09170946 - BARRA DE PROGRESSO*/
video.addEventListener("timeupdate", () => {
    if(video.duration){
        barraProgresso.value =
            (video.currentTime / video.duration) * 100;
        tempoAtual.textContent =
            formatarDuracao(video.currentTime);
        tempoTotal.textContent =
            formatarDuracao(video.duration);
    }
});
function formatarDuracao(segundos){
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes =
        Math.floor(segundos % 60);
    return String(minutos).padStart(2, "0") + ":" +
           String(segundosRestantes).padStart(2, "0");
}

/*========================================
  COMANDOS AO TOCAR/CLICAR NO VÍDEO
========================================*/

let ultimoToqueCentro = 0;
let temporizadorToque = null;
let ultimoToqueEsquerda = 0;
let ultimoToqueDireita = 0;

video.addEventListener("pointerup", (evento) => {

    if(playerBloqueado){
        return;
    }

    const agora = Date.now();

    const retangulo = video.getBoundingClientRect();
    const posicaoX = evento.clientX - retangulo.left;
    const larguraVideo = retangulo.width;
    const porcentagem = posicaoX / larguraVideo;

    /* TOQUE À ESQUERDA */
    if(porcentagem < 0.30){

        if(agora - ultimoToqueEsquerda < 300){
            video.currentTime = Math.max(
                0,
                video.currentTime - 20
            );

            ultimoToqueEsquerda = 0;
        }else{
            ultimoToqueEsquerda = agora;
        }

        return;
    }

    /* TOQUE À DIREITA */
    if(porcentagem > 0.70){

        if(agora - ultimoToqueDireita < 300){
            video.currentTime = Math.min(
                video.duration,
                video.currentTime + 20
            );

            ultimoToqueDireita = 0;
        }else{
            ultimoToqueDireita = agora;
        }

        return;
    }

    /* TOQUE NO CENTRO */
    if(agora - ultimoToqueCentro < 300){

        clearTimeout(temporizadorToque);

        ultimoToqueCentro = 0;

        if(document.fullscreenElement){
            document.exitFullscreen();
        }else{
            videoContainer.requestFullscreen();
        }

        return;
    }

    ultimoToqueCentro = agora;

    temporizadorToque = setTimeout(() => {

        if(video.paused){
            video.play();
        }else{
            video.pause();
        }

        ultimoToqueCentro = 0;

    }, 300);
});

document.addEventListener("keydown", (evento) => {

    if(playerBloqueado){
        return;
    }

    /* Não interferir em campos de texto */
    if(
        evento.target.tagName === "INPUT" ||
        evento.target.tagName === "SELECT" ||
        evento.target.tagName === "TEXTAREA"
    ){
        return;
    }

    if(evento.repeat){
        return;
    }

    /* SETA ESQUERDA — RECUAR 20 SEGUNDOS */
    if(evento.key === "ArrowLeft"){
        evento.preventDefault();

        video.currentTime = Math.max(
            0,
            video.currentTime - 20
        );
    }

    /* SETA DIREITA — AVANÇAR 13 SEGUNDOS */
    if(evento.key === "ArrowRight"){
        evento.preventDefault();

        video.currentTime = Math.min(
            video.duration,
            video.currentTime + 13
        );
    }

    /* SETA ACIMA — VÍDEO ANTERIOR */
    if(evento.key === "ArrowUp"){
        evento.preventDefault();

        btnAnterior.click();
    }

    /* SETA ABAIXO — PRÓXIMO VÍDEO */
    if(evento.key === "ArrowDown"){
        evento.preventDefault();

        btnProximo.click();
    }

    /* M — MUDO */
    if(evento.key.toLowerCase() === "m"){

        evento.preventDefault();

        if(video.volume > 0){
            video.volume = 0;
            controleVolume.value = 0;
            btnVolume.textContent = "🔇";
        }else{
            video.volume = 0.2;
            controleVolume.value = 0.2;
            btnVolume.textContent = "🔊";
        }
    }
});

barraProgresso.addEventListener("input", () => {
    if(video.duration){
        video.currentTime =
            (barraProgresso.value / 100) * video.duration;
    }
});
/*Recuar 15 segundos*/
btnRecuar.addEventListener("click", () => {
    video.currentTime -= 15;
});
/*Adiantar 10 segundos*/
btnAdiantar.addEventListener("click", () => {
    video.currentTime += 10;
});
/*CONTROLE DE VOLUME*/
controleVolume.addEventListener("input", () => {
    video.volume = controleVolume.value;

    if(video.volume === 0){
        btnVolume.textContent = "🔇";
    }else{
        btnVolume.textContent = "🔊";
    }
});
/*BOTÃO VOLUME*/
btnVolume.addEventListener("click", () => {
    if(video.volume > 0){
        video.volume = 0;
        controleVolume.value = 0;
        btnVolume.textContent = "🔇";
    }else{
        video.volume = 0.2;
        controleVolume.value = 0.2;
        btnVolume.textContent = "🔊";
    }
});

/*0920 - CONTROLES DE NAVEGAÇÃO*/
/*Próximo vídeo*/
btnProximo.addEventListener("click", () => {
    /* Verifica se existe uma pasta selecionada */
    if(!pastaSelecionada){
        return;
    }
    /* Verifica se existe um vídeo selecionado */
    if(!videoPlaylistSelecionado){
        return;
    }
    /* Descobre a posição do vídeo atual */
    const indiceAtual = pastaSelecionada.videos.indexOf(videoPlaylistSelecionado);
    /* Calcula o próximo vídeo */
    const proximoIndice = indiceAtual + 1;
    /* Verifica se existe um próximo vídeo */
    if(proximoIndice >= pastaSelecionada.videos.length){
        return;
    }
    // Seleciona o próximo vídeo na lista
    const proximoVideo = pastaSelecionada.videos[proximoIndice];
    carregarVideoPlaylist(proximoVideo);
});

/* Vídeo anterior */
btnAnterior.addEventListener("click", () => {

    /* Verifica se existe uma pasta selecionada */
    if(!pastaSelecionada){
        return;
    }

    /* Verifica se existe um vídeo selecionado */
    if(!videoPlaylistSelecionado){
        return;
    }

    /* Descobre a posição do vídeo atual */
    const indiceAtual =
        pastaSelecionada.videos.indexOf(videoPlaylistSelecionado);

    /* Calcula o vídeo anterior */
    const anteriorIndice = indiceAtual - 1;

    /* Verifica se existe um vídeo anterior */
    if(anteriorIndice < 0){
        return;
    }

    /* Seleciona o vídeo anterior */
    const videoAnterior = pastaSelecionada.videos[anteriorIndice];
    carregarVideoPlaylist(videoAnterior);
});

/* TELA CHEIA */
const videoContainer = document.querySelector(".video-container");
btnFullscreen.addEventListener("click", async () => {

    try {

        if(document.fullscreenElement){

            await document.exitFullscreen();

        }else{

            await videoContainer.requestFullscreen({
                navigationUI: "hide"
            });

        }

    } catch(erro) {

        console.error(
            "Erro no fullscreen:",
            erro
        );

    }

});
let temporizadorControles = null;

/* ESCONDER BARRA EM FULLSCREEN */
function esconderControlesFullscreen(){
    if(!document.fullscreenElement){
        return;
    }
    clearTimeout(temporizadorControles);
    temporizadorControles = setTimeout(() => {
        document.querySelector(".barra-controles").style.opacity = "0";
    }, 5000);
}

/* MOSTRAR CONTROLES AO MOVIMENTAR O MOUSE */
videoContainer.addEventListener("mousemove", () => {
    if(!document.fullscreenElement){
        return;
    }
    document.querySelector(".barra-controles").style.opacity = "1";
    esconderControlesFullscreen();
});

/*========================================
  DESLIZAR PARA MOSTRAR A BARRA
========================================*/

let inicioArrasteX = 0;
let inicioArrasteY = 0;
let arrastandoFullscreen = false;

videoContainer.addEventListener("pointerdown", (evento) => {

    /* Só interessa quando estiver em fullscreen */
    if(!document.fullscreenElement){
        return;
    }

    const barra =
        document.querySelector(".barra-controles");

    /* Só interessa quando a barra estiver escondida */
    if(barra.style.opacity !== "0"){
        return;
    }

    inicioArrasteX = evento.clientX;
    inicioArrasteY = evento.clientY;

    arrastandoFullscreen = true;
});


videoContainer.addEventListener("pointerup", (evento) => {

    if(!arrastandoFullscreen){
        return;
    }

    arrastandoFullscreen = false;

    /* Só interessa quando estiver em fullscreen */
    if(!document.fullscreenElement){
        return;
    }

    const barra =
        document.querySelector(".barra-controles");

    /* Calcula o deslocamento */
    const deslocamentoX =
        Math.abs(evento.clientX - inicioArrasteX);

    const deslocamentoY =
        Math.abs(evento.clientY - inicioArrasteY);

    const distanciaMinima = 30;

    /* Verifica se realmente houve deslize */
    if(
        deslocamentoX >= distanciaMinima ||
        deslocamentoY >= distanciaMinima
    ){

        /* Mostra a barra */
        barra.style.opacity = "1";

        /* Reinicia o temporizador */
        esconderControlesFullscreen();

        /* Impede que o gesto seja tratado como toque normal */
        evento.stopPropagation();
    }

});

/* CONTROLE DO FULLSCREEN */
document.addEventListener("fullscreenchange", () => {
    if(document.fullscreenElement){
        document.querySelector(".barra-controles").style.opacity = "1";
        esconderControlesFullscreen();
    }else{
        clearTimeout(temporizadorControles);
        document.querySelector(".barra-controles").style.opacity = "1";
    }
});

/*09170852 - VELOCIDADE DO VÍDEO */
controleVelocidade.addEventListener("change", () => {
    video.playbackRate = Number(controleVelocidade.value);
});

/*========================================
  OBTER O ARQUIVO DE UM VÍDEO DA PLAYLIST
  - Se o vídeo foi guardado com "handle", pede
    permissão de leitura (se necessário) e lê o arquivo.
  - Se foi guardado com "arquivo" (fallback), usa direto.
========================================*/
async function obterArquivo(item){
    if(item.handle){
        try{
            let permissao =
                await item.handle.queryPermission({ mode: "read" });

            if(permissao !== "granted"){
                permissao =
                    await item.handle.requestPermission({ mode: "read" });
            }

            if(permissao !== "granted"){
                return null;
            }

            return await item.handle.getFile();

        }catch(erro){
            console.error("Erro ao acessar o arquivo:", erro);
            alert(
                "Não foi possível abrir '" + item.nomePlaylist +
                "'. O arquivo pode ter sido movido, renomeado ou apagado."
            );
            return null;
        }
    }

    return item.arquivo || null;
}

/*09161711-Endereço temporário do vídeo atual*/
let enderecoVideoAtual = null;

async function carregarVideoPlaylist(videoSelecionado){
    if(!videoSelecionado){
        return;
    }

    const arquivo = await obterArquivo(videoSelecionado);

    if(!arquivo){
        return;
    }

    videoPlaylistSelecionado = videoSelecionado;

    marcarVideoSelecionado();

    if(enderecoVideoAtual){
        URL.revokeObjectURL(enderecoVideoAtual);
    }

    enderecoVideoAtual = URL.createObjectURL(arquivo);

    video.src = enderecoVideoAtual;
    video.load();
    video.play().catch(() => {});
}

/*0922 PASSAR AUTOMATICAMENTE PARA O PRÓXIMO VÍDEO */
video.addEventListener("ended", () => {

    /* Verifica se existe uma pasta selecionada */
    if(!pastaSelecionada){
        return;
    }

    /* Verifica se existe um vídeo selecionado */
    if(!videoPlaylistSelecionado){
        return;
    }

    /* Descobre a posição do vídeo atual */
    const indiceAtual =
        pastaSelecionada.videos.indexOf(videoPlaylistSelecionado);

    /* Calcula o próximo vídeo */
    const proximoIndice = indiceAtual + 1;

    /* Verifica se existe um próximo vídeo */
    if(proximoIndice >= pastaSelecionada.videos.length){
        return;
    }

    /* Carrega e reproduz o próximo vídeo */
    const proximoVideo = pastaSelecionada.videos[proximoIndice];
    carregarVideoPlaylist(proximoVideo);
});

/*Tela de Login*/
const telaLogin = document.querySelector(".login");

/*Campo Usuário*/
const campoUsuario = document.querySelector("#usuario");

/*Botão LOGAR*/
const btnLogin = document.querySelector("#btnLogin");

/*Número mostrado pelo cronômetro*/
const tempo = document.querySelector("#tempo");

/*Tela de bloqueio*/
const telaBloqueio = document.querySelector(".bloqueio");

/*Campo da senha de desbloqueio*/
const campoSenhaDesbloqueio = document.querySelector("#senhaDesbloqueio");

/*Botão DESBLOQUEAR*/
const btnDesbloquear = document.querySelector("#btnDesbloquear");

/*2. CONFIGURAÇÕES*/
// Senha utilizada para cancelar o bloqueio
const SENHA_BLOQUEIO = "admin";

// Tempo do primeiro cronômetro
// 2 horas m(1) * d(1) * h(2) * min(60) * seg(60)
const TEMPO_INICIAL = 1*30*24  *     60  *     60;

// Tempo do segundo cronômetro
// 2 horas m(1) * d(1) * h(2) * min(60) * seg(60)
const TEMPO_BLOQUEIO = 1 * 2  *     58  *     63;

/*3. CONTROLE DOS CRONÔMETROS*/
// Guarda intervalo do primeiro cronômetro
let intervaloInicial = null;

// Guarda intervalo do segundo cronômetro
let intervaloBloqueio = null;

// Guarda os segundos do primeiro cronômetro
let segundosInicial = TEMPO_INICIAL;

// Guarda os segundos do segundo cronômetro
let segundosBloqueio = TEMPO_BLOQUEIO;

// Indica se o primeiro ciclo já foi iniciado.
let primeiroCicloIniciado = false;  

// Indica se o vídeo está realmente bloqueado.
let playerBloqueado = false;

/*4. ESTADO INICIAL DO APLICATIVO*/

// A tela de bloqueio começa escondida
telaBloqueio.style.display = "none";

// Volume inicial do vídeo: 20%
video.volume = 0.2;

// O vídeo começa pausado
video.pause();

// Coloca o cursor no campo Usuário
campoUsuario.focus();

/*5. LOGAR*/
btnLogin.addEventListener("click", () => {
    // Esconde a tela de Login
    telaLogin.style.display = "none";
    // Coloca o cursor no vídeo
    video.focus();
});

/*7. PRIMEIRO CRONÔMETRO*/
function iniciarCronometroInicial(){
    // Evita criar dois cronômetros ao mesmo tempo
    clearInterval(intervaloInicial);

    // Começa novamente com 10 segundos
    segundosInicial = TEMPO_INICIAL;

    // Cria uma contagem que acontece a cada 1 segundo
    intervaloInicial = setInterval(() => {

        // Diminui 1 segundo
        segundosInicial--;

        // Quando chegar a zero
        if(segundosInicial <= 0){

            // Para o cronômetro
            clearInterval(intervaloInicial);

            // Limpa a variável
            intervaloInicial = null;

            // Mostra a tela de aviso
            iniciarTelaBloqueio();
        }

    }, 1000);
}


/*8. QUANDO VÍDEO COMEÇA A REPRODUZIR*/
video.addEventListener("play", () => {

    // Se o vídeo estiver realmente bloqueado,
    // impede a reprodução.
    if(playerBloqueado){
        video.pause();
        return;
    }

    // Se o primeiro ciclo já foi iniciado,
    // não inicia outro cronômetro.
    if(primeiroCicloIniciado){
        return;
    }

    // Marca que o primeiro ciclo começou.
    primeiroCicloIniciado = true;

    // Inicia o primeiro cronômetro.
    iniciarCronometroInicial();
});


/*9. MOSTRAR TELA DE AVISO*/
function iniciarTelaBloqueio(){

    // IMPORTANTE:
    // Neste momento o vídeo NÃO está bloqueado.
    playerBloqueado = false;

    // O vídeo continua reproduzindo.

    // Mostra a tela de aviso
    telaBloqueio.style.display = "flex";

    // Mensagem do período de aviso
    mensagemBloqueio.textContent =
        "O VÍDEO SERÁ PAUSADO APÓS";

    // Inicia o segundo cronômetro
    iniciarCronometroBloqueio();

    // Coloca o cursor diretamente no campo da senha
    campoSenhaDesbloqueio.focus();
}


/*10. SEGUNDO CRONÔMETRO*/
function iniciarCronometroBloqueio(){

    // Cancela qualquer contagem anterior
    clearInterval(intervaloBloqueio);

    // Começa novamente em 15 segundos
    segundosBloqueio = TEMPO_BLOQUEIO;

    // Mostra a tela de aviso
    telaBloqueio.style.display = "flex";

    // Mostra imediatamente 15
    tempo.textContent = formatarTempo(segundosBloqueio);

    // Cria a contagem de 1 em 1 segundo
    intervaloBloqueio = setInterval(() => {

        // Diminui 1 segundo
        segundosBloqueio--;

        // Atualiza o número na tela
        tempo.textContent = formatarTempo(segundosBloqueio);

        // Quando chegar a zero
        if(segundosBloqueio <= 0){

            // Para o cronômetro
            clearInterval(intervaloBloqueio);

            // Limpa a variável
            intervaloBloqueio = null;

            // Agora sim bloqueia o vídeo
            bloquearVideo();
        }

    }, 1000);
}


/*11. FORMATAÇÃO DO TEMPO*/
function formatarTempo(segundos){

    const horas = Math.floor(segundos / 3600);

    const minutos = Math.floor((segundos % 3600) / 60);

    const segundosRestantes = segundos % 60;

    return (
        String(horas).padStart(2, "0") + ":" +
        String(minutos).padStart(2, "0") + ":" +
        String(segundosRestantes).padStart(2, "0")
    );
}


/*12. DESBLOQUEAR / CANCELAR BLOQUEIO*/
btnDesbloquear.addEventListener("click", () => {

    // Verifica se a senha digitada está correta
    if(campoSenhaDesbloqueio.value !== SENHA_BLOQUEIO){

        // Senha incorreta mantém a tela aberta
        campoSenhaDesbloqueio.focus();

        return;
    }

    // Para o segundo cronômetro
    clearInterval(intervaloBloqueio);
    intervaloBloqueio = null;

    // Esconde a tela
    telaBloqueio.style.display = "none";

    // Limpa o campo da senha
    campoSenhaDesbloqueio.value = "";

    // Libera o vídeo
    playerBloqueado = false;

    // Reinicia o ciclo de proteção de 10 segundos
    iniciarCronometroInicial();

    // Se o vídeo estava pausado pelo bloqueio,
    // retoma a reprodução.
    if(video.paused){
        video.play();
    }
});


/*13. BLOQUEAR O VÍDEO*/
function bloquearVideo(){

    // Agora o vídeo está realmente bloqueado
    playerBloqueado = true;

    // Pausa o vídeo
    video.pause();

    // Altera a mensagem
    mensagemBloqueio.textContent =
        "VÍDEO PAUSADO. DIGITE A SENHA PARA RETOMAR";

    // Mantém a tela de bloqueio visível
    telaBloqueio.style.display = "flex";

    // O cronômetro não deve mais ficar contando
    tempo.textContent = "00";

    // Garante que o campo da senha esteja disponível
    campoSenhaDesbloqueio.focus();
}

/*14. ENTER PARA DESBLOQUEAR*/
campoSenhaDesbloqueio.addEventListener("keydown", (evento) => {
    if(evento.key === "Enter"){
        btnDesbloquear.click();
    }
});

/*09171407 - ========================================
PLAYLIST — PASTAS
========================================*/
/* ELEMENTOS DA PLAYLIST */
const btnNovaPasta = document.querySelector("#btnNovaPasta");
const listaPastas = document.querySelector("#listaPastas");
/* GUARDA AS PASTAS */
let pastas = [];

/* PASTA ATUALMENTE SELECIONADA */
let pastaSelecionada = null;

/* VÍDEO ATUALMENTE SELECIONADO */
let videoPlaylistSelecionado = null;

/*========================================
  BANCO DE DADOS DA PLAYLIST
========================================*/
let bancoPlaylist = null;
let bancoPlaylistPronto = false;
const requestBanco = indexedDB.open("ProjetoVideo20", 1);

requestBanco.onupgradeneeded = (evento) => {
    const banco = evento.target.result;
    banco.createObjectStore("playlist", {
        keyPath: "id"
    });
};

requestBanco.onsuccess = (evento) => {
    bancoPlaylist = evento.target.result;
    bancoPlaylistPronto = true;
    console.log("Banco da playlist aberto.");
    /* carregarPlaylist() também salva o que foi criado
       antes de o banco ficar pronto */
    carregarPlaylist();
};

requestBanco.onerror = () => {
    console.error("Erro ao abrir o banco da playlist.");
};

/*========================================
  SALVAR PLAYLIST
========================================*/
/* Salva UMA pasta (a que foi alterada) */
function salvarPasta(pasta){
    if(!bancoPlaylistPronto){
        /* Será salva por carregarPlaylist() quando o banco abrir */
        return;
    }

    const transacao =
        bancoPlaylist.transaction("playlist", "readwrite");

    transacao.objectStore("playlist").put(pasta);

    transacao.oncomplete = () => {
        console.log("Pasta salva com sucesso:", pasta.nome);
    };

    transacao.onerror = () => {
        console.error("Erro ao salvar a pasta:", transacao.error);
    };

    transacao.onabort = () => {
        console.error("Transação abortada:", transacao.error);
        alert(
            "Não foi possível salvar a playlist. " +
            "Veja o console (F12) para mais detalhes."
        );
    };
}

/* Salva TODAS as pastas (usado só na inicialização) */
function salvarPlaylist(){
    if(!bancoPlaylistPronto){
        return;
    }

    pastas.forEach((pasta) => {
        salvarPasta(pasta);
    });
}

/*========================================
  CARREGAR PLAYLIST
========================================*/
function carregarPlaylist(){
    if(!bancoPlaylist){
        return;
    }
    const transacao =
        bancoPlaylist.transaction("playlist", "readonly");
    const loja =
        transacao.objectStore("playlist");
    const consulta = loja.getAll();
    consulta.onsuccess = () => {
        const doBanco = consulta.result;

        /* Pastas criadas antes de o banco abrir
           não podem ser perdidas */
        const idsBanco = new Set(doBanco.map((p) => p.id));
        const pendentes = pastas.filter((p) => !idsBanco.has(p.id));

        pastas = doBanco.concat(pendentes);

        mostrarPastas();

        pendentes.forEach((pasta) => {
            salvarPasta(pasta);
        });

        console.log(
            "Playlist carregada:",
            pastas
        );
    };
    consulta.onerror = () => {
        console.error("Erro ao carregar a playlist:", consulta.error);
    };
}

/* CRIAR NOVA PASTA */
btnNovaPasta.addEventListener("click", () => {
/* Pede o nome da pasta */
const nomePasta = prompt("Digite o nome da pasta:");

/* Se o usuário cancelar ou não digitar nada, não cria */
if(!nomePasta){
    return;
}

/* Cria a nova pasta */
const novaPasta = {
    id: Date.now(),
    nome: nomePasta,
    videos: []
};
/* Guarda a pasta */
pastas.push(novaPasta);
/* Salva no banco de dados */
salvarPasta(novaPasta);
/* Mostra as pastas na tela */
mostrarPastas();
});

/*09171426 - MOSTRAR AS PASTAS */
function mostrarPastas(){
/* Limpa a lista */
listaPastas.innerHTML = "";
/* Percorre todas as pastas */
pastas.forEach((pasta) => {
    /* BOTÃO DA PASTA */
    const elementoPasta = document.createElement("button");
    elementoPasta.textContent = "📁 " + pasta.nome;
    /* Selecionar a pasta */
    elementoPasta.addEventListener("click", () => {
        /* Guarda a pasta selecionada */
        pastaSelecionada = pasta;
        videoPlaylistSelecionado = null;
        /* Mostra o nome da pasta */
        document.querySelector("#nomePastaSelecionada").textContent =
            pasta.nome;
        mostrarVideosPlaylist();
    });
    /* BOTÃO RENOMEAR */
    const btnRenomear = document.createElement("button");
    btnRenomear.textContent = "✏️";
    btnRenomear.title = "Renomear pasta";
    btnRenomear.addEventListener("click", (evento) => {
        evento.stopPropagation();
        const novoNome = prompt(
            "Digite o novo nome da pasta:",
            pasta.nome
        );
        if(!novoNome){
            return;
        }

        pasta.nome = novoNome;

        salvarPasta(pasta);

        if(pastaSelecionada === pasta){
            document.querySelector("#nomePastaSelecionada").textContent = novoNome;
        }
        mostrarPastas();
    });
    /*BOTÃO EXCLUIR*/
    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "🗑️";
    btnExcluir.title = "Excluir Pasta";
    btnExcluir.addEventListener("click", (evento) => {

        /* Impede que o clique seja propagado para a pasta */
        evento.stopPropagation();
        const confirmar = confirm(
            "Deseja excluir a pasta '" + pasta.nome + "'?"
        );
        if(!confirmar){
            return;
        }

        /* Remove a pasta do banco */
        const transacao =
            bancoPlaylist.transaction("playlist", "readwrite");

        transacao.objectStore("playlist").delete(pasta.id);

        transacao.oncomplete = () => {
            console.log("Pasta excluída e removida do banco.");
        };

        transacao.onerror = () => {
            console.error(
                "Erro ao excluir pasta:",
                transacao.error
            );
        };

        /* Remove a pasta do array */
        pastas = pastas.filter((item) => {
            return item.id !== pasta.id;
        });

        /* Se a pasta excluída estava selecionada,
           volta para a mensagem inicial */
        if(pastaSelecionada === pasta){
            document.querySelector("#nomePastaSelecionada").textContent =
                "SELECIONE UMA PASTA";
            pastaSelecionada = null;
            videoPlaylistSelecionado = null;
            video.pause();
            video.removeAttribute("src");
            video.load();
            mostrarVideosPlaylist();
        }

        /* Atualiza imediatamente a lista */
        mostrarPastas();
    });

    /* CONTAINER DA PASTA */
    const itemPasta = document.createElement("div");
    itemPasta.appendChild(elementoPasta);
    itemPasta.appendChild(btnRenomear);
    itemPasta.appendChild(btnExcluir);
    /* Coloca o item na lista */
    listaPastas.appendChild(itemPasta);
});
}

/*========================================
  PLAYLIST — ADICIONAR VÍDEOS
========================================*/
/* BOTÃO ADICIONAR VÍDEOS */
const btnAdicionarVideos =
    document.querySelector("#btnAdicionarVideos");
const seletorPasta = 
    document.querySelector("#seletorPasta");

/* ABRIR SELETOR DE VÍDEOS */
btnAdicionarVideos.addEventListener("click", async () => {

    /* Verifica se existe uma pasta selecionada */
    if(!pastaSelecionada){
        alert("Primeiro selecione uma pasta.");
        return;
    }

    /* Navegador sem File System Access API (ex.: Firefox, Safari):
       usa o seletor antigo, que guarda o arquivo no banco */
    if(!window.showOpenFilePicker){
        seletorPasta.click();
        return;
    }

    let handles;

    try{
        handles = await window.showOpenFilePicker({
            multiple: true,
            types: [{
                description: "Vídeos",
                accept: {
                    "video/*": [
                        ".mp4", ".mkv", ".webm",
                        ".mov", ".avi", ".m4v"
                    ]
                }
            }]
        });
    }catch(erro){
        /* Usuário cancelou a seleção */
        return;
    }

    for(const handle of handles){

        const arquivo = await handle.getFile();

        const videoJaExiste = pastaSelecionada.videos.some(
            (item) => item.nome === arquivo.name
        );

        if(videoJaExiste){
            continue;
        }

        pastaSelecionada.videos.push({
            id: Date.now() + Math.random(),
            nome: arquivo.name,
            nomePlaylist: arquivo.name,
            handle: handle   /* referência ao arquivo no disco */
        });
    }

    /* Salva a pasta no banco de dados */
    salvarPasta(pastaSelecionada);
    mostrarVideosPlaylist();
});

/* RECEBER VÍDEOS SELECIONADOS (fallback sem File System Access API) */
seletorPasta.addEventListener("change", () => {
    /* Verifica se existe uma pasta selecionada */
    if(!pastaSelecionada){
        alert("Primeiro selecione uma pasta.");
        return;
    }
    /* Pega os vídeos selecionados */
    const videosSelecionados =
        Array.from(seletorPasta.files);

    /* Adiciona os vídeos à pasta */
    videosSelecionados.forEach((arquivo) => {
        if(arquivo.type.startsWith("video/")){

            const videoJaExiste = pastaSelecionada.videos.some(
                (item) => item.nome === arquivo.name
            );

            if(videoJaExiste){
                return;
            }

            pastaSelecionada.videos.push({
                id: Date.now() + Math.random(),
                nome: arquivo.name,
                nomePlaylist: arquivo.name,
                arquivo: arquivo
            });
        }
    });

    /* Salva a pasta no banco de dados */
    salvarPasta(pastaSelecionada);
    seletorPasta.value = "";
    mostrarVideosPlaylist();
});

function marcarVideoSelecionado(){
    const itens =
        document.querySelectorAll("#listaPlaylistVideos > div");
    itens.forEach((item) => {
        const nomeVideo = item.querySelector("span");
        if(!nomeVideo){
            return;
        }
        if(videoPlaylistSelecionado &&
           nomeVideo.dataset.videoId ==
           videoPlaylistSelecionado.id){
            nomeVideo.classList.add("video-ativo");
        }else{
            nomeVideo.classList.remove("video-ativo");
        }
    });
} 

/*========================================
  MOSTRAR VÍDEOS DA PASTA
========================================*/
function mostrarVideosPlaylist(){
    /* Limpa a lista */
    const lista = document.querySelector("#listaPlaylistVideos");
    lista.innerHTML = "";
    /* Verifica se existe uma pasta selecionada */
    if(!pastaSelecionada){
        return;
    }
    /* Percorre os vídeos da pasta */
    pastaSelecionada.videos.forEach((videoPlaylist, indice) => {
        /* CONTAINER DO VÍDEO */
        const itemVideo = document.createElement("div");
        /* Permite arrastar o vídeo */
        itemVideo.draggable = true;
        /* NOME DO VÍDEO */
        const nomeVideo = document.createElement("span");

        nomeVideo.textContent =
            videoPlaylist.nomePlaylist;

        nomeVideo.dataset.videoId = videoPlaylist.id;
        /* CLIQUE NO NOME DO VÍDEO */
        nomeVideo.addEventListener("click", () => {
            carregarVideoPlaylist(videoPlaylist);
        });
        /* BOTÃO RENOMEAR */
        const btnRenomearVideo = document.createElement("button");
        btnRenomearVideo.textContent = "✏️";
        btnRenomearVideo.title = "Renomear vídeo";
        btnRenomearVideo.addEventListener("click", (evento) => {
            evento.stopPropagation();
            const novoNome = prompt(
                "Digite o novo nome do vídeo:",
                videoPlaylist.nomePlaylist
            );
            if(!novoNome){
                return;
            }
            /* Altera o nome somente na playlist */
            videoPlaylist.nomePlaylist = novoNome;

            salvarPasta(pastaSelecionada);

            nomeVideo.textContent = novoNome;
            marcarVideoSelecionado();
        });
        /* BOTÃO EXCLUIR */
        const btnExcluirVideo = document.createElement("button");
        btnExcluirVideo.textContent = "🗑️";
        btnExcluirVideo.title = "Excluir vídeo da playlist";
        btnExcluirVideo.addEventListener("click", (evento) => {
            evento.stopPropagation();
            const confirmar = confirm(
                "Deseja excluir o vídeo '" +
                videoPlaylist.nomePlaylist +
                "' da playlist?"
            );
            if(!confirmar){
                return;
            }
            /* Remove o vídeo da pasta */
            if(videoPlaylistSelecionado === videoPlaylist){
                videoPlaylistSelecionado = null;
                if(enderecoVideoAtual){
                    URL.revokeObjectURL(enderecoVideoAtual);
                    enderecoVideoAtual = null;
                }
                video.pause();
                video.removeAttribute("src");
                video.load();
            }
            pastaSelecionada.videos.splice(indice, 1);

            salvarPasta(pastaSelecionada);

            mostrarVideosPlaylist();
        });

        /*========================================
          ARRASTAR VÍDEO PARA MUDAR A POSIÇÃO
        ========================================*/
        itemVideo.addEventListener("dragstart", (evento) => {
            evento.dataTransfer.setData(
                "text/plain",
                videoPlaylist.id
            );
            itemVideo.classList.add("arrastando");
        });

        itemVideo.addEventListener("dragend", () => {
            itemVideo.classList.remove("arrastando");
        });

        itemVideo.addEventListener("dragover", (evento) => {
            evento.preventDefault();
        });

        itemVideo.addEventListener("drop", (evento) => {

            evento.preventDefault();

            const idArrastado =
                Number(evento.dataTransfer.getData("text/plain"));

            const indiceOrigem =
                pastaSelecionada.videos.findIndex(
                    (item) => item.id === idArrastado
                );

            const indiceDestino =
                pastaSelecionada.videos.findIndex(
                    (item) => item.id === videoPlaylist.id
                );

            if(indiceOrigem === -1 || indiceDestino === -1){
                return;
            }

            /* Retira o vídeo da posição antiga */
            const videoMovido =
                pastaSelecionada.videos.splice(indiceOrigem, 1)[0];

            /* Coloca o vídeo na nova posição */
            pastaSelecionada.videos.splice(
                indiceDestino,
                0,
                videoMovido
            );

            /* Salva a nova ordem */
            salvarPasta(pastaSelecionada);

            mostrarVideosPlaylist();
            marcarVideoSelecionado();
        });

        /* MONTA O ITEM */
        itemVideo.appendChild(nomeVideo);
        itemVideo.appendChild(btnRenomearVideo);
        itemVideo.appendChild(btnExcluirVideo);

        /* COLOCA NA LISTA */
        lista.appendChild(itemVideo);
    });

    /* Mantém o vídeo em reprodução destacado */
    marcarVideoSelecionado();
}
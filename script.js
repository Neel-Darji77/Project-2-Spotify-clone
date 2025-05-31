console.log("Hilo woold")
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let responce = await a.text()
    let div = document.createElement("div")
    div.innerHTML = responce
    let as = div.getElementsByTagName("a")
    // console.log(as);
    
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        }) 
    })
    
    return songs
}

const playMusic = (track, pause=false)=>{
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlumbs() {
    let a = await fetch(`/songs/`);
    let responce = await a.text()
    let div = document.createElement("div")
    div.innerHTML = responce
    // console.log(div)
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        console.log(e.href);
        
            
        if(e.href.includes("/songs") && !e.href.endsWith(".htaccess.txt")){
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let responce = await a.json()
            // console.log(responce);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${responce.title}</h2>
                        <p>${responce.description}</p>
                    </div>`;
            
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
    
}

async function main(){
    // Get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlumbs()

    //Attach an event listener to play, next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for Time update event
    currentSong.addEventListener("timeupdate", ()=>{
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent)/100
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener for previous and next

    previous.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);

        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })

    next.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
                
    })

    // Add an event listener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e=>{
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume > 0){
            document.querySelector(".volume").getElementsByTagName("img")[0].src = document.querySelector(".volume").getElementsByTagName("img")[0].src.replace("mute.svg", "volume.svg")
        }
    })

    // Add an event listener for mute the track
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", (e)=>{
        // currentSong.volume = 0;
        // document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg"
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value =  0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .20;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20
        }
    })

}

main()
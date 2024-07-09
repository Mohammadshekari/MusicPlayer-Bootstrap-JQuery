let songQS = $('#app-player li.song .play-btn');
let $firstSong = songQS.first();
let $cover = $('#app-player .player-box .cover');

function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}
const getFav = () => {
    let fav = localStorage.getItem('fav')
    if (!fav || fav.length < 1) {
        localStorage.setItem('fav', '')
        return []
    }
    return fav.split(',')
}
const isFav = (id) => {
    id = id.toString()
    let fav = getFav()
    return fav.includes(id)
}
const addFav = (song_id) => {
    let fav = getFav()
    if (fav && typeof fav === typeof []) {
        fav.push(song_id)
    } else {
        fav = [song_id]
    }
    localStorage.setItem('fav', fav.join(','))
}
const remFav = (song_id) => {
    let fav = getFav()
    if (fav && typeof fav === typeof []) {
        fav = removeItemAll(fav, song_id)
        localStorage.setItem('fav', fav.join(','))
    } else {
        fav = []
        localStorage.setItem('fav', '')
    }
}
let playerData = {
    current: {
        'id': $firstSong.attr('data-id'),
        'url': $firstSong.attr('data-url'),
        'cover': $firstSong.attr('data-cover'),
        'name': $firstSong.attr('data-name'),
    },
    songs: [],
    songIDs: [],
    loading: false,
    player: new Audio(),
    fav: getFav(),
    isPlaying: false,
    currentlyTimer: "00:00",
    isStarted: false,
    index: 0
};
songQS.each(function (e) {
    playerData.songs.push({
        'id': $(this).attr('data-id'),
        'url': $(this).attr('data-url'),
        'cover': $(this).attr('data-cover'),
        'name': $(this).attr('data-name'),
    })
})
songQS.each(function (e) {
    playerData.songIDs.push($(this).attr('data-id'))
})
songQS.click(function (e) {
    playerData.current.isPlaying = false;
    playerData.isPlaying = false;
    playerData.current.percent = 0;
    playerData.index = playerData.songIDs.indexOf($(this).attr('data-id'))
    updateState();
    setCurrentSong();
})
const timerStart = document.querySelector('#app-player .timer .start'),
    timerEnd = document.querySelector('#app-player .timer .end'),
    timerProgress = document.querySelector('#app-player .progress-bar-wrapper'),
    playBtn = document.querySelector('#app-player .play'),
    pauseBtn = document.querySelector('#app-player .pause'),
    loadingDiv = document.querySelector('#app-player .player')
const formatTimer = seconds => {
    let minutes = parseInt(seconds / 60).toString();
    seconds = parseInt(seconds % 60).toString();
    let output = minutes >= 10 ? `${minutes}` : `0${minutes}`;
    output += seconds >= 10 ? `:${seconds}` : `:0${seconds}`;
    if (output.includes('NaN'))
        return 0
    return output;
};
const deleteElement = (array, target) => {
    return array.filter(item => {
        return item != target;
    });
};
const threatSongs = songs => {
    return songs.map(song => {
        song["isPlaying"] = false;
        song["percent"] = 0;
        song["currentlyTimer"] = "00:00";
        song["totalTimer"] = formatTimer(song.seconds || 1);

        return song;
    });
};
const updateState = () => {
    timerStart.innerHTML = playerData.start
    timerProgress.style.width = playerData.current.percent + '%';
    playBtn.classList.add('d-none')
    pauseBtn.classList.add('d-none')
    if (playerData.isPlaying) {
        pauseBtn.classList.remove('d-none')
    } else {
        playBtn.classList.remove('d-none')
    }
    if (playerData.loading) {
        loadingDiv.classList.add('loading')
    } else {
        loadingDiv.classList.remove('loading')
    }
    if (playerData.current) {
        if ($cover.attr('src') !== playerData.current.cover)
            $cover.attr('src', playerData.current.cover)
        if (playerData.current.currentlyTimer) {
            timerStart.innerHTML = playerData.current.currentlyTimer
        } else {
            timerStart.innerHTML = '0:00'
        }
        if (playerData.current.totalTimer) {
            timerEnd.innerHTML = playerData.current.totalTimer
        } else {
            timerEnd.innerHTML = '0:00'
        }
        $('#app-player .player-box .song-title').html(playerData.current.name)
        $('#app-player .player-box .artist').html(playerData.current.artist)
    }

}
listenersWhenPlay = () => {
    playerData.player.addEventListener("timeupdate", () => {
        var playerTimer = playerData.player.currentTime;
        playerData.current.totalTimer = formatTimer(playerData.player.duration);
        playerData.current.currentlyTimer = formatTimer(playerTimer);
        playerData.current.percent = (playerTimer * 100) / playerData.player.duration;
        try {
            playerData.start = playerData.player.buffered.start(0)
            playerData.end = playerData.player.buffered.end(0)
        } catch (e) {
            playerData.start = 0
            playerData.end = 0
        }
        updateState()
    });
    playerData.player.addEventListener(
        "ended",
        function () {
            next();
        }.bind(this)
    );
}
getSongCover = (song, size) => {
    if (song.cover && typeof song === 'object') {
        if (song.cover['image_' + size])
            return song.cover['image_' + size];
        if (song.cover['image'])
            return song.cover['image']
        if (song.cover['url']) {
            return song.cover['url']
        }
    }
    return song.cover
}
const triggerFav = (id) => {
    id = id.toString()
    if (isFav(id)) {
        return remFav(id)
    } else {
        return addFav(id)
    }
}
const updateLikedSongs = () => {
    $('.playlist .trigger-fav i').addClass('text-muted').removeClass('text-danger')
    $('.controls .trigger-fav i').addClass('text-white').removeClass('text-danger')
    $('.controls .trigger-fav').addClass('border-white').removeClass('border-danger')
    for (const favID of getFav()) {
        $('.playlist .trigger-fav[data-id="' + favID + '"] i').removeClass('text-muted').addClass('text-danger')
        $('.controls .trigger-fav[data-id="' + favID + '"] i').removeClass('text-white').addClass('text-danger')
        $('.controls .trigger-fav[data-id="' + favID + '"]').removeClass('border-white').addClass('border-danger')
    }
}
const setCurrentSong = () => {
    console.log('SET SONG', playerData.index)
    play(playerData.songs[playerData.index]);
}
const checkSelectedSong = () => {
    $('#app-player .playlist .song .play-btn').parent().removeClass('bg-dark')
    $('#app-player .playlist .song i.fa-play').removeClass('text-success')
    $('#app-player .playlist .song .play-btn[data-id="' + playerData.current.id + '"]').parent().addClass('bg-dark')
    if (playerData.isPlaying) {
        $('#app-player .playlist .song.bg-dark i.fa-play').addClass('text-success').removeClass('text-muted')
    } else {
        $('#app-player .playlist .song.bg-dark i.fa-play').addClass('text-muted')
    }
}
const play = (song) => {
    console.log('play', playerData.loading, song)
    playerData.isPlaying = true;
    if (playerData.current.id === song.id && playerData.isStarted) {
        console.log('playerData.current.id === song.id && playerData.isStarted')
        playerData.player.play();
    } else {
        playerData.player.pause();
        playerData.loading = true;
        updateState()
        if (typeof song.url !== "undefined") {
            playerData.current.isPlaying = false;
            playerData.index = playerData.songIDs.indexOf(song.id);
            playerData.current = song;
            playerData.player.src = playerData.current.url;
        } else {
            playerData.loading = false
        }
        listenersWhenPlay();
        updateState()
        playerData.player.addEventListener('canplaythrough', () => {
            setTimeout(() => {
                playerData.loading = false;
                playerData.current.seconds = playerData.player.duration;
                playerData.player.play();
            }, 500)
            updateState()
        }, false);
        playerData.player.load();
    }
    updateState()
    checkSelectedSong()
}
const pause = () => {
    playerData.player.pause();
    playerData.isPlaying = false;
    playerData.current.isPlaying = false;
    playerData.loading = false;
    updateState()
    checkSelectedSong()
}
const next = () => {
    playerData.current.isPlaying = false;
    playerData.isPlaying = false;
    playerData.current.percent = 0;
    playerData.index = playerData.songIDs.indexOf(playerData.current.id);
    playerData.index++;
    if (playerData.index > playerData.songs.length - 1) {
        playerData.index = 0;
    }
    setCurrentSong();
}
const prev = () => {
    playerData.current.isPlaying = false;
    playerData.isPlaying = false;
    playerData.index = playerData.songIDs.indexOf(playerData.current.id);
    playerData.index--;
    if (playerData.index < 0) {
        playerData.index = playerData.songs.length - 1;
    }
    setCurrentSong();
    updateState()
}
const removeSongFromPlaylist = (song) => {
    if (playerData.songs.length > 1) {
        if (playerData.index > 0) {
            playerData.index--;
        }
        playerData.current.isPlaying = false;
        playerData.songs = deleteElement(playerData.songs, song);
        setCurrentSong();
    }
}

$('#app-player .prev').click(function (e) {
    e.preventDefault();
    prev()
})
$('#app-player .play').click(function (e) {
    e.preventDefault();
    play(playerData.current)
    playerData.isStarted = true
})
$('#app-player .next').click(function (e) {
    e.preventDefault();
    next()
})
$('#app-player .pause').click(function (e) {
    e.preventDefault();
    pause()
})
$('#app-player .seek').click(function (ev) {
    let bcr = document.querySelector('.progress-bar-box').getBoundingClientRect();
    playerData.player.currentTime = (ev.clientX - bcr.left) / bcr.width * playerData.player.duration
    playerData.current.isPlaying = true;
    playerData.isPlaying = true;
})
$('.trigger-fav').click(function (e) {
    let id = $(this).attr('data-id')
    triggerFav(id)
    updateLikedSongs()
})
updateLikedSongs()
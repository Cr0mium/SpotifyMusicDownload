let total = 0
let current = 0;

async function fetchTracks() {
    const playlistId = localStorage.getItem('selectedPlaylistId');


    if (!playlistId) {
        console.error('Playlist ID not provided');
        return;
    }

    try {
        const response = await fetch(`/getPlaylist/${playlistId}`);
        const data = await response.json();
        const tracks = data.items
        localStorage.setItem('tracks', JSON.stringify(tracks));
        // console.log(tracks)
        total = tracks.length
        tracks.forEach((song, index) => {
            const element = $("<div>");
            element.attr("id", `song-${index}`)
            element.on("click", function (e) {
                // console.log(e.target.id);
                selectSong(e);
            })
            element.addClass("song");
            element.append(`<div style="padding-right:20px; width:25px">${index + 1}</div>`)
            element.append(`<input type="checkbox" class="checkbox" name="song-${index}" >`)
            const imgElement = $("<img>").attr("src", song.track.album.images[0].url);
            element.append(imgElement);
            const details = $("<div>")
            details.addClass("songDetails")
            details.append(`<div>${song.track.name}</div>`);
            const artistNames = song.track.artists.map(artist => artist.name).join(', ');
            details.append(`<div style="font-size: small;font-weight:100" >${artistNames}</div>`)
            element.append(details);
            $('#tracks').append(element);

        });

    } catch (error) {
        console.error('Error fetching tracks:', error);
    }
}

async function fetchNext(id, total) {
    const response = await fetch(`/getPlaylist/${id}`)
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();// Assuming the response is JSON
    console.log(data.length)

}

function selectSong(e) {
    $(`#${e.currentTarget.id}`).toggleClass("selected")
    if (!$(`#${e.currentTarget.id}>.checkbox`).prop("checked")) {
        $(`#${e.currentTarget.id}>.checkbox`).prop("checked", true);
        ++current;
        if (current === total) {
            $(`#SelectAll`).addClass("buttonSelected")
        }
    } else {
        $(`#${e.currentTarget.id}>.checkbox`).prop("checked", false);
        --current;
        $(`#SelectAll`).removeClass("buttonSelected")
    }
    $(`#Download`).html(`Download-${current}`)
}


$("#SelectAll").on("click", function () {
    $(`#${this.id}`).toggleClass("buttonSelected")

    if ($(`#${this.id}`).hasClass('buttonSelected')) {
        const checkButtons = $(`.checkbox`)
        checkButtons.each(function () {
            if (!$(this).prop("checked")) {
                $(this).prop("checked", true);
                $(`#${this.name}`).addClass("selected")
            }
        })
        current = total;
        console.log(current)
    } else {
        const checkButtons = $(`.checkbox`)
        checkButtons.each(function () {
            if ($(this).prop("checked")) {
                $(this).prop("checked", false);
                $(`#${this.name}`).removeClass("selected")

            }

        })
        current = 0;
        console.log(current)
    }
    $(`#Download`).html(`Download-${current}`)
})


fetchTracks();

$("#Download").on("click", function () {
    const checkButtons = $(`.checkbox`)
    const tracks=JSON.parse(localStorage.getItem("tracks"))
    // console.log(tracks)
    checkButtons.each(async function () {
        if ($(this).prop("checked")) {
            var songId = $(this).attr("name")
            var index=songId.split('-')[1]
            console.log(tracks[index])
            let songQuery = {
                name:tracks[index].track.name,
                artist:tracks[index].track.artists[0].name,
                art:tracks[index].track.album.images[0].url,
                duration:(tracks[index].track.duration_ms/1000)
            }
            console.log("Downloading " + songQuery.name)
            try {
                const result = await fetch(`/download`, {
                    method: 'POST',

                    headers: {

                        'Content-Type': 'application/json'

                    },

                    body: JSON.stringify(songQuery)

                })
                console.log('Download result:', result);
            } catch (error) {
                console.error('Failed to download song:', error);
            }

        }
    })
})


async function fetchPlaylist() {
    try {
        const response = await fetch('http://localhost:3000/playlists');
        const playlists = await response.json();

        const playlistContainer = document.getElementById('playlist');
        // console.log(playlists)
        playlists.forEach((playlist, index) => {
            const playlistElement = document.createElement('div');
            playlistElement.classList.add('song');
            playlistElement.innerHTML = `
          <img src="${playlist.images[0].url}" alt="${playlist.name}">
          <h3>${playlist.name}</h3>
        `;
            $(playlistElement).attr("id", playlist.id)
            $(playlistElement).on("click", function () {
                const playlistId = this.id;
                localStorage.setItem('selectedPlaylistId', playlistId);
                window.location.href='/tracks.html'
            });
            playlistContainer.appendChild(playlistElement);
        });
    } catch (error) {
        console.error('Error fetching playlist:', error);
    }
}

fetchPlaylist()







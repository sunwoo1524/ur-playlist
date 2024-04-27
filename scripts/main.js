const NORMAL = 0
const LOOP = 1
const RANDOM = 2

document.addEventListener("alpine:init", () => {
    Alpine.data("playlist", () => ({
        playlist: [],
        url: "",
        play: false,
        video_index: 0,
        player: null,
        play_mode: NORMAL,

        init() {
            // get the playlist from current url
            const playlist_param = new URLSearchParams(window.location.search).get("playlist")
            if (playlist_param !== null) {
                this.playlist = playlist_param.split(",")
            }
        },

        addVideo() {
            this.url = this.url.replace("https://", "");

            // check if the url is youtube link
            let host = this.url.split("/")[0]
            if (host === "www.youtube.com" || host == "youtube.com" || host == "youtu.be") {
                // get the id of the video from the url
                let id = new URLSearchParams(this.url.split("?")[1]).get("v")
                if (id !== null) {
                    this.playlist.push(id)
                } else {
                    id = this.url
                        .replace("/shorts", "")
                        .split("/")[1]
                        .split("?")[0]
                    this.playlist.push(id)
                }
                
                this.updateShareParam()
            } else {
                alert("Please put an YouTube link.")
            }
        },

        copyLink() {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    alert("Share link is copied to clipboard")
                })
                .catch(err => {
                    alert("Some error occured: " + err)
                })
        },

        updateShareParam() {
            const params = new URLSearchParams(window.location.search)
            params.set("playlist", this.playlist.join(","))
            history.replaceState(null, null, "?" + params.toString())
        },

        async getVideoDetail(id) {
            const res = await (await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)).json()
            return res
        },

        playVideo() {
            console.log(this.player)
            if (this.player) {
                this.player.playVideo()
            } else {
                this.player = initPlayer("player", this.playlist[this.video_index], this.onPlayerReady, (e) => { this.onPlayerStateChange(e) })
            }
        },

        pauseVideo() {
            this.player.pauseVideo()
        },

        playNewVideo(id) {
            if (this.player) this.player.destroy()
            this.player = initPlayer("player", id, this.onPlayerReady, (e) => { this.onPlayerStateChange(e) })
        },

        playNextVideo() {
            this.video_index++
            if (this.video_index >= this.playlist.length) {
                this.video_index = 0
            }
            this.playNewVideo(this.playlist[this.video_index])
        },

        playPrevVideo() {
            this.video_index--
            if (this.video_index < 0) {
                this.video_index = this.playlist.length - 1
            }
            this.playNewVideo(this.playlist[this.video_index])
        },

        moveVideoOrder(index, to) {
            // copy the video of the index to the playlist
            if (to >= this.playlist.length) {
                to -= this.playlist.length
            } else if (to < 0 ) {
                to += this.playlist.length
            }
            console.log(to)
            this.playlist.splice(index < to ? to + 1 : to, 0, this.playlist[index])

            // delete the previous video
            this.playlist.splice(index > to ? index + 1 : index, 1)
        },

        deleteVideo(index) {
            if (index === this.video_index) {
                this.video_index--
                this.playNewVideo(this.playlist[this.video_index])
            }
            this.playlist.splice(index, 1)
        },

        
        onPlayerReady(event) {
            event.target.playVideo()
        },

        onPlayerStateChange(event) {
            if (event.data === 0) {
                if (this.play_mode === NORMAL) { // play the next video, don't play the first video when the playlist end
                    if (this.video_index === this.playlist.length - 1) {
                        return
                    }
                    this.video_index++
                } else if (this.player_mode === LOOP) { // play the next video, play the first video when the playlist end
                    this.video_index++
                    if (this.video_index >= this.playlist.length) {
                        this.video_index = 0
                    }
                } else if (this.player_mode === RANDOM) { // play the random video
                    this.video_index = Math.floor(Math.random() * this.playlist.length)
                }
                this.playNewVideo(this.playlist[this.video_index])
            } else if (event.data === -1 || event.data === 2) {
                this.play = false
            } else {
                this.play = true
            }
        }
    }))
})

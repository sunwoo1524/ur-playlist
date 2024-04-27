// get youtube api script
const tag = document.createElement("script")
tag.src = "https://www.youtube.com/iframe_api"
const firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

function initPlayer(html_id, video_id, onPlayerReady, onPlayerStateChange) {
    return new YT.Player(html_id, {
        width: "400",
        height: "225",
        videoId: video_id,
        events: {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange
        }
    })
}

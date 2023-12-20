import Track from '../models/track'
import {
  SpotifyAudioFeaturesType,
  SpotifyTopTrackType,
} from '../types/spotifyTypes'

export function transformSpotifyToTrack(
  spotifyTrackData: SpotifyTopTrackType,
  spotifyAudioData: SpotifyAudioFeaturesType,
): Track {
  const track: Track = {
    spotifyId: spotifyTrackData.id,
    name: spotifyTrackData.name,
    audioData: {
      accousticness: spotifyAudioData.acousticness,
      danceability: spotifyAudioData.danceability,
      energy: spotifyAudioData.energy,
      instrumentalness: spotifyAudioData.instrumentalness,
      liveness: spotifyAudioData.liveness,
      loudness: spotifyAudioData.loudness,
      speechiness: spotifyAudioData.speechiness,
      tempo: spotifyAudioData.tempo,
      valence: spotifyAudioData.valence,
    },
  }

  return track
}

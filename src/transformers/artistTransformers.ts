import Artist, { EmbeddedArtist } from '../models/artist'
import Track from '../models/track'
import { SpotifyArtistType } from '../types/spotifyTypes'
import { TicketMasterArtistType } from '../types/ticketMasterTypes'
import Event from '../models/event'

export function transformSpotifyAndTicketmasterToArtist(
  spotifyArtist: SpotifyArtistType,
  ticketmasterArtist: TicketMasterArtistType,
): Artist {
  if (spotifyArtist.images.length === 0) {
    console.log('No image found for artist: ' + spotifyArtist.name)
  }
  return {
    spotifyId: spotifyArtist.id,
    ticketMasterId: ticketmasterArtist.id,
    name: spotifyArtist.name,
    genres: spotifyArtist.genres,
    imageUrl:
      spotifyArtist.images.length > 0
        ? spotifyArtist.images[0].url
        : ticketmasterArtist.images[0].url,
    meanScore: 0,
    socialMedia: {
      website: ticketmasterArtist.externalLinks.homepage
        ? ticketmasterArtist.externalLinks.homepage[0].url
        : undefined,
      facebook: ticketmasterArtist.externalLinks.facebook
        ? ticketmasterArtist.externalLinks.facebook[0].url
        : undefined,
      twitter: ticketmasterArtist.externalLinks.twitter
        ? ticketmasterArtist.externalLinks.twitter[0].url
        : undefined,
      instagram: ticketmasterArtist.externalLinks.instagram
        ? ticketmasterArtist.externalLinks.instagram[0].url
        : undefined,
      youtube: ticketmasterArtist.externalLinks.youtube
        ? ticketmasterArtist.externalLinks.youtube[0].url
        : undefined,
      spotify: spotifyArtist.external_urls.spotify,
      lastfm: ticketmasterArtist.externalLinks.lastfm
        ? ticketmasterArtist.externalLinks.lastfm[0].url
        : undefined,
    },
  } as Artist
}

export function tranformSpotifyToArtist(
  spotifyArtist: SpotifyArtistType,
): Artist {
  return {
    spotifyId: spotifyArtist.id,
    name: spotifyArtist.name,
    genres: spotifyArtist.genres,
    imageUrl: spotifyArtist.images[0].url,
    meanScore: 0,
    socialMedia: {
      spotify: spotifyArtist.external_urls.spotify,
    },
  } as Artist
}

export function transformArtistToEmbeddedArtist(
  artist: Artist,
  tracks: Track[],
  events: Event[],
): EmbeddedArtist {
  return {
    ...artist,
    _embedded: {
      tracks,
      events,
    },
  } as EmbeddedArtist
}

export function transformEmbeddedArtistToArtist(
  embeddedArtist: EmbeddedArtist,
): Artist {
  return {
    ...embeddedArtist,
    _embedded: undefined,
  } as Artist
}

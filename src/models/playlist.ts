export type Playlist = {
  _id: string; // Will be the same as the spotify playlistId
  name: string;
  imageUrl: string;
  totalTracks: number;
  meanScore: number;
};

export default Playlist;

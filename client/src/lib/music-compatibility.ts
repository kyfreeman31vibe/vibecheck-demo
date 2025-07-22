import type { User } from "@shared/schema";

export function calculateMusicCompatibility(user1: User, user2: User): number {
  let score = 0;
  let totalFactors = 0;

  // Genre compatibility (40% weight)
  if (user1.favoriteGenres && user2.favoriteGenres) {
    const sharedGenres = user1.favoriteGenres.filter(genre => 
      user2.favoriteGenres!.includes(genre)
    );
    const genreScore = sharedGenres.length / Math.max(user1.favoriteGenres.length, user2.favoriteGenres.length);
    score += genreScore * 40;
    totalFactors += 40;
  }

  // Artist compatibility (40% weight)
  if (user1.favoriteArtists && user2.favoriteArtists) {
    const sharedArtists = user1.favoriteArtists.filter(artist => 
      user2.favoriteArtists!.includes(artist)
    );
    const artistScore = sharedArtists.length / Math.max(user1.favoriteArtists.length, user2.favoriteArtists.length);
    score += artistScore * 40;
    totalFactors += 40;
  }

  // Song compatibility (20% weight)
  if (user1.favoriteSongs && user2.favoriteSongs) {
    const sharedSongs = user1.favoriteSongs.filter(song => 
      user2.favoriteSongs!.includes(song)
    );
    const songScore = sharedSongs.length / Math.max(user1.favoriteSongs.length, user2.favoriteSongs.length);
    score += songScore * 20;
    totalFactors += 20;
  }

  // Return percentage (minimum 60% for demo purposes to ensure some compatibility)
  const finalScore = totalFactors > 0 ? Math.max(60, Math.round(score)) : 75;
  return Math.min(100, finalScore);
}

export function getSharedInterests(user1: User, user2: User) {
  const shared = [];
  
  if (user1.favoriteGenres && user2.favoriteGenres) {
    const sharedGenres = user1.favoriteGenres.filter(genre => 
      user2.favoriteGenres!.includes(genre)
    );
    shared.push(...sharedGenres);
  }

  if (user1.favoriteArtists && user2.favoriteArtists) {
    const sharedArtists = user1.favoriteArtists.filter(artist => 
      user2.favoriteArtists!.includes(artist)
    );
    shared.push(...sharedArtists.slice(0, 2)); // Limit to top 2
  }

  return shared.slice(0, 3); // Return max 3 shared interests
}

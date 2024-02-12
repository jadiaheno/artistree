export interface SpotifyArtistRelatedArtists {
    artists: Artist[];
}

interface Artist {
    external_urls: ExternalUrls;
    followers: Followers;
    genres: string[];
    href: string;
    id: string;
    images: Image[];
    name: string;
    popularity: number;
    type: Type;
    uri: string;
}

interface ExternalUrls {
    spotify: string;
}

interface Followers {
    href: null;
    total: number;
}

interface Image {
    url: string;
    height: number;
    width: number;
}

enum Type {
    Artist = "artist",
}

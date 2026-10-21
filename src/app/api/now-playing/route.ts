
const AZURACAST_API =
    "http://57.129.178.112/api/nowplaying/1";

type AzuraCastResponse = {
    is_online: boolean;
    listeners: {
        current: number;
    };
    now_playing: {
        song: {
            artist: string;
            title: string;
        };
    };
    station: {
        mounts: {
            bitrate: number;
            is_default: boolean;
        }[];
    };
};

export async function GET() {
    try {
        const response = await fetch(AZURACAST_API, {
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            throw new Error(`AzuraCast: ${response.status}`);
        }

        const data: AzuraCastResponse = await response.json();

        return Response.json({
            artist: data.now_playing.song.artist,
            title: data.now_playing.song.title,
            listeners: data.listeners.current,
            isOnline: data.is_online,
            bitrate:
                data.station.mounts.find((mount) => mount.is_default)
                    ?.bitrate ?? null,
        });
    } catch (error) {
        console.error("AzuraCast API error:", error);

        return Response.json(
            { error: "Station metadata unavailable" },
            { status: 502 }
        );
    }
}

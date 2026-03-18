import { Audio, AVPlaybackStatus } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { radioStations } from "./shared/data/radio-stations";

type DiscoverTab = "all" | "favourites";
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const FILTERS: DiscoverTab[] = [
  "all",
  "favourites",
];

const COLORS = {
  bg: "#ffffff",
  ink: "#111111",
  textMuted: "#7a7a7a",
  textSoft: "#b4b4b4",
  card: "#f3f3f3",
  cardBorder: "#ececec",
  selectedBg: "#ffffff",
  selectedBorder: "#111111",
  selectedText: "#111111",
  progressTrack: "#efefef",
  progressFill: "#111111",
  buttonBg: "#111111",
  buttonText: "#ffffff",
  inputBg: "#f6f6f6",
};

export default function App() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentStationId, setCurrentStationId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<DiscoverTab>("all");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    "sanyu-fm",
    "kfm",
  ]);

  useEffect(() => {
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        void sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      setInstallDismissed(false);
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
      setInstallDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const filteredStations = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    return radioStations.filter((station) => {
      const matchesSearch = station.name.toLowerCase().includes(lowerSearch);
      const matchesFilter =
        filter === "all"
          ? true
          : favoriteIds.includes(station.id);
      return matchesSearch && matchesFilter;
    });
  }, [favoriteIds, filter, searchTerm]);

  const currentStation = useMemo(
    () => radioStations.find((station) => station.id === currentStationId) ?? null,
    [currentStationId]
  );

  const selectedStations = useMemo(
    () => radioStations.filter((station) => favoriteIds.includes(station.id)),
    [favoriteIds]
  );

  const onPlaybackStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsPlaying(false);
      setIsBuffering(false);
      return;
    }

    setIsBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);
  };

  const playStation = async (stationId: string) => {
    const station = radioStations.find((entry) => entry.id === stationId);
    if (!station) return;

    setErrorMessage(null);

    if (sound && currentStationId === stationId) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setCurrentStationId(station.id);
      setIsBuffering(true);
      const { sound: nextSound } = await Audio.Sound.createAsync(
        { uri: station.streamUrl },
        { shouldPlay: true },
        onPlaybackStatus
      );
      setSound(nextSound);
    } catch (error) {
      console.error("Failed to play stream", error);
      setIsPlaying(false);
      setIsBuffering(false);
      setErrorMessage("Unavailable right now");
    }
  };

  const toggleFavorite = (stationId: string) => {
    setFavoriteIds((previous) =>
      previous.includes(stationId)
        ? previous.filter((id) => id !== stationId)
        : [...previous, stationId]
    );
  };

  const startListening = () => {
    const targetId = currentStationId ?? favoriteIds[0] ?? filteredStations[0]?.id ?? radioStations[0]?.id;
    if (targetId) {
      void playStation(targetId);
    }
  };

  const triggerInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.frame}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.eyebrow}>UGSTREAM</Text>
            <Text style={styles.title}>Choose your favourite stations</Text>
            <Text style={styles.subtitle}>
              Stream radio stations from Uganda.
            </Text>
          </View>

          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search stations"
            placeholderTextColor={COLORS.textSoft}
            style={styles.search}
          />

          <View style={styles.filterRow}>
            {FILTERS.map((item) => {
              const selected = item === filter;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[styles.filterChip, selected && styles.filterChipSelected]}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                    {item === "all" ? "All" : item === "favourites" ? "Favourites" : item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.stationGrid}>
            {filteredStations.map((station) => {
              const selected = favoriteIds.includes(station.id);
              const active = currentStationId === station.id;

              return (
                <Pressable
                  key={station.id}
                  onPress={() => void playStation(station.id)}
                  style={[
                    styles.stationTile,
                    styles.stationTileWide,
                    active ? styles.stationTileSelected : styles.stationTileIdle,
                  ]}
                >
                  <Image source={{ uri: station.logoUrl }} style={styles.stationLogo} />
                  <View style={styles.stationCopy}>
                    <Text style={styles.stationTitle} numberOfLines={1}>
                      {station.name}
                    </Text>
                    {active && errorMessage ? (
                      <Text style={styles.stationError}>{errorMessage}</Text>
                    ) : active ? (
                      <Text style={styles.stationLive}>
                        {isBuffering ? "Connecting..." : isPlaying ? "Now playing" : "Paused"}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => toggleFavorite(station.id)}
                    style={styles.heartButton}
                    hitSlop={8}
                  >
                    <Text style={[styles.heartIcon, selected && styles.heartIconSelected]}>
                      {selected ? "♥" : "♡"}
                    </Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {Platform.OS === "web" && installPrompt && !installDismissed ? (
          <View style={styles.installDock}>
            <View style={styles.installCard}>
              <View style={styles.installCopy}>
                <Text style={styles.installTitle}>Download UGSTREAM</Text>
                <Text style={styles.installText}>Save it to your device for quicker access anytime.</Text>
              </View>
              <View style={styles.installActions}>
                <Pressable onPress={() => setInstallDismissed(true)} style={styles.installGhostButton}>
                  <Text style={styles.installGhostText}>Later</Text>
                </Pressable>
                <Pressable onPress={() => void triggerInstall()} style={styles.installButton}>
                  <Text style={styles.installButtonText}>Download App</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.playerDock}>
          <View style={styles.playerCard}>
            <View style={styles.playerCopy}>
              <Text style={styles.playerLabel}>Now playing</Text>
              <Text style={styles.playerTitle}>
                {currentStation ? currentStation.name : "No station selected"}
              </Text>
              <Text style={[styles.playerMeta, errorMessage && styles.playerMetaError]}>
                {errorMessage
                  ? errorMessage
                  : `${selectedStations.length} selected station${
                      selectedStations.length === 1 ? "" : "s"
                    }`}
              </Text>
            </View>
            <View style={styles.playerControls}>
              <Pressable style={styles.secondaryButton} onPress={startListening}>
                <Text style={styles.secondaryButtonText}>
                  {isBuffering ? "Buffering..." : isPlaying ? "Pause current" : "Play current"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.primaryButton} onPress={startListening}>
            <View style={styles.primaryButtonContent}>
              <Text style={styles.primaryButtonText}>
                {errorMessage
                  ? errorMessage
                  : isBuffering
                  ? `Connecting ${currentStation?.name ?? "station"}`
                  : isPlaying
                    ? `${currentStation?.name ?? "Station"} is playing`
                    : currentStation
                      ? `Play ${currentStation.name}`
                      : "Play station"}
              </Text>
              {currentStation ? (
                <Text style={styles.primaryButtonSubtext}>
                  {errorMessage
                    ? "Try another station"
                    : isBuffering
                      ? "Loading stream"
                      : isPlaying
                        ? "Tap to pause"
                        : "Tap to play"}
                </Text>
              ) : null}
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  frame: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 420,
  },
  topBar: {
    alignItems: "center",
    marginBottom: 38,
  },
  progressTrack: {
    width: "58%",
    height: 12,
    borderRadius: 999,
    backgroundColor: COLORS.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    width: "56%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.progressFill,
  },
  copyBlock: {
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: COLORS.textSoft,
    marginBottom: 12,
  },
  title: {
    fontSize: 50,
    lineHeight: 50,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -2.2,
    maxWidth: 320,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.textSoft,
    maxWidth: 340,
  },
  search: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    color: COLORS.ink,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.card,
  },
  filterChipSelected: {
    backgroundColor: COLORS.ink,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.ink,
  },
  filterTextSelected: {
    color: COLORS.buttonText,
  },
  stationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  stationTile: {
    minHeight: 90,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stationTileWide: {
    width: "100%",
  },
  stationTileIdle: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  stationTileSelected: {
    backgroundColor: COLORS.selectedBg,
    borderWidth: 2,
    borderColor: COLORS.selectedBorder,
  },
  stationLogo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#e8e8e8",
  },
  stationCopy: {
    flex: 1,
    gap: 3,
  },
  heartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  heartIcon: {
    fontSize: 18,
    color: COLORS.textSoft,
    lineHeight: 20,
  },
  heartIconSelected: {
    color: COLORS.ink,
  },
  stationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.ink,
  },
  stationMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  stationLive: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
    marginTop: 3,
  },
  stationError: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8a1f1f",
    marginTop: 3,
  },
  installDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 264,
    paddingHorizontal: 24,
  },
  installCard: {
    borderRadius: 24,
    backgroundColor: COLORS.ink,
    padding: 18,
    gap: 14,
  },
  installCopy: {
    gap: 4,
  },
  installTitle: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: "800",
  },
  installText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
  },
  installActions: {
    flexDirection: "row",
    gap: 10,
  },
  installGhostButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  installGhostText: {
    color: COLORS.buttonText,
    fontSize: 13,
    fontWeight: "700",
  },
  installButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: COLORS.bg,
    alignItems: "center",
  },
  installButtonText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  playerDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 118,
    paddingHorizontal: 24,
  },
  playerCard: {
    borderRadius: 30,
    backgroundColor: COLORS.card,
    padding: 22,
    gap: 16,
  },
  playerCopy: {
    gap: 6,
  },
  playerLabel: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORS.textSoft,
    fontWeight: "700",
  },
  playerTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    color: COLORS.ink,
  },
  playerMeta: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  playerMetaError: {
    color: "#8a1f1f",
  },
  playerControls: {
    flexDirection: "row",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.buttonBg,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: "800",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: COLORS.bg,
  },
  primaryButton: {
    backgroundColor: COLORS.buttonBg,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonContent: {
    alignItems: "center",
    gap: 4,
  },
  primaryButtonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: "800",
  },
  primaryButtonSubtext: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
  },
});

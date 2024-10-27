'use client'

import { useState, useRef, useEffect } from 'react'
import { Howl } from 'howler'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon, SearchIcon, PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, HeartIcon, HomeIcon, StarIcon, CoffeeIcon, RadioIcon, BookOpenIcon, VolumeIcon, Mic as RecordIcon, StopCircleIcon } from 'lucide-react'

interface Station {
  name: string
  url: string
  logo: string
  country: 'Uganda' | 'Kenya' | 'Tanzania'
  recommended?: boolean
}

const stations: Station[] = [
  { 
    name: 'Sanyu FM', 
    url: 'https://s44.myradiostream.com:8138/;',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/sanyu.png',
    country: 'Uganda',
    recommended: true
  },
  { 
    name: 'Capital FM', 
    url: 'https://capitalfm.cloudrad.io/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/capital.png',
    country: 'Uganda'
  },
  { 
    name: 'Nation FM', 
    url: 'https://stream.radiojar.com/3by7s8eg65quv',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ke/nation-fm.png',
    country: 'Kenya',
    recommended: true
  },
  { 
    name: 'TBC Taifa', 
    url: 'http://usa9-vn.mixstream.net:8080/;',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-tz/tbc-taifa.png',
    country: 'Tanzania'
  },
  // Add more stations here...
]

export default function UgstreamApp() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [lastPlayed, setLastPlayed] = useState<string | null>(null)
  const [sound, setSound] = useState<Howl | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<string>('discover')
  const [favorites, setFavorites] = useState<Station[]>([])
  const [buffering, setBuffering] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(1)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    if (sound) {
      sound.volume(volume)
    }
  }, [volume, sound])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase())
  }

  const togglePlay = (station: Station) => {
    if (playing === station.name && sound) {
      sound.pause()
      setPlaying(null)
      return
    }

    if (sound) sound.unload()
    setBuffering(true)

    const newSound = new Howl({
      src: [station.url],
      html5: true,
      format: ['mp3', 'aac'],
      onplay: () => {
        setPlaying(station.name)
        setLastPlayed(station.name)
        setBuffering(false)
      },
      onloaderror: () => setBuffering(false),
      onplayerror: () => setBuffering(false),
      onend: () => setPlaying(null),
    })

    newSound.play()
    setSound(newSound)
  }

  const toggleFavorite = (station: Station) => {
    setFavorites((prevFavorites) =>
      prevFavorites.some(fav => fav.name === station.name)
        ? prevFavorites.filter(fav => fav.name !== station.name)
        : [...prevFavorites, station]
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
      // Here you would typically process the EPUB file and convert it to audio
      // For this example, we'll just pretend to play the file name
      if (sound) sound.unload()
      setPlaying(file.name)
      setLastPlayed(file.name)
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        const audioChunks: BlobPart[] = []
        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunks.push(event.data)
        })

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          setRecordedBlob(audioBlob)
        })

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
      }
    }
  }

  const renderDiscoverContent = () => {
    const filteredStations = stations.filter(station =>
      station.name.toLowerCase().includes(searchTerm)
    )

    return (
      <>
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search radio stations..."
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <h2 className="text-xl font-bold mb-4">Recommended Stations</h2>
        <ScrollArea className="h-[200px] mb-6">
          <div className="space-y-4">
            {filteredStations.filter(station => station.recommended).map((station) => (
              <StationCard key={station.name} station={station} playing={playing} togglePlay={togglePlay} toggleFavorite={toggleFavorite} favorites={favorites} />
            ))}
          </div>
        </ScrollArea>
        {['Uganda', 'Kenya', 'Tanzania'].map((country) => (
          <div key={country}>
            <h2 className="text-xl font-bold mb-4">{country}</h2>
            <ScrollArea className="h-[200px] mb-6">
              <div className="space-y-4">
                {filteredStations.filter(station => station.country === country).map((station) => (
                  <StationCard key={station.name} station={station} playing={playing} togglePlay={togglePlay} toggleFavorite={toggleFavorite} favorites={favorites} />
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
      </>
    )
  }

  const renderNowPlayingContent = () => {
    const currentStation = stations.find(st => st.name === playing) || stations.find(st => st.name === lastPlayed)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        {currentStation ? (
          <>
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage src={currentStation.logo} alt={currentStation.name} />
              <AvatarFallback>{currentStation.name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold mb-4">{currentStation.name}</h2>
            <div className="flex items-center space-x-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => sound?.pause()}>
                <PauseIcon className="h-8 w-8" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => sound?.play()}>
                <PlayIcon className="h-8 w-8" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleRecording}>
                {isRecording ? <StopCircleIcon className="h-8 w-8 text-red-500" /> : <RecordIcon className="h-8 w-8" />}
              </Button>
            </div>
            <div className="flex items-center space-x-2 w-full max-w-md">
              <VolumeIcon className="h-4 w-4" />
              <Slider
                value={[volume * 100]}
                onValueChange={(value) => setVolume(value[0] / 100)}
                max={100}
                step={1}
              />
            </div>
            {recordedBlob && (
              <div className="mt-4">
                <audio src={URL.createObjectURL(recordedBlob)} controls />
                <Button onClick={() => {
                  const url = URL.createObjectURL(recordedBlob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'recorded_audio.wav'
                  a.click()
                }}>
                  Download Recording
                </Button>
              </div>
            )}
          </>
        ) : (
          <p>No station is currently playing or was last played</p>
        )}
      </div>
    )
  }

  const renderAudiobooksContent = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Audiobooks</h2>
        <Button onClick={() => fileInputRef.current?.click()}>
          Upload EPUB File
        </Button>
        <input
          type="file"
          accept=".epub"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        {audioFile && (
          <p className="mt-4">Current file: {audioFile.name}</p>
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'discover':
        return renderDiscoverContent()
      case 'nowPlaying':
        return renderNowPlayingContent()
      case 'audiobooks':
        return renderAudiobooksContent()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through different sections of the app.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Button variant="ghost" onClick={() => setCurrentPage('discover')}>
                <HomeIcon className="mr-2 h-4 w-4" /> Discover
              </Button>
              <Button variant="ghost" onClick={() => setCurrentPage('nowPlaying')}>
                <RadioIcon className="mr-2 h-4 w-4" /> Now Playing
              </Button>
              <Button variant="ghost" onClick={() => setCurrentPage('audiobooks')}>
                <BookOpenIcon className="mr-2 h-4 w-4" /> Audiobooks
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold">ugstream</h1>
        <div className="w-6" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 overflow-auto">
        {renderContent()}
      </main>

      <nav className="bg-primary text-primary-foreground p-4">
        <div className="flex justify-around">
          <Button variant="ghost" onClick={() => setCurrentPage('discover')}>
            <HomeIcon className="h-6 w-6" />
            <span className="sr-only">Discover</span>
          </Button>
          <Button variant="ghost" onClick={() => setCurrentPage('nowPlaying')}>
            <RadioIcon className="h-6 w-6" />
            <span className="sr-only">Now Playing</span>
          </Button>
          <Button variant="ghost" onClick={() => setCurrentPage('audiobooks')}>
            <BookOpenIcon className="h-6 w-6" />
            <span className="sr-only">Audiobooks</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}

interface StationCardProps {
  station: Station
  playing: string | null
  togglePlay: (station: Station) => void
  toggleFavorite: (station: Station) => void
  favorites: Station[]
}

const StationCard: React.FC<StationCardProps> = ({ station, playing, togglePlay, toggleFavorite, favorites }) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow">
    <CardContent className="p-4 flex items-center space-x-4" onClick={() => togglePlay(station)}>
      <Avatar>
        <AvatarImage src={station.logo} alt={station.name} />
        <AvatarFallback>{station.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="font-semibold">{station.name}</h3>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); toggleFavorite(station); }}
      >
        <HeartIcon className={`h-4 w-4 ${favorites.some(fav => fav.name === station.name) ? 
          'text-red-500 fill-current' : 'text-gray-500'}`} />
        <span className="sr-only">
          {favorites.some(fav => fav.name === station.name) ? 'Remove from favorites' : 'Add to favorites'}
        </span>
      </Button>
      <Button variant="ghost" size="icon">
        {playing === station.name ? (
          <PauseIcon className="h-4 w-4" />
        ) : (
          <PlayIcon className="h-4 w-4" />
        )}
        <span className="sr-only">{playing === station.name ? 'Pause' : 'Play'}</span>
      </Button>
    </CardContent>
  </Card>
)
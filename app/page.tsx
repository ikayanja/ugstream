'use client'

import { useState } from 'react'
import { Howl } from 'howler'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon, SearchIcon, PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, HeartIcon, HomeIcon, StarIcon, CoffeeIcon } from 'lucide-react'

interface Station {
  name: string
  url: string
  logo: string
}

const stations: Station[] = [
  { 
    name: 'Sanyu FM', 
    url: 'https://s44.myradiostream.com:8138/;',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/sanyu.png'
  },
  { 
    name: 'Capital FM', 
    url: 'https://capitalfm.cloudrad.io/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/capital.png'
  },
  { 
    name: 'X FM', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/xfm.png'
  },
  { 
    name: 'Dembe FM', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/dembe-fm.png'
  },
  { 
    name: 'Galaxy FM', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/100-2-galaxy-fm.png'
  },
  { 
    name: 'Radio CBS EyObujjajja', 
    url: 'https://s5.voscast.com:9909/EYOBUJJAJJA',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/cbs-buganda.png'
  },
  { 
    name: 'Radio CBS Emmanduso', 
    url: 'https://s5.voscast.com:9905/EMMANDUSO',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/cbs-buganda.png'
  },
  { 
    name: 'Akaboozi 2', 
    url: 'http://162.244.80.52:8732/;stream.mp3',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/akaboozi-fm.png'
  },
  { 
    name: 'Radio Simba', 
    url: 'https://www.radiosimba.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/simba.png'
  },
  { 
    name: 'Radio Pacis (Arua)', 
    url: 'https://radiopacisuganda.radioca.st/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/pacis.png'
  },
  { 
    name: 'K FM', 
    url: 'https://www.kfm.co.ug/?radio_player_play=http%3A%2F%2Fradio.kfm.co.ug%3A8000%2Fstream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/kfm.png'
  },
  { 
    name: 'Radio City ', 
    url: 'https://www.radiocity.ug/',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/radiocity.png'
  },
  { 
    name: 'Radio Rupiny', 
    url:  'https://stream.hydeinnovations.com:2020/stream/rupiny/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/rupiny.png'
  },
  { 
    name: 'Pearl Radio', 
    url: 'https://dc4.serverse.com/proxy/pearlfm/stream/1/',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/pearl-107-9.png'
  },
  { 
    name: 'Connect Uganda Radio', 
    url: 'https://player.connectuganda.com:8000/connect.mp3',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/connect-kampala.png'
  },
  
]

interface IconInputProps {
  placeholder: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

const IconInput: React.FC<IconInputProps> = ({ placeholder, onChange, className }) => {
  return (
    <div className="relative flex items-center">
      <SearchIcon className="absolute left-3 h-4 w-4 text-gray-500" />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className={`pl-10 ${className}`} 
      />
    </div>
  )
}

export default function UgstreamApp() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [sound, setSound] = useState<Howl | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<string>('home')
  const [favorites, setFavorites] = useState<Station[]>([])
  const [buffering, setBuffering] = useState<boolean>(false)

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase())
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
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
        setBuffering(false)
      },
      onloaderror: () => setBuffering(false),
      onplayerror: () => setBuffering(false),
      onend: () => setPlaying(null),
    })

    newSound.play()
    setSound(newSound)
  }

  const nextStation = () => {
    const currentIndex = stations.findIndex(st => st.name === playing)
    const nextIndex = (currentIndex + 1) % stations.length
    togglePlay(stations[nextIndex])
  }

  const previousStation = () => {
    const currentIndex = stations.findIndex(st => st.name === playing)
    const prevIndex = (currentIndex - 1 + stations.length) % stations.length
    togglePlay(stations[prevIndex])
  }

  const toggleFavorite = (station: Station) => {
    setFavorites((prevFavorites) =>
      prevFavorites.some(fav => fav.name === station.name)
        ? prevFavorites.filter(fav => fav.name !== station.name)
        : [...prevFavorites, station]
    )
  }

  const renderContent = () => {
    const stationsToDisplay = currentPage === 'favorites' ? favorites : stations.filter(station =>
      station.name.toLowerCase().includes(searchTerm)
    )

    if (currentPage === 'favorites' && favorites.length === 0) {
      return (
        <div className="p-4">
          <h2 className="text-xl font-semibold">No favorites added yet!</h2>
        </div>
      )
    }

    return (
      <>
        {currentPage === 'home' && (
          <div className="mb-6">
            <IconInput
              placeholder="Search radio stations..."
              onChange={handleSearch}
              className="w-full"
            />
          </div>
        )}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {stationsToDisplay.map((station) => (
              <Card key={station.name} className="cursor-pointer hover:shadow-md transition-shadow">
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
                    <HeartIcon className={`h-4 w-4 ${favorites.some(fav => fav.name === station.name) ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                    <span className="sr-only">{favorites.some(fav => fav.name === station.name) ? 'Remove from favorites' : 'Add to favorites'}</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    {playing === station.name && !buffering ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">{playing === station.name && !buffering ? 'Pause' : 'Play'}</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-green-100">
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
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
              <Button variant="ghost" onClick={() => handlePageChange('home')}>
                <HomeIcon className="mr-2 h-4 w-4" /> Home
              </Button>
              <Button variant="ghost" onClick={() => handlePageChange('favorites')}>
                <HeartIcon className="mr-2 h-4 w-4" /> Favorites
              </Button>
              <Button variant="ghost" onClick={() => handlePageChange('rate')}>
                <StarIcon className="mr-2 h-4 w-4" /> Rate this App
              </Button>
              <Button variant="ghost" onClick={() => handlePageChange('coffee')}>
                <CoffeeIcon className="mr-2 h-4 w-4" /> Buy me a Coffee
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold">ugstream</h1>
        <div className="w-6" /> {/* Spacer for centering */}
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Player Controls */}
      {playing && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex items-center justify-between">
          <p className="text-sm font-medium">{playing}</p>
          {buffering ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={previousStation}>
                <SkipBackIcon className="h-4 w-4" />
                <span className="sr-only">Previous station</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => {
                const currentStation = stations.find(st => st.name === playing)
                if (currentStation) togglePlay(currentStation)
              }}>
                {sound?.playing() ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
                <span className="sr-only">{sound?.playing() ? 'Pause' : 'Play'}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={nextStation}>
                <SkipForwardIcon className="h-4 w-4" />
                <span className="sr-only">Next station</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
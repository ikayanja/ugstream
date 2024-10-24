import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  TextField,
  InputAdornment,
  Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RadioIcon from '@mui/icons-material/Radio'; // Fallback icon for missing logos
import { Howl } from 'howler';

const stations = [
  { 
    name: 'Radio One', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/one.png' 
  },
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
    name: 'Radio CBS Emmanduso', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/cbs-buganda.png'
  },
  { 
    name: 'Akaboozi 2', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/akaboozi-fm.png'
  },
  { 
    name: 'Radio Simba', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/simba.png'
  },
  { 
    name: 'Power FM', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/power-fm.png'
  },
  { 
    name: 'K FM', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/kfm.png'
  },
  { 
    name: 'Radio City ', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/radiocity.png'
  },
  { 
    name: 'Radio Rupiny', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/rupiny.png'
  },
  { 
    name: 'Pearl Radio', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/pearl-107-9.png'
  },
  { 
    name: '91.2 Crooze FM', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/91-2-crooze-fm.png'
  },
  { 
    name: 'Alpha FM', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/alpha-fm-kampala-uganda.png'
  },
  { 
    name: 'Yofochm Radio', 
    url: 'https://radioonefm90.co.ug:8000/stream',
    logo: 'https://cdn.instant.audio/images/logos/radio-co-ug/yofochm.png'
  },
];

function App() {
  const [playing, setPlaying] = useState(null);
  const [sound, setSound] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [setError] = useState(null);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm)
  );

  const togglePlay = (station) => {
    try {
      if (sound) {
        sound.unload();
      }
      
      if (playing === station.name) {
        setPlaying(null);
        setSound(null);
      } else {
        const newSound = new Howl({
          src: [station.url],
          html5: true,
          format: ['mp3', 'aac'],
          onplay: () => {
            console.log('Playing:', station.name);
            setPlaying(station.name);
          },
          onloaderror: (id, err) => {
            console.error('Load Error:', err);
            setError(`Failed to load ${station.name}`);
            setPlaying(null);
          },
          onplayerror: (id, err) => {
            console.error('Play Error:', err);
            setError(`Failed to play ${station.name}`);
            setPlaying(null);
          }
        });
        
        newSound.play();
        setSound(newSound);
      }
    } catch (err) {
      console.error('Toggle play error:', err);
      setError(`Error playing ${station.name}`);
      setPlaying(null);
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  return (
    <div style={{ backgroundColor: '#d5f5e8', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        sx={{
          width: '100%',
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: '#1976d2',
        }}
      >
        <Toolbar 
          sx={{
            justifyContent: 'center',
            minHeight: '56px',
            width: '100%'
          }}
        >
          <Typography 
            variant="h6"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Ugstream
          </Typography>
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth="sm" 
        sx={{
          marginTop: '2rem',
          paddingX: '1rem',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search radio stations..."
          onChange={handleSearch}
          sx={{
            marginBottom: '2rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Radio Stations List */}
        <Grid container spacing={2}>
          {filteredStations.map((station) => (
            <Grid item xs={12} key={station.name}>
              <Card 
                onClick={() => togglePlay(station)}
                sx={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '16px',
                    '&:last-child': { paddingBottom: '16px' }
                  }}
                >
                  {/* Logo or Fallback */}
                  <div style={{ marginRight: '16px', position: 'relative' }}>
                    <Avatar
                      src={station.logo}
                      onError={handleImageError}
                      alt={station.name}
                      sx={{ width: 48, height: 48 }}
                    />
                    <RadioIcon
                      sx={{
                        display: 'none',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 48,
                        height: 48,
                        padding: '12px',
                        color: '#666'
                      }}
                    />
                  </div>

                  {/* Station Name and Playing Status */}
                  <div style={{ 
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                      {station.name}
                    </Typography>
                    {playing === station.name ? <PauseIcon /> : <PlayArrowIcon />}
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default App;
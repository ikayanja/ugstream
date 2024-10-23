import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Howl } from 'howler';

const stations = [
  { 
    name: 'Radio One', 
    url: 'https://radioonefm90.co.ug:8000/stream'  
  },
  { 
    name: 'Sanyu FM', 
    url: 'https://s44.myradiostream.com:8138/;' 
  },
  { 
    name: 'Capital FM', 
    url: 'https://capitalfm.cloudrad.io/stream'
  },
];

function App() {
  const [playing, setPlaying] = useState(null);
  const [sound, setSound] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <>
      <AppBar position="static">
        <Toolbar style={{ justifyContent: 'center' }}>
          <Typography variant="h6">Ugstream</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
        {error && (
          <Typography color="error" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
        )}
        <Grid container spacing={3}>
          {stations.map((station) => (
            <Grid item xs={12} key={station.name}>
              <Card>
                <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5">{station.name}</Typography>
                  <IconButton onClick={() => togglePlay(station)}>
                    {playing === station.name ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default App;
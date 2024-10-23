   import React, { useState } from 'react';
   import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, IconButton } from '@material-ui/core';
   import { PlayArrow, Pause } from '@material-ui/icons';
   import { Howl } from 'howler';

   const stations = [
     { name: 'Radio One', url: 'https://streaming.capitalfm-ug.net' },
     { name: 'Sanyu FM', url: 'http://radioonefm90.co.ug:8000/stream' },
     { name: 'Capital FM', url: 'http://cbsradio.streamgates.net/cbsradio' },
   ];

   function App() {
     const [playing, setPlaying] = useState(null);
     const [sound, setSound] = useState(null);

     const togglePlay = (station) => {
       if (sound) {
         sound.unload();
       }
       if (playing === station.name) {
         setPlaying(null);
       } else {
         const newSound = new Howl({
           src: [station.url],
           html5: true,
         });
         newSound.play();
         setSound(newSound);
         setPlaying(station.name);
       }
     };

     return (
       <>
         <AppBar position="static">
           <Toolbar>
             <Typography variant="h6">Uganda Radio</Typography>
           </Toolbar>
         </AppBar>
         <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
           <Grid container spacing={3}>
             {stations.map((station) => (
               <Grid item xs={12} key={station.name}>
                 <Card>
                   <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="h5">{station.name}</Typography>
                     <IconButton onClick={() => togglePlay(station)}>
                       {playing === station.name ? <Pause /> : <PlayArrow />}
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
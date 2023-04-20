fetch('https://sensornetwork.diptsrv003.bth.se/api/v3/locations')
   .then(response => response.text())
   .then(text => console.log(text))
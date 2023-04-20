fetch('https://sensornetwork.diptsrv003.bth.se/api/v3/locations')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

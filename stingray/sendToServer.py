import requests
import signal
import urllib3
import json
import datetime
from hardware import setup, get_latitude, get_longitude, get_pitch, get_roll, get_yaw, get_temperature_water

API_URL = "http://10.0.4.48:3010/api/v3/moving-stations/measurements"#ip adress
#API_URL = "https://sensornetwork.diptsrv003.bth.se/api/v3/moving-stations/measurements"

def connect_server():
    http = urllib3.PoolManager()
    try:
        request = http.request('GET', API_URL)
    except:
        print("Bad request. Terminating")
        return -1
    if request.status != 200:
        print("Server could not be reached: ",request.status)
        return -1
    print("Server reached: ",request.status)
    return request

def packageAndSendToServer(signum, frame):
    pos_dict = {
        "long": get_longitude(),
        "lat": get_latitude()
    }
    sensor_dict = {
        "temperature" : get_temperature_water(),
        "pitch" : get_pitch(),
        "pitch units" : "deg",
        "roll" : get_roll(),
        "roll units" : "deg",
        "yaw" : get_yaw(), 
        "yaw units" : "deg"
    }
    json_dict = {
        "time": datetime.datetime.now().isoformat(),
        "stingray-id": 0,
        "position": pos_dict,
        "data" : sensor_dict
    }

    try:
        response = requests.post(API_URL, json.dumps(json_dict))
    except:
        print("Bad request")

    print("package sent")
    print(json_dict)


def main():
    # Your code goes here
    time = 0.5
    #Sets a signal that will react to an alarm, and do getSonsorValues then
    signal.signal(signal.SIGALRM, packageAndSendToServer)
    #Sets the alarm to a "time" inverval with a "time" wait for the first time
    signal.setitimer(signal.ITIMER_REAL, time, time)
    while(True):
        pass
    # Your code ends here

if __name__ == "__main__":
    setup()
    server = connect_server()
    if(server != -1):
            main()
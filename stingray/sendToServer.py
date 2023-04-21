import glob
import requests
import signal
import urllib3
import json
from mpu6050 import mpu6050
import datetime
import hardware

MPU = mpu6050(0x68)
AM2302_PIN = 2
# DHT_SENSOR = adafruit_dht.DHT22(AM2302_PIN)
DS18B20 = glob.glob("/sys/bus/w1/devices/" + "28*")[0] + "/w1_slave"

API_URL = "http://10.0.4.48:3010/api/v3/health"#ip adress
#API_URL = "https://sensornetwork.diptsrv003.bth.se/api/v3"

def connect_server():
    http = urllib3.PoolManager()
    # request = http.request('GET', "https://sensornetwork.diptsrv003.bth.se")

    request = http.request('GET', API_URL)
    if request.status != 200:
        print("Server could not be reached: ",request.status)
        return -1
    print("Server reached: ",request.status)
    return request

def create_data_dict() -> dict:
    sensor_dict = {
        "temperature" : hardware.get_temperature_water(),
        "pitch" : hardware.get_pitch(),
        "pitch units" : "deg",
        "roll" : hardware.get_roll(),
        "roll units" : " deg",
        "yaw" : hardware.get_yaw(),
        "yaw units" : " deg"
    }
    return sensor_dict


def packageAndSendToServer(signum, frame):
    list_of_data = []
    list_of_data.append(create_data_dict())
    pos_dict = {
        "long": hardware.get_longitude(),
        "lat": hardware.get_latitude()
    }
    json_dict = {
        "time": datetime.datetime.now().isoformat(),
        "stationId": 1,
        "position": pos_dict,
        "data" : list_of_data
    }
    
    with open('data.json', 'w') as f:
        json.dump(json_dict, f)

    response = requests.post(API_URL, json.dumps(json_dict))
    print("package sent")
    print(json_dict)


def main():
    # Your code goes here
    time = 10
    #Sets a signal that will react to an alarm, and do getSonsorValues then
    signal.signal(signal.SIGALRM, packageAndSendToServer)
    #Sets the alarm to a "time" inverval with a "time" wait for the first time
    signal.setitimer(signal.ITIMER_REAL, time, time)
    while(True):
        pass
    # Your code ends here
    #Thinking of using signals and a timer to do this every 2 seconds
    return 0

if __name__ == "__main__":
    hardware.setup()
    server = connect_server()
    # if(server != -1):
    main()
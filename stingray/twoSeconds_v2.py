import RPi.GPIO as GPIO
import adafruit_dht
import glob
import requests
import signal
import urllib3
import json
from mpu6050 import mpu6050
import time
import math

MPU = mpu6050(0x68)
AM2302_PIN = 2
# DHT_SENSOR = adafruit_dht.DHT22(AM2302_PIN)
DS18B20 = glob.glob("/sys/bus/w1/devices/" + "28*")[0] + "/w1_slave"

API_URL = "http://10.0.4.48:3010/api/v3/health"#ip adress
#API_URL = "https://sensornetwork.diptsrv003.bth.se/api/v3"

def connect_sensor():
    while True:
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)
            break

        except RuntimeError as error:
            print("Could not establish a connection to the Raspberry Pi")

def connect_server():
    http = urllib3.PoolManager()
    # request = http.request('GET', "https://sensornetwork.diptsrv003.bth.se")

    request = http.request('GET', API_URL)
    if request.status != 200:
        print("Server could not be reached: ",request.status)
        return -1
    print("Server reached: ",request.status)
    return request

# def read_temperature():
#     """
#     Returns the temperature as celsius
#     """
    
#     try:
#         temperature = DHT_SENSOR.temperature
#     except:
#         temperature = -1
#         print("Got exeption on temprature")
#     if temperature == None:
#         temperature = -1
#         print("Got no temprature")
#     return temperature

# def read_humidity():
#     """
#     Returns the humidity as relative humidity
#     """

#     try:
#         humidity = DHT_SENSOR.humidity
#     except:
#         humidity = -1
#         print("Got exeption on humidity")
#     if humidity == None:
#         humidity = -1
#         print("Got no humidity")
    
#     return humidity

def read_temperature_water():
    """
    Returns the temperature as celsius
    """
    try:
        with open(DS18B20, "r") as f:
            lines = f.readlines()
        
        if lines[0].strip()[-3:] != "YES":
            return -1
        
        equals_pos = lines[1].find("t=")
        if equals_pos == -1:
            return -1
        
        temp_string = lines[1][equals_pos+2:]
        temp_in_c = round(float(temp_string) / 1000.0, 2)
        return temp_in_c
    except:
        return -1

def server_health():
    url = API_URL + "/health"
    res = requests.get(url).json() 
    return res["status"]

def get_sensor_values(signum, frame):
    print("Server API:", API_URL)
    health = server_health()
    print("Server health:",health)

    # print("Temp:", read_temperature(), "Celsius")
    # print("Humidity:", read_humidity(), "%")
    print("Water temp:", read_temperature_water(), "Celsius")

def get_pitch():
    accel_data = MPU.get_accel_data()
    # while(accel_data['x'] == 0 and accel_data['y'] == 0 and accel_data['z'] == 0):
    #     accel_data = MPU.get_accel_data()
    # print("accel data received")
    
    if(accel_data['x'] != 0 and accel_data['y'] != 0 and accel_data['z'] != 0):
        pitch = 180 * math.atan(accel_data['x']/math.sqrt(accel_data['y']*accel_data['y'] + accel_data['z']*accel_data['z']))/math.pi
    else:
        print("accel data zero")
        pitch = 0
    return pitch

def get_roll():
    accel_data = MPU.get_accel_data()
    if(accel_data['x'] != 0 and accel_data['y'] != 0 and accel_data['z'] != 0):
        roll = 180 * math.atan(accel_data['y']/math.sqrt(accel_data['x']*accel_data['x'] + accel_data['z']*accel_data['z']))/math.pi
    else:
        print("accel data zero")
        roll = 0
    return roll 

def get_yaw():
    accel_data = MPU.get_accel_data()
    if(accel_data['x'] != 0 and accel_data['y'] != 0 and accel_data['z'] != 0):
        yaw = 180 * math.atan(accel_data['z']/math.sqrt(accel_data['x']*accel_data['x'] + accel_data['z']*accel_data['z']))/math.pi
    else:
        print("accel data zero")
        yaw = 0
    return yaw

def create_data_dict() -> dict:
    sensor_dict = {
        "temperature" : read_temperature_water(),
        "pitch" : get_pitch(),
        "pitch units" : "Degrees",
        "roll" : get_roll(),
        "roll units" : " Degrees",
        "yaw" : get_yaw(),
        "yaw units" : " Degrees"
    }
    data_dict = {
        "timestamp" : time.ctime(),
        "UTC_Offset" : 1,
        "longitude" : 0,
        "latitude" : 0,
        "sensors" : sensor_dict
    }
    return data_dict


def packageAndSendToServer(signum, frame):
    list_of_data = []
    list_of_data.append(create_data_dict())
    json_dict = {
        "data" : list_of_data
    }
    #encoded_json = json.dumps(json_dict).encode("utf-8")
    
    #http = urllib3.PoolManager()
    response = requests.post(API_URL, json.dumps(json_dict))
    #response = http.request(
    #    method = 'POST',
    #    url = API_URL,
    #    body = encoded_json,
    #    headers = {
    #        "Content-Length" : len(encoded_json),
    #        "Content-Type" : "application/json",
    #        "Authorization" : "Bearer default"
    #    }
    #)
    #print(response.status)
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
    connect_sensor()
    server = connect_server()
    # if(server != -1):
    main()
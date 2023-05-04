import RPi.GPIO as GPIO
import glob
from mpu6050 import mpu6050
import math

MPU = mpu6050(0x68)
AM2302_PIN = 2
# DHT_SENSOR = adafruit_dht.DHT22(AM2302_PIN)
DS18B20 = glob.glob("/sys/bus/w1/devices/" + "28*")[0] + "/w1_slave"

def connect_sensor():
    while True:
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)
            break

        except RuntimeError as error:
            print("Could not establish a connection to the Raspberry Pi")

def get_temperature_water():
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

def get_pitch():
    accel_data = MPU.get_accel_data()
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

def get_longitude():
    return 0

def get_latitude():
    return 0

def setup():
    connect_sensor()
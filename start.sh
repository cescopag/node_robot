#!/bin/bash
echo "Connecting bluetooth ..."
sudo rfcomm release 0
sudo rfcomm connect 0 98:D3:31:40:04:6B &
echo "Network interface ..."
ifconfig wlan0
sleep 10
echo "Connecting robot ..."
sudo node robot.js

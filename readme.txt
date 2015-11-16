# collegare bluetooth
sudo rfcomm bind 0 98:D3:31:40:04:6B

# verificare stato bluetooth
frcomm show 0

# disconnettere bluetooth
sudo rfcomm release 0

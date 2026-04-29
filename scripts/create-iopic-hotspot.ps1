# PowerShell script to create a WiFi hotspot named IOPIC
# Run as Administrator

$ssid = "IOPIC"
$key = "IOPIC2026"

netsh wlan set hostednetwork mode=allow ssid=$ssid key=$key
netsh wlan start hostednetwork
Write-Host "Hotspot '$ssid' started. Devices can now connect using password: $key"

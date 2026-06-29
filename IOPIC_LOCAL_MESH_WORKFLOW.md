# IOPIC Local Mesh Onboarding Workflow

## 1. WiFi Hotspot Setup

- Use your OS or router to create a WiFi network named `IOPIC` (open or simple passphrase).
- Optionally, use the provided PowerShell or Bash script to automate hotspot creation.

## 2. Captive Portal/Local Server

- Run your IOPIC app/server on the host device (e.g., http://192.168.4.1:5173).
- Configure the router or OS to redirect all new connections to the onboarding UI (e.g., `/citizen-audit`).
- For Windows: Use built-in Mobile Hotspot and set up a local DNS/captive portal.
- For Linux: Use `hostapd` and `dnsmasq` for hotspot and DNS redirection.

## 3. QR Code Onboarding

- Generate a QR code with WiFi credentials and onboarding URL.
- Display the QR code on a screen or print for easy device connection.
- Use the Vue QR code component for this step.

## 4. Onboarding UI

- When users connect, they are redirected to `/citizen-audit`.
- Users complete the audit and are registered as nodes in the mesh.
- Optionally, display `/pharmacy` for entheogen distribution info.

## 5. Node Registration & Mesh Sync

- On successful audit, the backend registers the node (device info, timestamp, etc.).
- Use WebSocket or WebRTC for real-time mesh sync and communication.
- Each node can see other connected nodes and their audit status.

## 6. Security & Privacy

- All onboarding and node data is local to the mesh unless explicitly shared.
- No external internet required for local mesh operation.

---

## Example PowerShell Hotspot Script (Windows)

```powershell
# Set up WiFi hotspot named IOPIC
netsh wlan set hostednetwork mode=allow ssid=IOPIC key=IOPIC2026
netsh wlan start hostednetwork
```

## Example Bash Hotspot Script (Linux)

```bash
# Install hostapd and dnsmasq, then configure as needed
# This is a simplified example
sudo nmcli dev wifi hotspot ifname wlan0 ssid IOPIC password IOPIC2026
```

---

## Next Steps

- Add the Vue QR code component to your onboarding page.
- Wire the audit UI to the backend for node registration.
- Use WebSocket/WebRTC for mesh sync.
- Test the full workflow with multiple devices.

---

For further automation or code samples, see the scripts and components in this repo.

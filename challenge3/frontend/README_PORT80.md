# Running Frontend on Port 80

Port 80 is a privileged port (ports 1-1023) that requires administrator/root privileges on macOS and Linux.

## Option 1: Run with sudo (macOS/Linux)

```bash
cd challenge3/frontend
sudo npm start
```

**Note:** You may need to enter your password when prompted.

## Option 2: Use authbind (Linux only)

If you're on Linux and want to avoid using sudo:

```bash
# Install authbind
sudo apt-get install authbind

# Allow port 80 for your user
sudo touch /etc/authbind/byport/80
sudo chmod 500 /etc/authbind/byport/80
sudo chown $USER /etc/authbind/byport/80

# Run with authbind
cd challenge3/frontend
authbind --deep npm start
```

## Option 3: Use port forwarding (macOS)

On macOS, you can use `pfctl` to forward port 80 to a higher port:

```bash
# Forward port 80 to 3000 (run once)
echo "rdr on lo0 inet proto tcp from any to any port 80 -> 127.0.0.1 port 3000" | sudo pfctl -ef -

# Then run frontend on port 3000
cd challenge3/frontend
# Change vite.config.ts port back to 3000
npm start
```

## Option 4: Use a reverse proxy (Production)

For production, use nginx or Apache as a reverse proxy:

```nginx
# nginx example
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

## Recommended: Use Port 3000 for Development

For development, it's recommended to use port 3000 (or any port above 1024) to avoid permission issues:

```bash
cd challenge3/frontend
npm start
# Frontend will run on http://localhost:3000
```

Then update the short URL display in `App.tsx` to use port 3000.

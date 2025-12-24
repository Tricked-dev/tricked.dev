---
layout: "../../layouts/BlogPost.astro"
title: "Building a Whitelisted WiFi Router with NixOS"
description: "How I turned my NixOS machine into a WiFi access point with domain/IP whitelisting using hostapd, dnsmasq, and iptables"
pubDate: "Dec 24 2025"
heroImage: "/assets/PXL_20251224_085910053.jpg"
---

I recently bought a Boox eReader but i didn't want to expose it too much to the internet due to it running Android 11 which is 5 years old! with little to no security updates so i decided that creating my own network access point using the wifi built into my pc would be the perfect solution as it would also let me disable all homecalling that the eReader does.

The setup uses a NixOS machine with two network interfaces: an ethernet connection (`enp10s0`) for internet access, and a WiFi card (`wlp9s0`) to create the access point. All traffic from WiFi clients gets filtered through iptables rules before being forwarded to the internet.

## The Basic Setup

First, we need to prevent NetworkManager from managing the WiFi interface since hostapd will handle it:

```nix
networking.networkmanager = {
  unmanaged = [ "wlp9s0" ];
  wifi.powersave = false;
};

networking.wireless.enable = false;
```

Set the WiFi regulatory domain (replace `NL` with your country code):

```nix
boot.extraModprobeConfig = ''
  options cfg80211 ieee80211_regdom=NL
'';
```

## Unblocking WiFi RF-kill

This was a fun one to debug. NetworkManager can block WiFi with RF-kill, which prevents hostapd from starting. The solution is to create a systemd service that unblocks it after NetworkManager starts:

```nix
systemd.services.unblock-wifi-rfkill = {
  description = "Unblock WiFi RF-kill for hostapd";
  wantedBy = [ "multi-user.target" ];
  before = [ "hostapd.service" "network-addresses-wlp9s0.service" ];
  after = [ "NetworkManager.service" ];
  partOf = [ "NetworkManager.service" ];
  serviceConfig = {
    Type = "oneshot";
    ExecStart = "${pkgs.util-linux}/bin/rfkill unblock wifi";
    RemainAfterExit = true;
    Restart = "on-failure";
  };
};
```

## Setting up the Access Point

Enable IP forwarding and configure hostapd for the WiFi AP:

```nix
boot.kernel.sysctl = {
  "net.ipv4.ip_forward" = 1;
};

services.hostapd = {
  enable = true;
  radios.wlp9s0 = {
    band = "2g";
    channel = 6;
    countryCode = "NL";
    wifi4.enable = true;
    networks.wlp9s0 = {
      # IE for home :)
      ssid = "家";
      authentication = {
        mode = "wpa2-sha256";
        wpaPasswordFile = pkgs.writeText "hostapd-password" "YourSecurePassword123";
      };
    };
  };
};
```

Give the WiFi interface a static IP:

```nix
networking.interfaces.wlp9s0 = {
  ipv4.addresses = [{
    address = "192.168.100.1";
    prefixLength = 24;
  }];
};
```

## DNS Filtering with dnsmasq

Here's where the magic happens. dnsmasq acts as both DHCP server and DNS resolver, as with normal dnsmasq deployment's except in this one we block every domain by default.

If you'd prefer the opposite approach (allow everything except specific domains), you can use a blacklist instead. Just remove the `address = "/#/0.0.0.0";` line and instead add entries like `address = "/blocked-domain.com/0.0.0.0"` for each domain you want to block.

```nix
services.resolved.enable = false;

services.dnsmasq = {
  enable = true;
  resolveLocalQueries = false;
  settings = {
    interface = "wlp9s0";
    bind-interfaces = true;
    except-interface = [ "enp10s0" "lo" ];

    dhcp-range = [ "192.168.100.100,192.168.100.200,24h" ];
    dhcp-option = [
      "option:router,192.168.100.1"
      "option:dns-server,192.168.100.1"
    ];

    log-queries = true;
    log-facility = "/var/log/dnsmasq.log";

    # Block everything by default
    address = "/#/0.0.0.0";

    # Whitelist specific domains
    server = map (domain: "/${domain}/#") whitelistedDomains;
  };
};
```

The whitelisted domains list at the top of the config looks like this:

```nix
whitelistedDomains = [
  "google.com"
  "gmail.com"
  "github.com"
  "googleapis.com"
  "reddit.com"
  "spotify.com"
  # ... etc
];
```

## NAT Configuration

Enable NAT to route traffic from the WiFi network to the internet:

```nix
networking.nat = {
  enable = true;
  externalInterface = "enp10s0";
  internalInterfaces = [ "wlp9s0" ];
};
```

## The iptables Filtering

This is the most important part. The firewall rules are split into three categories:

1. **Google subnets** - Allow ALL ports (Play Store needs random ports)
2. **Whitelisted subnets** - Only HTTP/HTTPS/QUIC/NTP/Google Push
3. **Everything else** - Blocked and logged

```nix
networking.firewall = {
  trustedInterfaces = [ "enp10s0" ];

  extraCommands = ''
    # Allow DNS and DHCP to WiFi clients
    iptables -A INPUT -i wlp9s0 -s 192.168.100.0/24 -p udp --dport 53 -j ACCEPT
    iptables -A INPUT -i wlp9s0 -s 192.168.100.0/24 -p tcp --dport 53 -j ACCEPT
    iptables -A INPUT -i wlp9s0 -p udp --dport 67 -j ACCEPT

    # Redirect all DNS to our dnsmasq (transparent proxy)
    iptables -t nat -A PREROUTING -i wlp9s0 -s 192.168.100.0/24 -p udp --dport 53 -j DNAT --to 192.168.100.1:53
    iptables -t nat -A PREROUTING -i wlp9s0 -s 192.168.100.0/24 -p tcp --dport 53 -j DNAT --to 192.168.100.1:53

    # Default deny
    iptables -P FORWARD DROP
    iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT

    # Allow NTP globally
    iptables -A FORWARD -i wlp9s0 -s 192.168.100.0/24 -p udp --dport 123 -j ACCEPT

    # Google IPs - ALL PORTS
    ${pkgs.lib.concatMapStringsSep "\n    " (entry:
      "iptables -A FORWARD -i wlp9s0 -s 192.168.100.0/24 -d ${entry.subnet} -j ACCEPT  # ${entry.comment}"
    ) googleSubnets}

    # Other subnets - limited ports
    ${pkgs.lib.concatMapStringsSep "\n    " (entry: ''
      iptables -A FORWARD -i wlp9s0 -s 192.168.100.0/24 -d ${entry.subnet} -p tcp --dport 80 -j ACCEPT
      iptables -A FORWARD -i wlp9s0 -s 192.168.100.0/24 -d ${entry.subnet} -p tcp --dport 443 -j ACCEPT
      iptables -A FORWARD -i wlp9s0 -s 192.168.100.0/24 -d ${entry.subnet} -p udp --dport 443 -j ACCEPT
      iptables -A FORWARD -i wlp9s0 -s 192.168.100.0/24 -d ${entry.subnet} -p tcp --dport 5228:5230 -j ACCEPT
    '') whitelistedSubnets}

    # Log blocked traffic
    iptables -A FORWARD -i wlp9s0 -s 192.168.100.0/24 -j LOG --log-prefix "BLOCKED: " --log-level 4
  '';
};
```

## The NAT Bypass Fix

Here's a critical gotcha: NixOS's `networking.nat` module adds a blanket ACCEPT rule to the `nixos-filter-forward` chain that bypasses ALL our filtering. We need to remove it:

```nix
systemd.services.firewall-fix-nat = {
  description = "Remove NAT's blanket ACCEPT from nixos-filter-forward chain";
  after = [ "firewall.service" ];
  wantedBy = [ "multi-user.target" ];
  serviceConfig = {
    Type = "oneshot";
    RemainAfterExit = true;
    ExecStart = "${pkgs.iptables}/bin/iptables -D nixos-filter-forward -i wlp9s0 -o enp10s0 -j ACCEPT";
  };
};
```

Without this service, all your carefully crafted iptables rules are completely useless. Ask me how I know.

## Monitoring with ntopng


To see what's happening on the network in real-time:

```nix
services.ntopng = {
  enable = true;
  interfaces = [ "wlp9s0" ];
  httpPort = 3000;
  extraConfig = ''
    --disable-login=1
  '';
};
```

Access it at `http://192.168.100.1:3000` to see bandwidth usage, top talkers, and protocol breakdowns.

## Subnet Lists

I enabled all of google cause i wanted to use the playstore and stuff but you can obviously leave this array empty / remove it even

The subnet lists at the top define what gets through:


```nix
googleSubnets = [
    {
      subnet = "8.8.8.8/32";
      comment = "Google DNS";
    }
    {
      subnet = "216.239.0.0/15";
      comment = "Google/YouTube/Gmail";
    }
    {
      subnet = "142.250.0.0/15";
      comment = "Google services";
    }
    {
      subnet = "172.217.0.0/16";
      comment = "Google infrastructure";
    }
    {
      subnet = "34.117.0.0/16";
      comment = "Google Cloud";
    }
    {
      subnet = "74.125.0.0/15";
      comment = "Google services";
    }
    {
      subnet = "108.177.0.0/16";
      comment = "Google CDN";
    }
    {
      subnet = "173.194.0.0/16";
      comment = "Google infrastructure";
    }
    {
      subnet = "192.178.0.0/16";
      comment = "Google CDN";
    }
    {
      subnet = "216.58.192.0/19";
      comment = "Google";
    }
    {
      subnet = "209.85.0.0/16";
      comment = "Google";
    }
];

whitelistedSubnets = [
  { subnet = "1.1.1.1/32"; comment = "Cloudflare DNS"; }
  { subnet = "192.168.50.0/24"; comment = "Local network"; }
  { subnet = "140.82.121.0/24"; comment = "GitHub"; }
  { subnet = "160.79.104.0/23"; comment = "Anthropic/Claude"; }
  # ... more ranges
];
```

## Adding New Sites

To whitelist a new domain:

1. Add it to `whitelistedDomains` list
2. Find the IP ranges it uses (use `dig`, `host` or check DNS logs)
3. Add those ranges to `whitelistedSubnets`
4. Rebuild with `nixos-rebuild switch`

You can monitor `/var/log/dnsmasq.log` and kernel logs to see what's being blocked and adjust accordingly.

## Useful Debugging Commands

```bash
# Watch blocked traffic in real-time
sudo journalctl -kf | grep BLOCKED

# See DNS queries
sudo tail -f /var/log/dnsmasq.log

# Check iptables rules
sudo iptables -L FORWARD -v -n

# See NAT table
sudo iptables -t nat -L -v -n
```

or a script which Claude Code made

```py
#!/usr/bin/env python3
"""
Analyze blocked traffic from the router and generate whitelist entries.
Run with: sudo python3 analyze_blocked_traffic.py
"""

import subprocess
import re
import socket
from collections import defaultdict
from ipaddress import ip_address, ip_network
import sys

def run_command(cmd):
    """Run a shell command and return output."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        return result.stdout
    except Exception as e:
        print(f"Error running command: {e}", file=sys.stderr)
        return ""

def get_blocked_ips(minutes=10):
    """Get blocked destination IPs from kernel logs."""
    cmd = f'journalctl -k --since "{minutes} minutes ago" --no-pager | grep "BLOCKED:"'
    output = run_command(cmd)

    ips = set()
    for line in output.split('\n'):
        match = re.search(r'DST=([0-9.]+)', line)
        if match:
            ips.add(match.group(1))

    return sorted(ips)

def get_dns_queries(minutes=10):
    """Get DNS queries from WiFi clients."""
    cmd = 'tail -1000 /var/log/dnsmasq.log | grep "from 192.168.100"'
    output = run_command(cmd)

    domains = set()
    for line in output.split('\n'):
        parts = line.split()
        if len(parts) >= 6 and (parts[3] == 'query[A]' or parts[3] == 'query[AAAA]'):
            domain = parts[5]
            # Filter out localhost queries
            if not domain.startswith('127.'):
                domains.add(domain)

    return sorted(domains)

def resolve_ip(ip):
    """Try to reverse resolve an IP to domain."""
    try:
        hostname = socket.gethostbyaddr(ip)[0]
        return hostname
    except:
        return None

def identify_service(ip, hostname=None):
    """Identify service/company from IP or hostname."""
    ip_obj = ip_address(ip)

    # Common IP ranges
    ranges = {
        "Google": ["216.239.32.0/19", "142.250.0.0/15", "172.253.0.0/16", "74.125.0.0/16", "209.85.128.0/17"],
        "GitHub": ["140.82.121.0/24", "192.30.252.0/22"],
        "GitHub Pages/Assets": ["185.199.108.0/22"],
        "Cloudflare": ["104.16.0.0/13", "172.64.0.0/13"],
        "Fastly": ["151.101.0.0/16"],
        "Spotify": ["35.186.224.0/24", "199.232.0.0/16"],
        "Microsoft/Office365": ["13.64.0.0/11", "20.33.0.0/16", "40.74.0.0/15", "52.96.0.0/14", "104.244.42.0/24"],
        "Amazon AWS": ["13.32.0.0/15", "13.248.0.0/16", "52.0.0.0/11"],
        "DigitalOcean": ["159.203.0.0/16", "165.227.0.0/16"],
        "Akamai": ["23.0.0.0/8"],
    }

    for service, subnets in ranges.items():
        for subnet in subnets:
            if ip_obj in ip_network(subnet):
                return service

    # Check hostname
    if hostname:
        hostname_lower = hostname.lower()
        if any(x in hostname_lower for x in ['google', 'youtube', 'gmail']):
            return "Google"
        elif any(x in hostname_lower for x in ['github']):
            return "GitHub"
        elif any(x in hostname_lower for x in ['spotify']):
            return "Spotify"
        elif any(x in hostname_lower for x in ['microsoft', 'office', 'outlook']):
            return "Microsoft/Office365"
        elif any(x in hostname_lower for x in ['reddit']):
            return "Reddit"
        elif any(x in hostname_lower for x in ['cloudflare']):
            return "Cloudflare"

    return "Unknown"

def suggest_subnet(ip, service):
    """Suggest appropriate subnet for an IP."""
    ip_obj = ip_address(ip)
    octets = str(ip).split('.')

    # For known services, use their common ranges
    if service == "Google":
        # Google has large /15 ranges
        return f"{octets[0]}.{octets[1]}.0.0/15"
    elif service == "GitHub":
        return f"{octets[0]}.{octets[1]}.{octets[2]}.0/24"
    elif service in ["Microsoft/Office365", "Amazon AWS"]:
        # AWS/Azure use /14-/16 ranges
        return f"{octets[0]}.{octets[1]}.0.0/16"
    else:
        # Default to /24 for unknown services
        return f"{octets[0]}.{octets[1]}.{octets[2]}.0/24"

def extract_base_domain(domain):
    """Extract base domain from subdomain."""
    parts = domain.split('.')
    if len(parts) >= 2:
        return '.'.join(parts[-2:])
    return domain

def main():
    print("=== Analyzing Blocked Traffic ===\n")

    # Get blocked IPs
    print("Fetching blocked IPs from kernel logs...")
    blocked_ips = get_blocked_ips(minutes=10)
    print(f"Found {len(blocked_ips)} unique blocked IPs\n")

    # Get DNS queries
    print("Fetching DNS queries from dnsmasq logs...")
    dns_queries = get_dns_queries()
    print(f"Found {len(dns_queries)} unique domain queries\n")

    # Analyze IPs
    print("=" * 80)
    print("SUGGESTED SUBNET WHITELIST ENTRIES:")
    print("=" * 80)

    service_subnets = defaultdict(set)
    for ip in blocked_ips:
        hostname = resolve_ip(ip)
        service = identify_service(ip, hostname)
        subnet = suggest_subnet(ip, service)

        service_subnets[service].add(subnet)

        hostname_str = f" ({hostname})" if hostname else ""
        print(f"{ip:20} -> {subnet:20} # {service}{hostname_str}")

    print("\n" + "=" * 80)
    print("NLIX CONFIGURATION ENTRIES (Add to whitelistedSubnets):")
    print("=" * 80)

    for service, subnets in sorted(service_subnets.items()):
        for subnet in sorted(subnets):
            print(f'    {{ subnet = "{subnet}"; comment = "{service}"; }}')

    # Analyze domains
    print("\n" + "=" * 80)
    print("SUGGESTED DOMAIN WHITELIST ENTRIES:")
    print("=" * 80)

    base_domains = set()
    for domain in dns_queries:
        base = extract_base_domain(domain)
        base_domains.add(base)
        print(f"{domain:50} -> {base}")

    print("\n" + "=" * 80)
    print("NIX CONFIGURATION ENTRIES (Add to server list):")
    print("=" * 80)

    for domain in sorted(base_domains):
        print(f'        "/{domain}/1.1.1.1"')

    print("\n" + "=" * 80)
    print("SUMMARY:")
    print("=" * 80)
    print(f"Total blocked IPs: {len(blocked_ips)}")
    print(f"Total DNS queries: {len(dns_queries)}")
    print(f"Unique base domains: {len(base_domains)}")
    print(f"Services identified: {len(service_subnets)}")

if __name__ == "__main__":
    if subprocess.run("id -u", shell=True, capture_output=True).stdout.decode().strip() != "0":
        print("Warning: This script works best when run as root to access kernel logs", file=sys.stderr)

    main()
```

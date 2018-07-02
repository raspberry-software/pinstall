#!/bin/bash
#
# File:   software_raspberry_utils.sh
# Author: Rob@JavaDev
#
# Created on 17-Mar-2018, 19:02:45
#
# All Raspberry Software scripts follows the Google bash style guide naming conventions described in https://google.github.io/styleguide/shell.xml#Naming_Conventions

# This Script unique ID
readonly software_raspberry_utils=''
#Define Variables
LOG_VERBOSE=false
LOG_FILE=''
utils_properties_network_iface=''
utils_properties_network_gateway=''
utils_properties_network_local_ip=''
utils_properties_network_public_ip=''
utils_properties_pi_model=''
utils_properties_pi_name=''
utils_properties_pi_revision=''

#-------------------------- END OF Define Variables ----------------------------
#
#----------------------------- Define Functions --------------------------------

#Print line break when logging
function utils::br() {
  printf "\n"
}

# Show verbose logs given as an argument. If the log_file variable is not null then save logs in a LOG_FILE instead.
function utils::log() {
  if $LOG_VERBOSE ; then
    if [[ ! -z "${LOG_FILE// }" ]] ; then
      echo "$1" >> $LOG_FILE/logs
    else
      echo "$1"
    fi
  fi
}

# Is the current user does not have root privileges then display warning and exit the script
function utils::force_root() {
  if [ "$EUID" -ne 0 ]; then
    echo " The script requires root priviliges."
    echo " Try: sudo bash $0 <command>"
    exit 1
  fi
}

# Initialize variables (properties)
function init() {
  utils_properties_pi_ram_total=''
  utils_properties_local_ip=''
  utils_properties_iface=''
  utils_properties_pi_proc_arch=''
  local rev=$(cat /proc/cpuinfo | grep Revision)
  properties_pi_revision=${rev:(-6)}
  local pi_model=""
  properties_pi_name=$(cat /etc/os-release | grep PRETTY_NAME)
  properties_public_ip=$(curl -s checkip.dyndns.org | sed -e 's/.*Current IP Address: //' -e 's/<.*$//')
  local_ip=$(ip route get 8.8.8.8 | awk '{ print $NF; exit }')
  iface=$(route | grep '^default' | grep -o '[^ ]*$')
  local gateway=$(route -n | grep 'UG[ \t]' | awk '{print $2}')


}

# Print info
function pinfo() {
  echo "Raspberry Pi info:"; br
  java -version; br
  echo "Raspberry Pi:   $pi_model"
  echo "System:         $name"
  echo "Total Memory:   $pi_ram_total"
  utils::br
  echo "Public IP:      $public_ip"
  echo "Local IP:       $local_ip"
  echo "Gateway:        $gateway"
  echo "Interface:      $iface"
}

# Enable SSH interface.
function enable_ssh() {
  sudo -u pi touch /root/ssh || exit 1
}

# Set prerouting from port1 to port2 given as arguments
function perform_configure_prerouting() {
  local -r iface=$(route | grep '^default' | grep -o '[^ ]*$')
  local -r port_to=${BASH_ARGV[0]}
  local -r port_from=${BASH_ARGV[1]}
  local -r command=${BASH_ARGV[2]}
  if [ "$command" == "prerouting" ]; then
    utils::log "Configure prerouting on interface $iface, accept connections on ports $port_from and $port_to"
    sudo iptables -A INPUT -i $iface -p tcp --dport $port_from -j ACCEPT 
    sudo iptables -A PREROUTING -t nat -i $iface -p tcp --dport $port_from -j REDIRECT --to-port $port_to
  fi
}

# Add WLAN SSID
function perform_wifi_setup() {
  local -r psk=${BASH_ARGV[0]}
  local -r ssid=${BASH_ARGV[1]}
  local -r command=${BASH_ARGV[2]}
  if [ "$command" == "wificonfig" ]; then
    sudo printf "\n"              >> /etc/wpa_supplicant/wpa_supplicant.conf
    sudo echo "network={"         >> /etc/wpa_supplicant/wpa_supplicant.conf
    sudo echo "   ssid=\"$ssid\"" >> /etc/wpa_supplicant/wpa_supplicant.conf
    sudo echo "   psk=\"$psk\""   >> /etc/wpa_supplicant/wpa_supplicant.conf
    sudo echo "}"                 >> /etc/wpa_supplicant/wpa_supplicant.conf
    echo "Command wificonfig executed successfully."
    echo "Reboot the device to apply changes."
  fi
}

# Add WLAN SSID
function config_wifi() {
  utils::force_root
  local -r narg=${#BASH_ARGV[@]}
  if [ $narg -eq 3 ]; then
    perform_wifi_setup
  else
    echo " Invalid number of arguments."
    echo " Try: sudo bash $0 wificonfig <SSID> <PSK>"
  fi
}

function config_prerouting() {
  utils::force_root
  local -r narg=${#BASH_ARGV[@]}
  if [ $narg -eq 3 ]; then
    perform_configure_prerouting
  else
    echo " Invalid number of arguments."
    echo " Try: sudo bash $0 prerouting <PORT-FROM> <PORT-TO>"
  fi
}

#
#infoquiet

subcommand=$1;
case "$subcommand" in
  pinfo)
    pinfo
    exit;;
  enablessh)
    enable_ssh
    exit;;
  wificonfig)
    config_wifi
    exit;;
  prerouting)
    config_prerouting
    exit;;
  *)
    utils::br
    echo "Try: bash $0 <command>"
    echo " Available commands:"
    echo " pinfo                      # Prints information about Raspberry Pi"; utils::br
    echo " enablessh                  # Enable SSH"; utils::br
    echo " wificonfig <SSID> <PSK>    # Add new SSID and password settings"; utils::br
    echo " prerouting <PORt1> <PORT2> # Enable prerouting from port1 -> port2"; utils::br
    exit;;
esac

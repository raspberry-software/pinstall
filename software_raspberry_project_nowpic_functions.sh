#!/bin/bash
#
# File:   software_raspberry_project_nowpic_functions.sh
# Author: Rob@JavaDev
#
# Created on 19-Mar-2018, 14:56:30
#
#This Script unique ID
software_raspberry_project_nowpic_functions=''
#Dependencies
#If the Unique ID of the script is not defined (the script has not been loaded yet) then source the script. If the script does not exist download it and then source again.
#The +x at the end of the variable is a parameter expansion and the expression returns true if the variable is unset
if [ -z ${software_raspberry_utils+x} ]; then
  [ -f software_raspberry_utils.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/software_raspberry_utils.sh && . software_raspberry_utils.sh
fi
if[ -z ${software_raspberry_java_functions+x} ]; then
  [ -f software_raspberry_java_functions.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/software_raspberry_java_functions.sh && . software_raspberry_java_functions.sh
fi

# Define variables
readonly project_nowpic_client_home=/home/pi/nowpic/client
readonly project_nowpic_server_home=/home/pi/nowpic/server
is_install_client=false
is_install_server=false
for var in "$@"
do
  if [ "$var" = "client" ]; then
    is_install_clinent=true
  elif [ "$var" = "server" ]; then
    is_install_server=true
  fi
done

function install_nowpic_client() {
  utils::log "Install Java if necessarily"
  java::functions::install_java
  utils::log "Create project folder structure in $project_nowpic_client_home"
  mkdir -p $project_nowpic_client_home/data
  cd $project_nowpic_client_home
  wget -q -P $project_nowpic_client_home https://www.raspberrypi.software/downloads/project/nowpic/NowPicClient.tar.gz
  tar -xzf $project_nowpic_client_home/NowPicClient.tar.gz -C $project_nowpic_client_home
  utils::log "Download startup script"
  wget -q -P $project_nowpic_client_home https://www.raspberrypi.software/downloads/project/nowpic/startup-client.sh
  sudo rm $project_nowpic_client_home/client.tar.gz
  utils::log "Configure /etc/rc.local to run client on boot"
  sed -i '/exit 0/d' /etc/rc.local
#  echo "/opt/vc/bin/tvservice -o" >> /etc/rc.local
  echo "bash $project_nowpic_client_home/startup-client.sh" >> /etc/rc.local
  echo "exit 0" >> /etc/rc.local
}

function install_nowpic_server() {
  utils::log "Installing NowPic Project Server"
  utils::log "Create root dir first"
  java -jar payara-micro-5.182.jar --rootDir $project_nowpic_server_home
  utils::log "Create fat jar (uber jar)"
  java -jar payara-micro-5.182.jar --rootDir $project_nowpic_server_home --deploy web.war --lite --nocluster --outputUberJar nowpic.jar
  utils::log "TODO check necessarily permissions"
  utils::log "Add permissions"
  sudo chmod 775 nowpic.jar
  java -jar nowpic.jar
}

#================ End of Functions ==========
#
 
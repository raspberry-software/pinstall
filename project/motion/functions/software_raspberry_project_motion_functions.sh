#!/bin/bash
#
# File:   software_raspberry_project_motion_functions.sh
# Author: Rob@JavaDev
#
# Created on 17-Mar-2018, 19:02:45
#
#This Script unique ID
software_raspberry_project_motion_functions=''
# Load Dependencies
# If the Unique ID of the script is not defined (means the script has not been loaded yet) then download the script file then source the script
# The +x at the end of the variable is a parameter expansion and the expression returns true if the variable is unset
if [ -z ${software_raspberry_utils+x} ]; then
   [ -f software_raspberry_utils.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/utils/software_raspberry_utils.sh && . software_raspberry_utils.sh
fi

PROJECT_DIR=$

function project::motion::functions::install() {
  log "Start installing motion v4.1.1..."
  sudo apt-get dist-upgrade
  
  mkdir -p $PROJECT_DIR
  cd $PROJECT_DIR
  wget -q https://github.com/Motion-Project/motion/releases/download/release-4.1.1/pi_stretch_motion_4.1.1-1_armhf.deb
  sudo apt-get install gdebi-core
  sudo gdebi pi_stretch_motion_4.1.1-1_armhf.deb
  mkdir $PROJECT_DIR/.motion
  cp /etc/motion/motion.conf $PROJECT_DIR/.motion/motion.conf
}




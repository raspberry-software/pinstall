#!/bin/bash
#
# File:   software_raspberry_project_motion.sh
# Author: Rob@JavaDev
#
# Created on 25-Apr-2018, 11:50:31
#
#This Script unique ID
software_raspberry_project_motion=''
#Dependencies
#If the Unique ID of the script is not defined (the script has not been loaded yet) then source the script. If the script does not exist download it and then source again.
#The +x at the end of the variable is a parameter expansion and the expression returns true if the variable is unset
if [ -z ${software_raspberry_utils+x} ]; then
   [ -f software_raspberry_utils.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/utils/software_raspberry_utils.sh && . software_raspberry_utils.sh
fi
# 
if [ -z ${software_raspberry_project_motion_functions+x} ]; then
   [ -f software_raspberry_project_motion_functions.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/project/motion/functions/software_raspberry_project_motion_functions.sh && . software_raspberry_project_motion_functions.sh
fi
# Load node.js functions necessarily to install
if [ -z ${software_raspberry_node_functions+x} ]; then
   [ -f software_raspberry_node_functions.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/node/functions/software_raspberry_node_functions.sh && . software_raspberry_node_functions.sh
fi
#
# Main function
function main() {
  node::functions::install
  project::motion::functions::install
}

main
#!/bin/bash
#
# File:   raspberry.software.install.java.sh
# Author: Rob@JavaDev
#
# Created on 17-Mar-2018, 19:02:45
#
#This Script unique ID
software_raspberry_java=''
# Load Dependencies
#If the Unique ID of the script is not defined (means the script has not been loaded yet) then download the script file then source the script
#The +x at the end of the variable is a parameter expansion and the expression returns true if the variable is unset
if [ -z ${software_raspberry_utils+x} ]; then
   [ -f software_raspberry_utils.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/utils/software_raspberry_utils.sh && . software_raspberry_utils.sh
fi
# Load java functions necessarily to install
if [ -z ${software_raspberry_java_functions+x} ]; then
   [ -f software_raspberry_java_functions.sh ] || wget -q https://raw.githubusercontent.com/raspberry-software/pinstall/master/java/functions/software_raspberry_java_functions.sh && . software_raspberry_java_functions.sh
fi
#Force root beyond this line
function main() {
   utils::force_root
   readonly LOG_VERBOSE
   readonly LOG_FILE
   readonly DEFAULT_JAVA_HOME_DIR
   utils::log "Start Java install ..."
   java::functions::install
}

#================ End of Functions ==========

while getopts "hv:d:" opt; do
  case ${opt} in
    h )
      echo "Usage:"
      echo "-h"
      echo "-help : Display this help info."
      echo "-d <dir> : set JAVA_HOME directory. Default: /usr/java/latest"
      echo "-v             : Run in verbose mode"
      echo "-v <filename>  : Run in verbose mode and save output to file"
      exit 0
      ;;
    v )
      LOG_VERBOSE=true
      if [[ $OPTARG == /* ]] ; then
        LOG_FILE=$OPTARG
      fi
      ;;
    d )
      if [[ $OPTARG == /* ]] ; then
        JAVA_HOME_DIR=$OPTARG
      else
        echo "JAVA_HOME directory not valid"
        exit 1
      fi
      ;;
    \? )
      echo "Invalid Option: -$OPTARG" 1>&2
      exit 1
      ;;
  esac
done
shift $((OPTIND -1))

# Main function
main